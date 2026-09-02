"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePhantom } from "@/content/schema-ext";
import { FLEET, type FleetModel } from "@/content/media";
import { useLocale } from "@/i18n/locale-provider";
import { Surge } from "@/components/motion/surge";
import { SectionHead } from "./section-head";
import { cn } from "@/lib/utils";

/**
 * The selector is a tail-light bar. Every car in their feed wears one across
 * its tailgate, so the site's one piece of chrome is the same object: thirteen
 * segments, the live one burning, draggable end to end.
 */
function LightBarSelector({
  index,
  onChange,
  labels,
  ariaLabel,
}: {
  index: number;
  onChange: (next: number) => void;
  labels: string[];
  ariaLabel: string;
}) {
  const { dir } = useLocale();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  /** Set when a key moved the selection, so focus follows the roving tabindex. */
  const focusNext = useRef(false);

  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    const el = trackRef.current?.querySelector<HTMLButtonElement>(`#fleet-tab-${index}`);
    el?.focus();
  }, [index]);

  const move = (next: number) => {
    focusNext.current = true;
    onChange(next);
  };

  const fromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return index;
      const rect = el.getBoundingClientRect();
      let t = (clientX - rect.left) / rect.width;
      if (dir === "rtl") t = 1 - t;
      return Math.max(0, Math.min(labels.length - 1, Math.floor(t * labels.length)));
    },
    [dir, index, labels.length]
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      onChange(fromClientX(e.clientX));
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [fromClientX, onChange]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const fwd = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    if (e.key === back || e.key === "ArrowUp") {
      e.preventDefault();
      move(Math.max(0, index - 1));
    } else if (e.key === fwd || e.key === "ArrowDown") {
      e.preventDefault();
      move(Math.min(labels.length - 1, index + 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      move(0);
    } else if (e.key === "End") {
      e.preventDefault();
      move(labels.length - 1);
    }
  };

  return (
    <div
      ref={trackRef}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        dragging.current = true;
        onChange(fromClientX(e.clientX));
      }}
      className="relative flex h-11 w-full cursor-ew-resize touch-pan-y select-none items-stretch gap-[2px] rounded-full bg-ink p-[5px] sm:h-12"
    >
      {/* The gloss that makes a real light bar read as glass rather than paint. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 top-[5px] z-10 h-1/3 rounded-full bg-gradient-to-b from-chalk/18 to-transparent"
      />
      {labels.map((label, i) => {
        const active = i === index;
        return (
          <button
            key={label}
            type="button"
            role="tab"
            id={`fleet-tab-${i}`}
            aria-selected={active}
            aria-controls="fleet-panel"
            tabIndex={active ? 0 : -1}
            title={label}
            onClick={() => onChange(i)}
            className={cn(
              "relative min-w-0 flex-1 overflow-hidden rounded-[3px] transition-[background-color,box-shadow] duration-300",
              i === 0 && "rounded-s-full",
              i === labels.length - 1 && "rounded-e-full"
            )}
            style={{
              backgroundColor: active ? "#F42421" : "rgba(244,36,33,0.17)",
              boxShadow: active
                ? "0 0 14px rgba(244,36,33,0.85), 0 0 34px rgba(244,36,33,0.4)"
                : "none",
            }}
          >
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Badge({ tone, children }: { tone: "authorized" | "available"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "plate-label inline-flex items-center gap-2 border px-3 py-1.5",
        tone === "authorized"
          ? "border-gold-lo/40 bg-gold-lo/8 text-gold-lo"
          : "border-ink/15 text-ink-3"
      )}
    >
      {tone === "authorized" ? (
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold-lo" />
      ) : null}
      {children}
    </span>
  );
}

function Panel({ model }: { model: FleetModel }) {
  const c = usePhantom();
  const { locale } = useLocale();
  // The parent keys this component on the model id, so a new model remounts
  // it and the frame index resets on its own.
  const [frame, setFrame] = useState(0);

  const title = `${model.marque} ${model.name}`;
  const active = model.frames[Math.min(frame, model.frames.length - 1)];
  const translated = model.wrote !== locale;

  return (
    <div
      id="fleet-panel"
      role="tabpanel"
      aria-labelledby={`fleet-tab-${FLEET.indexOf(model)}`}
      className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-12"
    >
      <div
        key={`${model.id}-copy`}
        style={{ animation: "surge-in 760ms var(--ease-surge) both" }}
        className="self-start"
      >
        <h3 className="font-display text-[clamp(1.9rem,3.4vw,2.9rem)] font-bold uppercase leading-[1.02] tracking-[-0.02em] text-ink">
          <span className="block text-[0.42em] font-semibold tracking-[0.2em] text-gold-lo">
            <span dir="ltr" className="latin">
              {model.marque}
            </span>
          </span>
          <span dir="ltr" className="latin mt-1 flex items-baseline gap-3 rtl:justify-end">
            <span>{model.name}</span>
            {model.year ? (
              <span className="tnum text-[0.4em] font-semibold tracking-[0.14em] text-ink-3">
                {model.year}
              </span>
            ) : null}
          </span>
        </h3>

        <div className="mt-5 flex flex-wrap gap-2">
          {model.authorized ? (
            <Badge tone="authorized">{c.fleet.authorized}</Badge>
          ) : (
            <Badge tone="available">{c.fleet.available}</Badge>
          )}
        </div>

        <figure className="mt-7 border-s-2 border-volt ps-5">
          <p className="plate-label text-ink-3">{c.fleet.theirWords}</p>
          <blockquote className="mt-3 text-[clamp(1.05rem,1.5vw,1.28rem)] leading-relaxed text-ink">
            {c.fleet.lines[model.id]}
          </blockquote>
          {translated ? (
            <figcaption className="mt-3 text-[0.72rem] text-ink-3">
              {c.fleet.translatedFrom}
            </figcaption>
          ) : null}
        </figure>

        {model.figure ? (
          <div className="mt-7 flex items-baseline gap-3 border-t border-ink/12 pt-6">
            <span className="tnum latin font-display text-[clamp(2.2rem,4vw,3.2rem)] font-bold leading-none text-volt-lo">
              {model.figure.value}
            </span>
            {model.figure.unit ? (
              <span className="font-display text-[1rem] font-semibold uppercase tracking-[0.14em] text-ink-2">
                {model.figure.unit}
              </span>
            ) : null}
            <span className="ms-auto text-end plate-label text-ink-3">
              {c.fleet.figureLabels[model.figure.key]}
            </span>
          </div>
        ) : null}

        <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-ink/12 pt-5">
          {(["ext", "rear", "int", "det"] as const).map((role) => {
            const n = model.frames.filter((fr) => fr.role === role).length;
            if (!n) return null;
            return (
              <div key={role} className="flex items-baseline gap-2">
                <dt className="plate-label text-ink-3">{c.fleet.roles[role]}</dt>
                <dd className="tnum latin text-[0.8rem] font-semibold text-ink-2">
                  {String(n).padStart(2, "0")}
                </dd>
              </div>
            );
          })}
        </dl>

        <a
          href={model.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex w-fit items-center gap-2 pt-8 font-display text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink-2 transition-colors duration-200 hover:text-volt-lo"
        >
          {c.fleet.viewPost}
          <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180">
            →
          </span>
        </a>
      </div>

      <div key={`${model.id}-media`} style={{ animation: "surge-in 900ms var(--ease-surge) 80ms both" }}>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-haze-2 sm:aspect-[16/10]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={active.src}
            src={active.src}
            alt={`${title} — ${c.fleet.roles[active.role]}, ${c.fleet.altPrefix}`}
            className="h-full w-full object-cover"
            style={{ animation: "surge-in 700ms var(--ease-surge) both" }}
            decoding="async"
          />
          <span
            aria-hidden="true"
            className="light-bar absolute inset-x-0 bottom-0"
            style={{ height: 3 }}
          />
          <p className="plate-label absolute bottom-5 end-5 bg-ink/80 px-3 py-1.5 text-chalk backdrop-blur-sm">
            {c.fleet.roles[active.role]}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {model.frames.map((f, i) => (
            <button
              key={f.src}
              type="button"
              onClick={() => setFrame(i)}
              aria-label={`${title} — ${c.fleet.roles[f.role]}`}
              aria-pressed={i === frame}
              className={cn(
                "relative aspect-square overflow-hidden border transition-colors duration-200",
                i === frame ? "border-volt" : "border-transparent hover:border-ink/25"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.src}
                alt=""
                aria-hidden="true"
                className={cn(
                  "h-full w-full object-cover transition-[filter,opacity] duration-300",
                  i === frame ? "opacity-100" : "opacity-70 saturate-50 hover:opacity-100 hover:saturate-100"
                )}
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Fleet() {
  const c = usePhantom();
  const [index, setIndex] = useState(3);
  const labels = useMemo(() => FLEET.map((m) => `${m.marque} ${m.name}`), []);
  const model = FLEET[index];

  return (
    <section id="fleet" className="bg-haze">
      <div className="mx-auto max-w-[112rem] px-5 py-20 sm:px-8 sm:py-28">
        <SectionHead
          eyebrow={c.fleet.eyebrow}
          heading={c.fleet.heading}
          intro={c.fleet.intro}
        />

        <Surge as="div" delay={120} className="mt-10">
          <LightBarSelector
            index={index}
            onChange={setIndex}
            labels={labels}
            ariaLabel={c.fleet.barLabel}
          />
          <div className="mt-3 flex items-baseline justify-between gap-4">
            <p className="text-[0.74rem] text-ink-3">{c.fleet.barHint}</p>
            <p className="latin tnum text-[0.74rem] font-semibold text-ink-2">
              {String(index + 1).padStart(2, "0")} / {FLEET.length}
            </p>
          </div>
        </Surge>

        <div className="mt-12 sm:mt-14">
          <Panel key={model.id} model={model} />
        </div>
      </div>
    </section>
  );
}
