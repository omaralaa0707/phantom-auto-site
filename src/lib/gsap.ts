"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Registration is idempotent, but guard for SSR: ScrollTrigger touches window.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/** Matches --ease-out-expo in globals.css so CSS and JS motion agree. */
export const EASE_OUT_EXPO = "expo.out";
export const EASE_OUT_QUART = "quart.out";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, useGSAP };
