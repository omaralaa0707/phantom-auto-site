"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Drives Lenis from GSAP's ticker rather than its own rAF loop, so smooth
 * scrolling and every ScrollTrigger share a single clock. Two loops reading
 * different frame times is what makes pinned sections jitter.
 */
export function ScrollProvider() {
  useEffect(() => {
    if (prefersReducedMotion()) {
      // Native scrolling only. ScrollTrigger still works off real scroll events.
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices keep native momentum; forcing Lenis there feels laggy.
      syncTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      // GSAP ticker reports seconds, Lenis expects milliseconds.
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Late-loading fonts and images change layout; recompute trigger positions.
    const onLoad = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(onLoad);
    window.addEventListener("load", onLoad);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}
