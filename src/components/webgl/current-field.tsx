"use client";

import { useEffect, useRef, useState } from "react";
import { FluidField, supportsFluid } from "./fluid";
import { useWebglHealth } from "@/lib/use-webgl-health";
import { useReducedMotion } from "@/lib/use-browser";
import { cn } from "@/lib/utils";

/** Their tail-light red and their mark's gold, as linear-ish dye colours. */
const VOLT: [number, number, number] = [1.15, 0.16, 0.1];
const GOLD: [number, number, number] = [0.78, 0.6, 0.24];

type Pointer = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  down: boolean;
  moved: boolean;
};

export function CurrentField({
  src,
  srcNarrow,
  alt,
  className,
  fallbackClassName,
}: {
  src: string;
  /** A smaller encode of the same frame, loaded on phone-sized canvases. */
  srcNarrow?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { lost, bind } = useWebglHealth();
  const reduceMotion = useReducedMotion();
  // Starts false so the server and the first client render agree; the probe
  // flips it on only once we know this browser can actually do the work.
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    // A browser that refuses a context outright, or one whose driver cannot
    // render into half-float, must never reach the solver at all.
    const gl = supportsFluid(canvas);
    if (!gl) return;

    const narrow = window.innerWidth < 700;
    const frame = narrow && srcNarrow ? srcNarrow : src;
    const field = new FluidField(canvas, gl, {
      simRes: narrow ? 96 : 128,
      dyeRes: narrow ? 320 : 512,
      pressureIterations: narrow ? 12 : 18,
    });
    bind(canvas);
    setLive(true);

    const image = new Image();
    image.decoding = "async";
    let photoReady = false;
    image.onload = () => {
      field.setPhoto(image);
      photoReady = true;
    };
    image.src = frame;

    const dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 1.75);
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      field.resize(
        Math.max(2, Math.round(rect.width * dpr)),
        Math.max(2, Math.round(rect.height * dpr))
      );
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const pointer: Pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, down: false, moved: false };

    // The copy panel and its scrims sit above the canvas as siblings, so a
    // listener bound to the wrapper would never see the pointer once it
    // crossed one of them. Listen on the window and hit-test the rect instead.
    const toUv = (clientX: number, clientY: number) => {
      const rect = wrap.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return null;
      }
      return {
        x: (clientX - rect.left) / rect.width,
        y: 1 - (clientY - rect.top) / rect.height,
      };
    };

    const onMove = (e: PointerEvent) => {
      const uv = toUv(e.clientX, e.clientY);
      if (!uv) return;
      pointer.dx = (uv.x - pointer.x) * 5200;
      pointer.dy = (uv.y - pointer.y) * 5200;
      pointer.x = uv.x;
      pointer.y = uv.y;
      pointer.moved = true;
    };
    const onDown = (e: PointerEvent) => {
      const uv = toUv(e.clientX, e.clientY);
      if (!uv) return;
      pointer.x = uv.x;
      pointer.y = uv.y;
      pointer.down = true;
      pointer.moved = true;
      pointer.dx = 0;
      pointer.dy = 40;
    };
    const onUp = () => {
      pointer.down = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    // Scroll adds a lateral surge, so the field is already moving by the time
    // a visitor who never touches the hero has scrolled past it.
    let scrollSurge = 0;
    let lastScroll = window.scrollY;
    const onScroll = () => {
      const delta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      scrollSurge += delta;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(wrap);

    let raf = 0;
    let last = performance.now();
    let seedPhase = Math.random() * Math.PI * 2;
    let elapsed = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (!photoReady) return;
      if (!visible) return;
      elapsed += dt;

      // The reveal ramps once, so the frame lights up as the page arrives.
      field.reveal = Math.min(1, field.reveal + dt * 0.9);

      if (pointer.moved) {
        const speed = Math.hypot(pointer.dx, pointer.dy);
        const heat = Math.min(1, speed / 900);
        const gain = 0.28 + heat * 0.7;
        const colour: [number, number, number] = [
          VOLT[0] * gain,
          VOLT[1] * gain + GOLD[1] * heat * 0.2,
          VOLT[2] * gain + GOLD[2] * heat * 0.22,
        ];
        field.splat(pointer.x, pointer.y, pointer.dx, pointer.dy, colour);
        pointer.moved = false;
        pointer.dx *= 0.5;
        pointer.dy *= 0.5;
      }

      if (Math.abs(scrollSurge) > 0.5) {
        const push = Math.max(-620, Math.min(620, scrollSurge * 18));
        field.splat(0.5, 0.12, push, -Math.abs(push) * 0.2, [
          GOLD[0] * 0.3,
          GOLD[1] * 0.3,
          GOLD[2] * 0.3,
        ]);
        scrollSurge *= 0.35;
        if (Math.abs(scrollSurge) < 0.5) scrollSurge = 0;
      }

      // Ambient current bleeding up off the bottom edge, where a tail-light
      // bar would sit. Keeps the field alive without any input at all.
      seedPhase += dt * 0.55;
      const seedX = 0.5 + Math.sin(seedPhase) * 0.36;
      const wobble = Math.cos(seedPhase * 1.7) * 90;
      const warm = 0.5 + 0.5 * Math.sin(seedPhase * 0.6);
      field.splat(seedX, 0.02, wobble, 240, [
        (VOLT[0] * (1 - warm) + GOLD[0] * warm) * 0.22,
        (VOLT[1] * (1 - warm) + GOLD[1] * warm) * 0.22,
        (VOLT[2] * (1 - warm) + GOLD[2] * warm) * 0.22,
      ]);

      // One splat at the start so the frame is never a flat, dead plate.
      if (elapsed < 0.1) {
        field.splat(0.5, 0.4, 0, 420, [VOLT[0] * 0.3, VOLT[1] * 0.3, VOLT[2] * 0.3]);
      }

      field.step(dt);
      field.render();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      field.dispose();
      setLive(false);
    };
  }, [src, srcNarrow, bind, reduceMotion]);

  const showFallback = !live || lost || reduceMotion;

  return (
    <div ref={wrapRef} className={cn("relative isolate overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={srcNarrow ? `${srcNarrow} 900w, ${src} 2000w` : undefined}
        sizes="100vw"
        alt={alt}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
          showFallback ? "opacity-100" : "opacity-0",
          fallbackClassName
        )}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-1000",
          showFallback ? "opacity-0" : "opacity-100"
        )}
        style={{ touchAction: "pan-y" }}
      />
    </div>
  );
}
