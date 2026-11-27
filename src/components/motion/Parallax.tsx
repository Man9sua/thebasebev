"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Item = {
  el: HTMLElement;
  speed: number;
  visible: boolean;
};

const items = new Set<Item>();
let frame = 0;
let observer: IntersectionObserver | null = null;
const byElement = new WeakMap<Element, Item>();

function tick() {
  const viewport = window.innerHeight;

  for (const item of items) {
    if (!item.visible) continue;

    const rect = item.el.getBoundingClientRect();
    const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport;
    const shift = -progress * item.speed * 100;
    item.el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
  }

  frame = items.size > 0 ? requestAnimationFrame(tick) : 0;
}

function ensureRunning() {
  if (!frame && items.size > 0) frame = requestAnimationFrame(tick);
}

function getObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const item = byElement.get(entry.target);
        if (item) item.visible = entry.isIntersecting;
      }
      ensureRunning();
    },
    { rootMargin: "20% 0px" },
  );

  return observer;
}

type ParallaxProps = {
  children: ReactNode;
  speed?: number;
  className?: string;
};

export function Parallax({ children, speed = 0.08, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const item: Item = { el, speed, visible: false };
    items.add(item);
    byElement.set(el, item);
    getObserver().observe(el);
    ensureRunning();

    return () => {
      observer?.unobserve(el);
      byElement.delete(el);
      items.delete(item);
      el.style.transform = "";
      if (items.size === 0 && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
