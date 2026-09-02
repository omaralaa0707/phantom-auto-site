"use client";

import { useCallback, useState } from "react";

/**
 * Browsers cap how many live WebGL contexts a page (and the GPU process) will
 * hold, and they drop the oldest ones without warning. A canvas whose context
 * has been lost keeps its layout box but renders nothing — an entire section
 * silently goes blank. This tracks that state so the caller can fall back to
 * plain images instead.
 */
export function useWebglHealth() {
  const [lost, setLost] = useState(false);

  const bind = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const onLost = (e: Event) => {
      // Preventing the default lets the browser attempt a restore.
      e.preventDefault();
      setLost(true);
    };
    const onRestored = () => setLost(false);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
  }, []);

  return { lost, bind };
}
