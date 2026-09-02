"use client";

import { Surge, ChargeRule } from "@/components/motion/surge";
import { cn } from "@/lib/utils";

/**
 * Every section opens the same way: a short plate label, the heading, the
 * sentence that explains where the material came from, and the light bar.
 */
export function SectionHead({
  eyebrow,
  heading,
  intro,
  tone = "light",
  rule = true,
  className,
}: {
  eyebrow: string;
  heading: string;
  intro?: string;
  tone?: "light" | "dark";
  rule?: boolean;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={className}>
      <Surge as="header" className="max-w-4xl">
        <p className={cn("plate-label", dark ? "text-gold" : "text-gold-lo")}>{eyebrow}</p>
        <h2
          className={cn(
            "mt-4 font-display text-display font-bold uppercase leading-[1.02] tracking-[-0.015em]",
            dark ? "text-chalk" : "text-ink"
          )}
        >
          {heading}
        </h2>
        {intro ? (
          <p
            className={cn(
              "mt-5 max-w-2xl text-lead leading-relaxed",
              dark ? "text-chalk-2" : "text-ink-2"
            )}
          >
            {intro}
          </p>
        ) : null}
      </Surge>
      {rule ? <ChargeRule className="mt-9" delay={80} /> : null}
    </div>
  );
}
