/**
 * A real-time incompressible-fluid solver on the GPU, in raw WebGL2.
 *
 * Phantom Auto sell current, so the hero *is* current: a velocity field the
 * visitor can push with the pointer, advected and projected divergence-free
 * every frame, carrying a dye field that lights their own photograph.
 *
 * The pipeline per step is the textbook one — advect velocity, compute curl,
 * apply vorticity confinement, take the divergence, solve for pressure with
 * a Jacobi relaxation, subtract the pressure gradient, then advect the dye
 * through the corrected field. Everything lives in half-float render targets
 * and ping-pongs between two attachments.
 *
 * Written against WebGL2 directly rather than three.js: the whole thing is
 * eight fragment programs over one full-screen triangle, and the render-target
 * juggling is clearer without a scene graph in the way.
 */

export type FluidOptions = {
  simRes: number;
  dyeRes: number;
  pressureIterations: number;
  velocityDissipation: number;
  densityDissipation: number;
  pressureDissipation: number;
  curlStrength: number;
  splatRadius: number;
  displace: number;
};

export const DEFAULT_OPTIONS: FluidOptions = {
  simRes: 128,
  dyeRes: 512,
  pressureIterations: 18,
  velocityDissipation: 2.2,
  densityDissipation: 1.45,
  pressureDissipation: 0.8,
  curlStrength: 26,
  splatRadius: 0.2,
  displace: 1,
};

const VERT = `#version 300 es
precision highp float;
in vec2 aPos;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 uTexel;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vL = vUv - vec2(uTexel.x, 0.0);
  vR = vUv + vec2(uTexel.x, 0.0);
  vT = vUv + vec2(0.0, uTexel.y);
  vB = vUv - vec2(0.0, uTexel.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const F_HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
`;

const SPLAT = `${F_HEAD}
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec3 uColor;
uniform vec2 uPoint;
uniform float uRadius;
void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(base + splat, 1.0);
}`;

const ADVECTION = `${F_HEAD}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform vec2 uDyeTexelSize;
uniform float uDt;
uniform float uDissipation;

// Manual bilinear fetch so the dye can be advected at a higher resolution
// than the velocity field without smearing on the texel boundaries.
vec4 bilerp(sampler2D tex, vec2 uv, vec2 texelSize) {
  vec2 st = uv / texelSize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture(tex, (iuv + vec2(0.5, 0.5)) * texelSize);
  vec4 b = texture(tex, (iuv + vec2(1.5, 0.5)) * texelSize);
  vec4 c = texture(tex, (iuv + vec2(0.5, 1.5)) * texelSize);
  vec4 d = texture(tex, (iuv + vec2(1.5, 1.5)) * texelSize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main() {
  vec2 coord = vUv - uDt * bilerp(uVelocity, vUv, uTexelSize).xy * uTexelSize;
  vec4 result = bilerp(uSource, coord, uDyeTexelSize);
  float decay = 1.0 + uDissipation * uDt;
  fragColor = result / decay;
}`;

const DIVERGENCE = `${F_HEAD}
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  // Free-slip walls: reflect the sampled component at the boundary.
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  fragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const CURL = `${F_HEAD}
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  fragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

const VORTICITY = `${F_HEAD}
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uCurlStrength;
uniform float uDt;
void main() {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;

  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uCurlStrength * C;
  force.y *= -1.0;

  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity += force * uDt;
  velocity = clamp(velocity, -1000.0, 1000.0);
  fragColor = vec4(velocity, 0.0, 1.0);
}`;

const PRESSURE = `${F_HEAD}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  fragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = `${F_HEAD}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity -= vec2(R - L, T - B);
  fragColor = vec4(velocity, 0.0, 1.0);
}`;

const CLEAR = `${F_HEAD}
uniform sampler2D uTexture;
uniform float uValue;
void main() {
  fragColor = uValue * texture(uTexture, vUv);
}`;

/**
 * Composite. Their photograph sits underneath, held cool and flat until the
 * current reaches it: dye density restores saturation and contrast, the
 * velocity field displaces the sampling point so the paint ripples along the
 * flow, and the dye's own colour is added on top as light.
 */
const DISPLAY = `${F_HEAD}
uniform sampler2D uDye;
uniform sampler2D uVelocity;
uniform sampler2D uPhoto;
uniform vec2 uCoverScale;
uniform vec2 uCoverOffset;
uniform float uDisplace;
uniform float uReveal;
uniform vec3 uTint;

void main() {
  vec2 vel = texture(uVelocity, vUv).xy;
  vec3 dye = texture(uDye, vUv).rgb;
  float density = clamp(max(dye.r, max(dye.g, dye.b)), 0.0, 1.4);

  vec2 uv = vUv * uCoverScale + uCoverOffset;
  // Velocity is in simulation units and runs to the hundreds, so the ripple
  // needs a very small coefficient — anything larger tears the photograph
  // into liquid smears instead of rippling its paint.
  uv += vel * 0.00004 * uDisplace * smoothstep(0.0, 0.3, density);
  uv = clamp(uv, 0.0005, 0.9995);

  vec3 photo = texture(uPhoto, uv).rgb;
  float lum = dot(photo, vec3(0.2126, 0.7152, 0.0722));

  // Resting state: the frame is still legible, just cooled and calmed —
  // pulled toward the page's haze and held back from full saturation.
  vec3 rest = mix(vec3(lum), photo, 0.68);
  rest = mix(rest, uTint, 0.10);
  rest = rest * 0.96 + 0.018;

  float charge = smoothstep(0.02, 0.5, density) * uReveal;
  vec3 col = mix(rest, photo, charge);

  // The current's own light, warm on top of a cool frame.
  col += dye * 0.5 * uReveal;
  col = col / (1.0 + max(vec3(0.0), col - 1.0));

  fragColor = vec4(col, 1.0);
}`;

type Program = {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
};

type Target = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
};

type DoubleTarget = {
  read: Target;
  write: Target;
  swap: () => void;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
};

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader: ${log}`);
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, fragSource: string): Program {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSource);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "aPos");
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`program: ${gl.getProgramInfoLog(program)}`);
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < count; i++) {
    const name = gl.getActiveUniform(program, i)!.name;
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  return { program, uniforms };
}

/**
 * True when this context can render into the half-float targets the solver
 * needs. `use-webgl-health` only catches a context that was created and then
 * lost; this catches one that exists but cannot do the work.
 */
export function supportsFluid(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    }) as WebGL2RenderingContext | null;
  } catch {
    return null;
  }
  if (!gl) return null;
  if (!gl.getExtension("EXT_color_buffer_float")) return null;
  // Half-float linear filtering is core in WebGL2, but a driver can still
  // refuse the RG16F attachment. Prove one is complete before committing.
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, 4, 4, 0, gl.RG, gl.HALF_FLOAT, null);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(fbo);
  gl.deleteTexture(tex);
  return ok ? gl : null;
}

export class FluidField {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private opts: FluidOptions;
  private programs!: Record<string, Program>;
  private vao!: WebGLVertexArrayObject;
  private velocity!: DoubleTarget;
  private dye!: DoubleTarget;
  private pressure!: DoubleTarget;
  private divergence!: Target;
  private curl!: Target;
  private photo: WebGLTexture | null = null;
  private photoAspect = 1;
  private disposed = false;
  /** Set to 0 while the hero is offscreen so the solver idles cheaply. */
  reveal = 0;
  tint: [number, number, number] = [0.91, 0.925, 0.933];

  constructor(
    canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    options: Partial<FluidOptions> = {}
  ) {
    this.canvas = canvas;
    this.gl = gl;
    this.opts = { ...DEFAULT_OPTIONS, ...options };

    this.programs = {
      splat: link(gl, SPLAT),
      advection: link(gl, ADVECTION),
      divergence: link(gl, DIVERGENCE),
      curl: link(gl, CURL),
      vorticity: link(gl, VORTICITY),
      pressure: link(gl, PRESSURE),
      gradient: link(gl, GRADIENT),
      clear: link(gl, CLEAR),
      display: link(gl, DISPLAY),
    };

    // One full-screen triangle-pair, shared by every pass.
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.vao = vao;

    this.initTargets();
  }

  private makeTarget(w: number, h: number, internal: number, format: number): Target {
    const gl = this.gl;
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return { texture, fbo, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h };
  }

  private makeDouble(w: number, h: number, internal: number, format: number): DoubleTarget {
    const a = this.makeTarget(w, h, internal, format);
    const b = this.makeTarget(w, h, internal, format);
    return {
      read: a,
      write: b,
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      swap() {
        const t = this.read;
        this.read = this.write;
        this.write = t;
      },
    };
  }

  private dims(res: number) {
    const aspect = this.canvas.width / Math.max(1, this.canvas.height);
    const min = Math.round(res);
    const max = Math.round(res * (aspect > 1 ? aspect : 1 / aspect));
    return aspect > 1 ? { w: max, h: min } : { w: min, h: max };
  }

  private initTargets() {
    const gl = this.gl;
    const sim = this.dims(this.opts.simRes);
    const dye = this.dims(this.opts.dyeRes);
    this.velocity = this.makeDouble(sim.w, sim.h, gl.RG16F, gl.RG);
    this.dye = this.makeDouble(dye.w, dye.h, gl.RGBA16F, gl.RGBA);
    this.pressure = this.makeDouble(sim.w, sim.h, gl.R16F, gl.RED);
    this.divergence = this.makeTarget(sim.w, sim.h, gl.R16F, gl.RED);
    this.curl = this.makeTarget(sim.w, sim.h, gl.R16F, gl.RED);
  }

  private destroyTargets() {
    const gl = this.gl;
    const all: Target[] = [
      this.velocity.read,
      this.velocity.write,
      this.dye.read,
      this.dye.write,
      this.pressure.read,
      this.pressure.write,
      this.divergence,
      this.curl,
    ];
    for (const t of all) {
      gl.deleteTexture(t.texture);
      gl.deleteFramebuffer(t.fbo);
    }
  }

  setPhoto(image: HTMLImageElement) {
    const gl = this.gl;
    if (this.photo) gl.deleteTexture(this.photo);
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    this.photo = tex;
    this.photoAspect = image.naturalWidth / Math.max(1, image.naturalHeight);
  }

  resize(width: number, height: number) {
    if (this.disposed) return;
    if (this.canvas.width === width && this.canvas.height === height) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.destroyTargets();
    this.initTargets();
  }

  private blit(target: Target | null) {
    const gl = this.gl;
    if (target) {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private use(name: string) {
    const p = this.programs[name];
    this.gl.useProgram(p.program);
    return p;
  }

  private bind(unit: number, texture: WebGLTexture) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    return unit;
  }

  /**
   * Inject velocity and dye at a point. `x`/`y` are 0..1 in canvas space with
   * the origin bottom-left, matching the simulation's UV.
   */
  splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
    if (this.disposed) return;
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    const aspect = this.canvas.width / Math.max(1, this.canvas.height);

    const p = this.use("splat");
    gl.uniform1i(p.uniforms.uTarget!, this.bind(0, this.velocity.read.texture));
    gl.uniform1f(p.uniforms.uAspect!, aspect);
    gl.uniform2f(p.uniforms.uPoint!, x, y);
    gl.uniform3f(p.uniforms.uColor!, dx, dy, 0);
    gl.uniform1f(p.uniforms.uRadius!, (this.opts.splatRadius / 100) * (aspect > 1 ? 1 : 1));
    this.blit(this.velocity.write);
    this.velocity.swap();

    gl.uniform1i(p.uniforms.uTarget!, this.bind(0, this.dye.read.texture));
    gl.uniform3f(p.uniforms.uColor!, color[0], color[1], color[2]);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  step(dt: number) {
    if (this.disposed) return;
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    gl.disable(gl.BLEND);

    const setTexel = (p: Program, t: { texelSizeX: number; texelSizeY: number }) =>
      gl.uniform2f(p.uniforms.uTexel!, t.texelSizeX, t.texelSizeY);

    let p = this.use("curl");
    setTexel(p, this.velocity);
    gl.uniform1i(p.uniforms.uVelocity!, this.bind(0, this.velocity.read.texture));
    this.blit(this.curl);

    p = this.use("vorticity");
    setTexel(p, this.velocity);
    gl.uniform1i(p.uniforms.uVelocity!, this.bind(0, this.velocity.read.texture));
    gl.uniform1i(p.uniforms.uCurl!, this.bind(1, this.curl.texture));
    gl.uniform1f(p.uniforms.uCurlStrength!, this.opts.curlStrength);
    gl.uniform1f(p.uniforms.uDt!, dt);
    this.blit(this.velocity.write);
    this.velocity.swap();

    p = this.use("divergence");
    setTexel(p, this.velocity);
    gl.uniform1i(p.uniforms.uVelocity!, this.bind(0, this.velocity.read.texture));
    this.blit(this.divergence);

    p = this.use("clear");
    setTexel(p, this.pressure);
    gl.uniform1i(p.uniforms.uTexture!, this.bind(0, this.pressure.read.texture));
    gl.uniform1f(p.uniforms.uValue!, this.opts.pressureDissipation);
    this.blit(this.pressure.write);
    this.pressure.swap();

    p = this.use("pressure");
    setTexel(p, this.pressure);
    gl.uniform1i(p.uniforms.uDivergence!, this.bind(0, this.divergence.texture));
    for (let i = 0; i < this.opts.pressureIterations; i++) {
      gl.uniform1i(p.uniforms.uPressure!, this.bind(1, this.pressure.read.texture));
      this.blit(this.pressure.write);
      this.pressure.swap();
    }

    p = this.use("gradient");
    setTexel(p, this.velocity);
    gl.uniform1i(p.uniforms.uPressure!, this.bind(0, this.pressure.read.texture));
    gl.uniform1i(p.uniforms.uVelocity!, this.bind(1, this.velocity.read.texture));
    this.blit(this.velocity.write);
    this.velocity.swap();

    p = this.use("advection");
    setTexel(p, this.velocity);
    gl.uniform2f(p.uniforms.uTexelSize!, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform2f(p.uniforms.uDyeTexelSize!, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(p.uniforms.uVelocity!, this.bind(0, this.velocity.read.texture));
    gl.uniform1i(p.uniforms.uSource!, this.bind(1, this.velocity.read.texture));
    gl.uniform1f(p.uniforms.uDt!, dt);
    gl.uniform1f(p.uniforms.uDissipation!, this.opts.velocityDissipation);
    this.blit(this.velocity.write);
    this.velocity.swap();

    gl.uniform2f(p.uniforms.uDyeTexelSize!, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(p.uniforms.uVelocity!, this.bind(0, this.velocity.read.texture));
    gl.uniform1i(p.uniforms.uSource!, this.bind(1, this.dye.read.texture));
    gl.uniform1f(p.uniforms.uDissipation!, this.opts.densityDissipation);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  render() {
    if (this.disposed || !this.photo) return;
    const gl = this.gl;
    gl.bindVertexArray(this.vao);

    // Cover-fit the photograph inside whatever shape the canvas has taken.
    const canvasAspect = this.canvas.width / Math.max(1, this.canvas.height);
    let sx = 1;
    let sy = 1;
    if (canvasAspect > this.photoAspect) {
      sy = this.photoAspect / canvasAspect;
    } else {
      sx = canvasAspect / this.photoAspect;
    }

    const p = this.use("display");
    gl.uniform2f(p.uniforms.uTexel!, 1 / this.canvas.width, 1 / this.canvas.height);
    gl.uniform1i(p.uniforms.uDye!, this.bind(0, this.dye.read.texture));
    gl.uniform1i(p.uniforms.uVelocity!, this.bind(1, this.velocity.read.texture));
    gl.uniform1i(p.uniforms.uPhoto!, this.bind(2, this.photo));
    gl.uniform2f(p.uniforms.uCoverScale!, sx, sy);
    gl.uniform2f(p.uniforms.uCoverOffset!, (1 - sx) / 2, (1 - sy) / 2);
    gl.uniform1f(p.uniforms.uDisplace!, this.opts.displace);
    gl.uniform1f(p.uniforms.uReveal!, this.reveal);
    gl.uniform3f(p.uniforms.uTint!, this.tint[0], this.tint[1], this.tint[2]);
    this.blit(null);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const gl = this.gl;
    this.destroyTargets();
    if (this.photo) gl.deleteTexture(this.photo);
    for (const key of Object.keys(this.programs)) {
      gl.deleteProgram(this.programs[key].program);
    }
    gl.deleteVertexArray(this.vao);
  }
}
