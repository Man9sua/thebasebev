"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

/**
 * Scroll-triggered reveal.
 *
 * One shared `IntersectionObserver` for every instance on the page rather than
 * one per element, and each element unobserves itself once revealed — the cost
 * is the same whether the page has five of these or a hundred.
 *
 * The base render is deliberately visible. Once the browser confirms that an
 * observer is available, only elements still below the fold are armed for a
 * small compositor-only entrance. A missing API, failed callback or disabled
 * JavaScript therefore leaves ordinary readable document flow, never a blank
 * page.
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

/** Which edge the element settles in from. */
type RevealFrom = "bottom" | "left" | "right";

const OFFSET: Record<RevealFrom, (distance: number) => string> = {
  bottom: (distance) => `translate3d(0, ${distance}px, 0)`,
  left: (distance) => `translate3d(${-distance}px, 0, 0)`,
  right: (distance) => `translate3d(${distance}px, 0, 0)`,
};

type RevealProps = {
  children: ReactNode;
  /** Stagger within a group, in ms. */
  delay?: number;
  /** Distance travelled, in px. Keep it small — this is a settle, not a slide. */
  distance?: number;
  from?: RevealFrom;
  as?: ElementType;
  className?: string;
  /** Merged over the reveal's own inline style — for passing a stagger down. */
  style?: CSSProperties;
};

export function Reveal({
  children,
  delay = 0,
  distance = 28,
  from = "bottom",
  as: Tag = "div",
  className,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [pending, setPending] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // Content already in or close to the first viewport should never flash
    // visible, disappear after hydration, then animate back in.
    if (element.getBoundingClientRect().top <= window.innerHeight * 1.08) return;

    let current: IntersectionObserver;
    try {
      current = getObserver();
    } catch {
      return;
    }

    let safety = 0;
    const reveal: Registration = (nextVisible) => {
      if (!nextVisible) return;
      window.clearTimeout(safety);
      setRevealed(true);
    };

    registry.set(element, reveal);
    current.observe(element);
    const armFrame = requestAnimationFrame(() => setPending(true));

    // IntersectionObserver is an enhancement. Browser extensions, embedded
    // webviews and route teardown bugs must not be able to keep copy hidden.
    safety = window.setTimeout(() => reveal(true), 1_500);

    return () => {
      cancelAnimationFrame(armFrame);
      window.clearTimeout(safety);
      current.unobserve(element);
      registry.delete(element);
    };
  }, []);

  const visible = !pending || revealed;

  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal-state={visible ? "visible" : "pending"}
      // Published so a stylesheet can animate the element's own parts in step
      // with it — the rules that draw themselves out beside a flavour name have
      // nothing else to hang off.
      data-revealed={visible ? "true" : "false"}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : OFFSET[from](distance),
        // The duration is a variable so a caller can shorten it for a long
        // stagger, where the slow settle would still be running rows later.
        transition: `opacity var(--reveal-dur, var(--tbb-dur-slow)) var(--tbb-ease) ${delay}ms, transform var(--reveal-dur, var(--tbb-dur-slow)) var(--tbb-ease) ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
