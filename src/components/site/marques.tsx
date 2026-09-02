"use client";

import { usePhantom } from "@/content/schema-ext";
import { FLEET, MARQUES } from "@/content/media";
import { Surge } from "@/components/motion/surge";
import { SectionHead } from "./section-head";
import { cn } from "@/lib/utils";

/** Marque names as they appear on the cars, normalised for matching. */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const inFeed = new Set(FLEET.map((m) => norm(m.marque)));

/** Marques with cars in the feed that the bio does not name. */
const UNLISTED_ORDER = ["BYD", "Lynk & Co", "Changan", "DEEPAL"];
const UNLISTED = Array.from(
  new Set(FLEET.map((m) => m.marque).filter((m) => !MARQUES.some((b) => norm(b) === norm(m))))
).sort((a, b) => UNLISTED_ORDER.indexOf(a) - UNLISTED_ORDER.indexOf(b));

function Plate({
  name,
  present,
  models,
  label,
}: {
  name: string;
  present: boolean;
  models: string[];
  label: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex min-h-[7.5rem] flex-col justify-between overflow-hidden border p-5 transition-colors duration-300 sm:min-h-[9rem]",
        present
          ? "border-chalk/18 bg-slate-2/60 hover:border-chalk/35"
          : "border-chalk/8 bg-transparent"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "latin text-[1.15rem] font-bold uppercase leading-tight tracking-[0.04em] sm:text-[1.4rem]",
            present ? "text-chalk" : "text-chalk-2/80"
          )}
        >
          {name}
        </span>
        {present ? (
          <span
            aria-hidden="true"
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-volt"
            style={{ boxShadow: "0 0 10px rgba(244,36,33,0.9)" }}
          />
        ) : null}
      </div>

      <div className="mt-6">
        {present ? (
          <p className="latin text-[0.82rem] font-medium leading-snug text-chalk-2">
            {models.join(" · ")}
          </p>
        ) : null}
        <p className={cn("plate-label mt-2", present ? "text-gold" : "text-chalk-2/80")}>
          {label}
        </p>
      </div>

      {/* Current running along the plate's lower edge on hover. */}
      <span
        aria-hidden="true"
        className={cn(
          "running-current absolute inset-x-0 bottom-0 h-[2px] opacity-0 transition-opacity duration-300",
          present && "group-hover:opacity-100"
        )}
      />
    </div>
  );
}

export function Marques() {
  const c = usePhantom();

  return (
    <section id="marques" className="on-dark bg-slate text-chalk">
      <div className="mx-auto max-w-[112rem] px-5 py-20 sm:px-8 sm:py-28">
        <SectionHead
          eyebrow={c.marques.eyebrow}
          heading={c.marques.heading}
          intro={c.marques.intro}
          tone="dark"
        />

        <Surge as="div" delay={100} className="mt-10 grid grid-cols-2 gap-px bg-chalk/8 sm:grid-cols-4">
          {MARQUES.map((m) => {
            const present = inFeed.has(norm(m));
            const models = FLEET.filter((f) => norm(f.marque) === norm(m)).map((f) => f.name);
            return (
              <div key={m} className="bg-slate">
                <Plate
                  name={m}
                  present={present}
                  models={models}
                  label={present ? c.marques.hasCars : c.marques.listedOnly}
                />
              </div>
            );
          })}
        </Surge>

        <Surge as="div" delay={160} className="mt-12 grid gap-8 border-t border-chalk/12 pt-10 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          <div>
            <h3 className="font-display text-section font-semibold uppercase tracking-[0.02em] text-chalk">
              {c.marques.alsoHeading}
            </h3>
            <ul className="mt-5 flex flex-wrap gap-2">
              {UNLISTED.map((m) => (
                <li
                  key={m}
                  className="latin border border-gold/40 px-3 py-1.5 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-gold"
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4 text-lead leading-relaxed text-chalk-2">
            <p>{c.marques.alsoNote}</p>
            <p className="text-[0.85rem] text-chalk-2/80">{c.marques.note}</p>
          </div>
        </Surge>
      </div>
    </section>
  );
}
