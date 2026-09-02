"use client";

import { usePhantom } from "@/content/schema-ext";
import { Surge, ChargeRule } from "@/components/motion/surge";
import { SectionHead } from "./section-head";

function Cell({
  value,
  unit,
  label,
  source,
  delay,
}: {
  value: string;
  unit: string;
  label: string;
  source: string;
  delay: number;
}) {
  return (
    <div className="relative bg-slate px-5 py-8 sm:px-7 sm:py-10">
      <ChargeRule className="absolute inset-x-0 top-0" delay={delay} thickness={3} />
      <Surge delay={delay + 90}>
        <p className="flex items-baseline gap-2">
          <span className="tnum latin font-display text-[clamp(2.6rem,5.6vw,4.2rem)] font-bold leading-none text-chalk">
            {value}
          </span>
          {unit ? (
            <span className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.16em] text-gold">
              {unit}
            </span>
          ) : null}
        </p>
        <p className="mt-4 text-[0.95rem] leading-snug text-chalk-2">{label}</p>
        <p className="plate-label mt-3 text-chalk-2/80">{source}</p>
      </Surge>
    </div>
  );
}

export function Figures() {
  const c = usePhantom();

  return (
    <section id="figures" className="on-dark bg-slate text-chalk">
      <div className="mx-auto max-w-[112rem] px-5 py-20 sm:px-8 sm:py-28">
        {/* No section rule here: the four cells' own charge bars line up into
            one segmented bar across the width, which is the rule. */}
        <SectionHead
          eyebrow={c.figures.eyebrow}
          heading={c.figures.heading}
          intro={c.figures.intro}
          tone="dark"
          rule={false}
        />

        <div className="mt-12 grid grid-cols-1 gap-px bg-chalk/10 sm:grid-cols-2 lg:grid-cols-4">
          {c.figures.cells.map((cell, i) => (
            <Cell key={cell.label} {...cell} delay={i * 110} />
          ))}
        </div>

        <Surge as="figure" delay={140} className="mt-16 max-w-5xl sm:mt-20">
          <blockquote className="font-display text-[clamp(1.3rem,2.9vw,2.35rem)] font-semibold leading-[1.25] tracking-[-0.01em] text-chalk">
            <span aria-hidden="true" className="text-volt">“</span>
            {c.claim.quote}
            <span aria-hidden="true" className="text-volt">”</span>
          </blockquote>
          <figcaption className="plate-label mt-6 text-gold">{c.claim.attribution}</figcaption>
        </Surge>
      </div>
    </section>
  );
}
