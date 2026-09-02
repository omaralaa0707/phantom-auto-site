"use client";

import { usePhantom } from "@/content/schema-ext";
import { EVENTS } from "@/content/media";
import { Surge } from "@/components/motion/surge";
import { SectionHead } from "./section-head";

const POSTER: Record<string, string> = {
  "auto-center-point": "/media/event-auto-center-point.jpg",
  "green-friday": "/media/event-green-friday.jpg",
};

export function Shows() {
  const c = usePhantom();

  return (
    <section id="shows" className="bg-haze">
      <div className="mx-auto max-w-[112rem] px-5 py-20 sm:px-8 sm:py-28">
        <SectionHead
          eyebrow={c.events.eyebrow}
          heading={c.events.heading}
          intro={c.events.intro}
        />

        <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-10">
          {c.events.items.map((event, i) => {
            const post = EVENTS.find((e) => e.id === event.id)?.postUrl;
            return (
              <Surge
                key={event.id}
                as="article"
                delay={i * 120}
                className="group grid gap-6 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-haze-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={POSTER[event.id]}
                    alt={event.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <span aria-hidden="true" className="light-bar absolute inset-x-0 bottom-0 h-[3px]" />
                </div>

                <div className="flex flex-col">
                  <p className="plate-label text-volt-lo">{event.role}</p>
                  <h3 className="mt-3 font-display text-[clamp(1.15rem,2vw,1.55rem)] font-bold uppercase leading-tight tracking-[-0.01em] text-ink">
                    {event.title}
                  </h3>
                  <dl className="mt-5 space-y-3 border-t border-ink/12 pt-5 text-[0.92rem]">
                    <div className="flex gap-4">
                      <dt className="plate-label w-20 shrink-0 pt-1 text-ink-3">
                        {c.events.labels.dates}
                      </dt>
                      <dd className="tnum text-ink">{event.dates}</dd>
                    </div>
                    <div className="flex gap-4">
                      <dt className="plate-label w-20 shrink-0 pt-1 text-ink-3">
                        {c.events.labels.venue}
                      </dt>
                      <dd className="text-ink">{event.venue}</dd>
                    </div>
                    {event.detail ? (
                      <div className="flex gap-4">
                        <dt className="plate-label w-20 shrink-0 pt-1 text-ink-3">
                          {c.events.labels.stand}
                        </dt>
                        <dd className="latin text-ink">{event.detail}</dd>
                      </div>
                    ) : null}
                  </dl>
                  {post ? (
                    <a
                      href={post}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex w-fit items-center gap-2 pt-6 font-display text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink-2 transition-colors duration-200 hover:text-volt-lo"
                    >
                      {c.events.viewPost}
                      <span aria-hidden="true" className="rtl:rotate-180">→</span>
                    </a>
                  ) : null}
                </div>
              </Surge>
            );
          })}
        </div>
      </div>
    </section>
  );
}
