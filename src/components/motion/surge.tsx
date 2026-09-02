"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * This site's arrival: power-on. Nothing slides in from anywhere and nothing
 * is wiped away to reveal what is underneath — an element strikes like a
 * filament, overshoots, drops most of the way back, and settles.
 *
 * The reveal is driven by a `data-seen` attribute written straight to the DOM
 * rather than React state: there is nothing for React to re-render, and it
 * keeps the observer out of the render cycle entirely.
 *
 * The observer watches the same element the animation runs on, which is only
 * safe because the animation touches opacity and transform. Animating
 * clip-path here would collapse the intersection rectangle to zero and the
 * observer would never fire.
 */
export function useOnScreen<T extends HTMLElement>(rootMargin = "-12% 0px -8% 0px") {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reveal = () => node.setAttribute("data-seen", "");
    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [rootMargin]);

  return ref;
}

const delayVar = (delay: number) => ({ "--surge-delay": `${delay}ms` }) as CSSProperties;

export function Surge({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  id?: string;
}) {
  const ref = useOnScreen<HTMLElement>();

  return (
    <Tag ref={ref} id={id} data-surge="" className={className} style={delayVar(delay)}>
      {children}
    </Tag>
  );
}

/**
 * The rule that runs under every heading: the same full-width tail-light bar
 * these cars wear, charging from its leading edge.
 */
export function ChargeRule({
  className,
  delay = 0,
  thickness = 2,
}: {
  className?: string;
  delay?: number;
  thickness?: number;
}) {
  const ref = useOnScreen<HTMLDivElement>();

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-bar=""
      className={cn("light-bar w-full origin-[left_center] rtl:origin-[right_center]", className)}
      style={{ height: thickness, ...delayVar(delay) }}
    />
  );
}
