"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Browser-only values read the React 19 way.
 *
 * Reading `matchMedia` or `scrollY` into state from inside an effect causes a
 * cascading second render on every mount (and trips
 * `react-hooks/set-state-in-effect`). `useSyncExternalStore` subscribes
 * properly, stays correct through hydration, and returns a safe server value.
 */

function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** True when the visitor has asked the OS to reduce motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True once the page has been scrolled past `threshold` pixels. */
export function useScrolledPast(threshold: number): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("scroll", onChange, { passive: true });
    return () => window.removeEventListener("scroll", onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > threshold,
    () => false
  );
}
