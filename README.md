# Phantom Auto — site 08 of 46

A concept site built entirely from this dealership's own published material.
**Not affiliated with Phantom Auto, and not an official site.**

- **Live:** https://phantom-auto-site.vercel.app
- **Repo:** [phantom-auto-site](https://github.com/omaralaa0707/phantom-auto-site)

## What this page is about

Every site in this series is built around something true and checkable about
the dealer's own account — a pattern in what they publish, a contradiction
between two of their channels, or a fact about their showroom — rather than
around a generic template. The palette, type, 3D piece and motion below were
all chosen to serve that finding.

## Design record

**Palette**
: Cool bleached dusk sky (haze #E8ECEE) — the first *cool* light ground in the set — over asphalt #161A1E, with their sampled gold #D2B569 and the tail-light red #F42421 lifted from the BYD Han L's rear bar

**Type pairing**
: Sora + Be Vietnam Pro / Changa (AR)

**3D / signature technique**
: Real-time incompressible-fluid solver in **raw WebGL2** (no three.js): advection, curl, vorticity confinement, divergence, an 18-step Jacobi pressure solve and gradient subtraction, ping-ponging half-float render targets; pointer and scroll inject velocity + dye, and the dye field restores saturation and ripples the paint on their own photograph

**Motion language**
: Power-on: elements strike like a filament, overshoot, drop and settle — nothing slides, nothing is wiped; a current runs along edges on hover, and one tail-light bar serves as scroll indicator, section rule and fleet selector

## Sources

Everything on the page was sourced from:

- Instagram: https://www.instagram.com/phantomauto.egypt/
- Google Maps: https://www.google.com/maps/search/?api=1&query=Phantom+Auto+Cairo

Photography belongs to the dealership (or, where their frames are watermarked
by an outside studio, to that studio) and is used here only to document their
own published material. No figure on the page is invented: anything the dealer
did not publish is marked as unpublished rather than estimated.

## Running it

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build — must pass before shipping
pnpm lint     # eslint, zero warnings
```

Requires `node-linker=hoisted` in `.npmrc` (already present) or three.js peer
deps fail to resolve.

## Structure

```
src/content/media.ts      verified facts and figures — the data layer
src/content/en.ts|ar.ts   all copy, both locales, identical shapes
src/content/schema-ext.ts the page-specific content contract
src/components/webgl/     the 3D piece
src/components/site/      the page composition
src/app/globals.css       palette tokens, type, RTL overrides, motion
```

Arabic/English toggle with full RTL. All CSS direction overrides key off
`[dir="rtl"]` (never `[lang]`) and live outside `@layer`. Every Latin or
numeric fragment inside Arabic copy is wrapped in `.latin` for correct bidi.

---

Part of a 46-site series. See the [top-level README](../README.md) for the full
index and [`TRACKING.md`](../TRACKING.md) for the differentiation log.
