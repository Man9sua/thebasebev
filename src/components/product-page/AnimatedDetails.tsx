"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

/** Native, crawlable answers with reversible height transitions on touch and keyboard. */
export function AnimatedDetails({
  summary,
  children,
  className,
  summaryClassName,
  initiallyOpen = false,
}: {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  summaryClassName?: string;
  initiallyOpen?: boolean;
}) {
  const element = useRef<HTMLDetailsElement>(null);
  const transition = useRef<Animation | null>(null);
  const expanded = useRef(initiallyOpen);

  const syncNativeToggle = () => {
    const details = element.current;
    if (!details || transition.current) return;
    expanded.current = details.open;
    details.dataset.expanded = String(details.open);
  };

  useEffect(() => {
    const details = element.current;
    if (details) {
      expanded.current = details.open;
      details.dataset.expanded = String(details.open);
    }
    return () => transition.current?.cancel();
  }, []);

  const toggle = (event: MouseEvent<HTMLElement>) => {
    const details = element.current;
    if (!details) return;
    event.preventDefault();

    const startHeight = details.getBoundingClientRect().height;
    transition.current?.cancel();
    transition.current = null;
    expanded.current = !expanded.current;
    details.dataset.expanded = String(expanded.current);
    details.style.height = "";
    details.style.overflow = "";
    details.open = expanded.current;
    const endHeight = details.getBoundingClientRect().height;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !details.animate) return;

    // Keep the answer rendered during closing; release the fixed height afterwards.
    details.open = true;
    details.style.height = `${startHeight}px`;
    details.style.overflow = "hidden";
    const durationToken = getComputedStyle(details).getPropertyValue("--tbb-dur-fast").trim();
    const duration = Number.parseFloat(durationToken) * (durationToken.endsWith("ms") ? 1 : 1000) || 320;
    const animation = details.animate(
      [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
      { duration, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    transition.current = animation;
    animation.onfinish = () => {
      if (transition.current !== animation) return;
      details.open = expanded.current;
      details.style.height = "";
      details.style.overflow = "";
      transition.current = null;
    };
  };

  return (
    <details ref={element} className={className} open={initiallyOpen} data-expanded={initiallyOpen} onToggle={syncNativeToggle}>
      <summary className={summaryClassName} onClick={toggle}>{summary}</summary>
      {children}
    </details>
  );
}
