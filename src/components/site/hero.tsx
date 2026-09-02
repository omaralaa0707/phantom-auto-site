"use client";

import { usePhantom } from "@/content/schema-ext";
import { HERO_FRAME, HERO_FRAME_SM, MARQUES, PROFILE } from "@/content/media";
import { CurrentField } from "@/components/webgl/current-field";
import { Surge, ChargeRule } from "@/components/motion/surge";

export function Hero() {
  const c = usePhantom();

  return (
    // On a phone the copy plate is tall enough to swallow an absolutely
    // positioned frame whole, so the field takes a fixed band at the top and
    // the plate flows beneath it. From `sm` up the plate floats over the
    // full-bleed frame.
    <section id="top" className="relative flex w-full flex-col overflow-hidden sm:min-h-svh">
      <CurrentField
        src={HERO_FRAME}
        srcNarrow={HERO_FRAME_SM}
        alt={c.hero.canvasAlt}
        className="relative h-[42svh] min-h-[15rem] w-full shrink-0 sm:absolute sm:inset-0 sm:h-full"
      />

      {/* Keeps the nav legible against whatever the current is doing under it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-haze via-haze/70 to-transparent"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[112rem] flex-1 flex-col justify-end px-0 pb-0 sm:min-h-svh sm:px-8 sm:pb-12">
        <div className="pointer-events-none absolute end-0 top-24 hidden max-w-[16rem] pe-8 ps-10 py-6 text-end lg:block">
          {/* The photograph runs under this rail, so it gets its own scrim. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-l from-haze via-haze/80 to-transparent rtl:bg-gradient-to-r"
          />
          <p className="plate-label text-gold-lo">{c.hero.marqueeLabel}</p>
          <ul className="mt-4 space-y-1.5">
            {MARQUES.map((m) => (
              <li
                key={m}
                className="latin text-[0.78rem] font-semibold tracking-[0.12em] text-ink-2"
              >
                {m.toUpperCase()}
              </li>
            ))}
          </ul>
        </div>

        <Surge
          as="div"
          className="relative w-full border border-ink/10 border-t-0 bg-haze px-5 pb-9 pt-8 sm:max-w-[47rem] sm:px-10 sm:pb-11 sm:pt-9"
        >
          <ChargeRule className="absolute inset-x-0 top-0" delay={120} thickness={3} />

          <p className="plate-label text-gold-lo">{c.hero.eyebrow}</p>

          {/* English stacks into two lines; Arabic sets on one, because a
              single short imperative stranded on its own line reads as a
              fragment rather than a headline. */}
          <h1 className="mt-4 font-display text-hero font-bold uppercase leading-[0.92] tracking-[-0.02em] rtl:leading-[1.24]">
            <span className="block text-ink rtl:inline rtl:ms-0 rtl:me-4">
              {c.hero.headlineLead}
            </span>
            <span className="block text-volt-lo rtl:inline">{c.hero.headlineAccent}</span>
          </h1>

          <p className="mt-5 max-w-[38rem] text-lead leading-relaxed text-ink-2">{c.hero.sub}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={PROFILE.phoneHref}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden bg-ink px-7 py-4 font-display text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-chalk"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-volt"
                style={{ animation: "idle-pulse 2.4s ease-in-out infinite" }}
              />
              {c.hero.primaryCta}
              <span
                aria-hidden="true"
                className="running-current absolute inset-x-0 bottom-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </a>
            <a
              href="#fleet"
              className="inline-flex items-center gap-2 border border-ink/25 px-7 py-4 font-display text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-ink transition-colors duration-200 hover:border-volt-lo hover:text-volt-lo"
            >
              {c.hero.secondaryCta}
            </a>
          </div>

          <p className="mt-6 text-[0.74rem] text-ink-3">{c.hero.canvasHint}</p>
        </Surge>
      </div>
    </section>
  );
}
