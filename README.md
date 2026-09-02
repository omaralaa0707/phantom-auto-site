# Phantom Auto — concept site

A concept design for [Phantom Auto](https://www.instagram.com/phantomauto.egypt/),
a verified new-energy dealership on the Suez road east of Cairo. **Not an
official site and not affiliated with them.** Every photograph, mark and quoted
line is theirs, taken from their own Instagram; nothing on the page claims
anything they did not publish themselves.

## The idea

Their whole feed is one shoot: thirteen cars on the same stretch of asphalt, in
the same half-hour of dusk light, and almost every rear frame shows the
full-width red tail-light bar this generation of cars wears. That bar is the
site's one piece of chrome — it is the scroll indicator, the section rule, and
the fleet selector.

- **Palette** — the hazy, cool dusk sky sampled from their frames, with their
  gold mark and a tail-light red taken from the BYD Han L's light bar.
- **Type** — Sora for display, Be Vietnam Pro for text, Changa for Arabic.
- **Motion** — power-on. Nothing slides; elements strike like a filament,
  overshoot and settle, and a current runs along edges on hover.

## The hero

`src/components/webgl/fluid.ts` is a real-time incompressible-fluid solver
written directly against WebGL2 — advection, curl, vorticity confinement,
divergence, a Jacobi pressure solve and gradient subtraction, all in half-float
render targets ping-ponging between two attachments. The pointer injects
velocity and dye into the field; the dye modulates their photograph, restoring
saturation and rippling the paint where the current runs.

It probes for a renderable `RG16F` attachment before it creates anything, and
falls back to the plain photograph when WebGL2, float render targets or the
context itself are unavailable, or when the visitor has asked for reduced
motion.

## Integrity rules the content follows

- The line under each car is the line **they** wrote in that car's own post,
  linked back to it. Where the locale differs from the language they wrote in,
  the page says so.
- The "Authorized dealer" badge appears only where their caption says it.
  Five of the thirteen models are simply "available now at Phantom Auto".
- Four marques in their bio have no car in the last forty posts, so they are
  listed as names with no photograph attached. Four marques in the feed are not
  in the bio, and the page says that too.

## Running it

```
pnpm install
pnpm dev
```
