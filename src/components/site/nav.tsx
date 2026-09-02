"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/locale-provider";
import { usePhantom } from "@/content/schema-ext";
import { PROFILE } from "@/content/media";
import { useScrolledPast } from "@/lib/use-browser";
import { cn } from "@/lib/utils";

/** The page's own charge indicator: scroll progress, drawn as a light bar. */
function PageCharge() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden="true" className="h-px w-full bg-haze-3/70">
      <div
        ref={ref}
        className="light-bar h-px w-full origin-[left_center] rtl:origin-[right_center]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

export function Mark({ className, tone = "ink" }: { className?: string; tone?: "ink" | "chalk" }) {
  const c = usePhantom();
  return (
    <span dir="ltr" className={cn("flex items-center gap-2.5", className)}>
      {/* An SVG in an <img> cannot inherit currentColor, so each tone is its
          own file with an explicit fill. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tone === "chalk" ? "/mark-chalk.svg" : "/mark-ink.svg"}
        alt=""
        aria-hidden="true"
        className="h-7 w-auto sm:h-8"
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[0.95rem] font-bold tracking-[0.2em] sm:text-[1.05rem]",
            tone === "chalk" ? "text-chalk" : "text-ink"
          )}
          style={{ fontWeight: 700 }}
        >
          PHANTOM
        </span>
        <span
          className={cn(
            "plate-label mt-1 text-[0.5rem] tracking-[0.5em]",
            tone === "chalk" ? "text-gold" : "text-gold-lo"
          )}
        >
          AUTO
        </span>
      </span>
      <span className="sr-only">{c.brand.name}</span>
    </span>
  );
}

export function Nav() {
  const { toggleLocale, locale } = useLocale();
  const c = usePhantom();
  const scrolled = useScrolledPast(24);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
    <a
      href="#fleet"
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:font-display focus:text-[0.8rem] focus:font-semibold focus:uppercase focus:tracking-[0.12em] focus:text-chalk"
    >
      {c.nav[1].label}
    </a>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled ? "bg-haze/90 backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[112rem] items-center gap-6 px-5 sm:h-[4.5rem] sm:px-8">
        <a href="#top" className="shrink-0" aria-label={c.brand.name}>
          <Mark />
        </a>

        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {c.nav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="plate-label text-ink-2 transition-colors duration-200 hover:text-volt-lo"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2 sm:gap-3 lg:ms-0">
          <a
            href={PROFILE.phoneHref}
            className="hidden items-center gap-2 rounded-full border border-ink/15 px-4 py-2 font-display text-[0.8rem] font-semibold tracking-[0.08em] text-ink transition-colors duration-200 hover:border-volt-lo hover:text-volt-lo sm:inline-flex"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-volt" />
            <span className="latin tnum">{PROFILE.phone}</span>
          </a>

          <button
            type="button"
            onClick={toggleLocale}
            className="rounded-full border border-ink/15 px-3.5 py-2 font-display text-[0.72rem] font-semibold tracking-[0.14em] text-ink transition-colors duration-200 hover:border-volt-lo hover:text-volt-lo"
            aria-label={c.a11y.toggleLanguage}
          >
            {locale === "ar" ? "EN" : "ع"}
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink lg:hidden"
            aria-expanded={open}
            aria-label={open ? c.a11y.closeMenu : c.a11y.openMenu}
          >
            <span aria-hidden="true" className="relative block h-3 w-4">
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-px bg-current transition-transform duration-300",
                  open && "translate-y-[6px] rotate-45"
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-[6px] h-px bg-current transition-opacity duration-200",
                  open && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-[12px] h-px bg-current transition-transform duration-300",
                  open && "-translate-y-[6px] -rotate-45"
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <PageCharge />

      <div
        className={cn(
          "overflow-hidden border-b border-ink/10 bg-haze/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col px-5 py-3">
          {c.nav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-ink/8 py-3.5 font-display text-[0.95rem] font-semibold text-ink last:border-0"
            >
              {link.label}
            </a>
          ))}
          <a
            href={PROFILE.phoneHref}
            className="mt-3 inline-flex items-center gap-2 font-display text-[0.95rem] font-semibold text-volt-lo"
          >
            <span className="latin tnum">{PROFILE.phone}</span>
          </a>
        </nav>
      </div>
    </header>
    </>
  );
}
