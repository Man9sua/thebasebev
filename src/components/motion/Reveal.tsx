"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * Scroll-triggered reveal.
 *
 * One shared `IntersectionObserver` for every instance on the page rather than
 * one per element, and each element unobserves itself once revealed — the cost
 * is the same whether the page has five of these or a hundred.
 *
 * The element renders in its final position with `opacity: 0` and a small
 * translate, so nothing reflows when it animates in: no layout shift, and the
 * work stays on the compositor.
 */

type Registration = (visible: boolean) => void;

let observer: IntersectionObserver | null = null;
const registry = new WeakMap<Element, Registration>();

function getObserver() {
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        registry.get(entry.target)?.(true);
        observer?.unobserve(entry.target);
        registry.delete(entry.target);
      }
    },
    // Start slightly before the element reaches the fold so it is already
    // settling by the time it is properly in view.
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
  );

  return observer;
}

type RevealProps = {
  children: ReactNode;
  /** Stagger within a group, in ms. */
  delay?: number;
  /** Distance travelled, in px. Keep it small — this is a settle, not a slide. */
  distance?: number;
  as?: ElementType;
  className?: string;
};

export function Reveal({
  children,
  delay = 0,
  distance = 28,
  as: Tag = "div",
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    registry.set(element, setVisible);
    const current = getObserver();
    current.observe(element);

    return () => {
      current.unobserve(element);
      registry.delete(element);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translate3d(0, ${distance}px, 0)`,
        transition: `opacity var(--tbb-dur-slow) var(--tbb-ease) ${delay}ms, transform var(--tbb-dur-slow) var(--tbb-ease) ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
