"use client";

import { usePhantom } from "@/content/schema-ext";
import { PLATE_WIDE, PROFILE } from "@/content/media";
import { Surge } from "@/components/motion/surge";
import { SectionHead } from "./section-head";
import { Mark } from "./nav";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-chalk/12 py-5">
      <dt className="plate-label text-gold">{label}</dt>
      <dd className="mt-2.5 text-[clamp(1.05rem,1.6vw,1.3rem)] leading-snug text-chalk">
        {children}
      </dd>
    </div>
  );
}

export function Showroom() {
  const c = usePhantom();

  return (
    <section id="showroom" className="on-dark relative bg-slate text-chalk">
      <div className="mx-auto max-w-[112rem] px-5 py-20 sm:px-8 sm:py-28">
        <SectionHead
          eyebrow={c.showroom.eyebrow}
          heading={c.showroom.heading}
          tone="dark"
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:gap-14">
          <Surge as="div" delay={80}>
            <dl>
              <Row label={c.contact.addressLabel}>{c.contact.address}</Row>
              <Row label={c.contact.phoneLabel}>
                <a
                  href={PROFILE.phoneHref}
                  className="latin tnum inline-flex items-center gap-2.5 transition-colors duration-200 hover:text-volt"
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-volt"
                    style={{ animation: "idle-pulse 2.4s ease-in-out infinite" }}
                  />
                  {c.contact.phones[0]}
                </a>
              </Row>
            </dl>

            <div className="mt-8 space-y-4 text-lead leading-relaxed text-chalk-2">
              {c.about.body.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
              <p className="text-chalk-2/80">{c.showroom.body[0]}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={c.contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-chalk px-6 py-3.5 font-display text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-ink transition-colors duration-200 hover:bg-gold"
              >
                {c.showroom.directionsCta}
              </a>
              <a
                href={PROFILE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-chalk/25 px-6 py-3.5 font-display text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-chalk transition-colors duration-200 hover:border-volt hover:text-volt"
              >
                {c.showroom.instagramCta}
              </a>
              <a
                href={PROFILE.links}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-chalk/25 px-6 py-3.5 font-display text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-chalk transition-colors duration-200 hover:border-volt hover:text-volt"
              >
                {c.showroom.linksCta}
              </a>
            </div>
          </Surge>

          <Surge as="div" delay={140} className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-2 lg:aspect-auto lg:h-full lg:min-h-[32rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PLATE_WIDE}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <span aria-hidden="true" className="light-bar absolute inset-x-0 bottom-0 h-[3px]" />
            </div>
          </Surge>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const c = usePhantom();

  return (
    <footer className="on-dark bg-ink text-chalk">
      <span aria-hidden="true" className="light-bar block h-[3px] w-full" />
      <div className="mx-auto max-w-[112rem] px-5 py-12 sm:px-8 sm:py-14">
        <div className="grid gap-10 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-16">
          <div>
            <Mark tone="chalk" />
            <p className="plate-label mt-5 text-gold">{c.brand.tagline}</p>
            <p className="mt-5 text-[0.86rem] leading-relaxed text-chalk-2">{c.contact.address}</p>
            <a
              href={PROFILE.phoneHref}
              className="latin tnum mt-2 inline-block text-[0.95rem] font-semibold text-chalk transition-colors duration-200 hover:text-volt"
            >
              {c.contact.phones[0]}
            </a>
          </div>
          <div className="space-y-6">
            <nav className="flex flex-wrap gap-x-7 gap-y-3">
              {c.nav.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="plate-label text-chalk-2 transition-colors duration-200 hover:text-volt"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={PROFILE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="plate-label text-chalk-2 transition-colors duration-200 hover:text-volt"
              >
                {c.showroom.instagramCta}
              </a>
              <a
                href={c.contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="plate-label text-chalk-2 transition-colors duration-200 hover:text-volt"
              >
                {c.showroom.directionsCta}
              </a>
            </nav>
            <div className="max-w-2xl space-y-3 border-t border-chalk/12 pt-6">
              <p className="plate-label text-chalk-2/80">{c.footer.rights}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
