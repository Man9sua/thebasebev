"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

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
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
  );

  return observer;
}

type RevealFrom = "bottom" | "left" | "right";

const OFFSET: Record<RevealFrom, (distance: number) => string> = {
  bottom: (distance) => `translate3d(0, ${distance}px, 0)`,
  left: (distance) => `translate3d(${-distance}px, 0, 0)`,
  right: (distance) => `translate3d(${distance}px, 0, 0)`,
};

type RevealProps = {
  children: ReactNode;
  delay?: number;
  distance?: number;
  from?: RevealFrom;
  as?: ElementType;
  className?: string;
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
      data-revealed={visible ? "true" : "false"}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : OFFSET[from](distance),
        transition: `opacity var(--reveal-dur, var(--tbb-dur-slow)) var(--tbb-ease) ${delay}ms, transform var(--reveal-dur, var(--tbb-dur-slow)) var(--tbb-ease) ${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
