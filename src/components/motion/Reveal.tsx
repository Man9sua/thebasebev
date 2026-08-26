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
