"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { About } from "@/components/home/About";
import { Bestsellers } from "@/components/home/Bestsellers";
import { BlogCarousel } from "@/components/home/BlogCarousel";
import { Collage } from "@/components/home/Collage";
import { Hero } from "@/components/home/Hero";
import { StackReveal } from "@/components/motion/StackReveal";
import { LoadingScreen } from "@/components/site/LoadingScreen";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BESTSELLER_SLUGS } from "@/data/products";
import styles from "./HomeExperience.module.css";

const SCENES = ["hero", "bestsellers", "manufacturing", "reading", "about", "footer"] as const;
const PRODUCT_TRANSITION_MS = 520;
const SCENE_TRANSITION_MS = 900;
const TRACKPAD_THRESHOLD = 44;
const SCENE_EDGE_TOLERANCE = 12;

function documentTop(element: HTMLElement) {
  let top = 0;
  let node: HTMLElement | null = element;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

function isEditable(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest("input, textarea, select, button, a, [contenteditable='true']"))
  );
}

export function HomeExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [activeProduct, setActiveProduct] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const activeSceneRef = useRef(activeScene);
  const activeProductRef = useRef(activeProduct);
  const transitionRef = useRef(false);
  const unlockTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    activeSceneRef.current = activeScene;
  }, [activeScene]);

  useEffect(() => {
    activeProductRef.current = activeProduct;
  }, [activeProduct]);

  const beginTransition = useCallback((duration: number) => {
    transitionRef.current = true;
    setIsTransitioning(true);
    window.clearTimeout(unlockTimer.current);
    unlockTimer.current = window.setTimeout(() => {
      transitionRef.current = false;
      setIsTransitioning(false);
    }, duration);
  }, []);

  useEffect(() => () => window.clearTimeout(unlockTimer.current), []);

  const setProduct = useCallback(
    (next: number) => {
      const resolved = Math.min(BESTSELLER_SLUGS.length - 1, Math.max(0, next));
      if (resolved === activeProductRef.current) return;
      activeProductRef.current = resolved;
      setActiveProduct(resolved);
      beginTransition(PRODUCT_TRANSITION_MS);
    },
    [beginTransition],
  );

  const goToScene = useCallback(
    (next: number) => {
      const root = rootRef.current;
      const resolved = Math.min(SCENES.length - 1, Math.max(0, next));
      const scene = root?.querySelector<HTMLElement>(`[data-scene-index='${resolved}']`);
      if (!scene || resolved === activeSceneRef.current) return;

      activeSceneRef.current = resolved;
      setActiveScene(resolved);
      beginTransition(SCENE_TRANSITION_MS);
      scene.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [beginTransition],
  );

  const canStep = useCallback((direction: 1 | -1) => {
    const scene = activeSceneRef.current;
    const product = activeProductRef.current;
    if (scene === 1) {
      if (direction === 1 && product < BESTSELLER_SLUGS.length - 1) return true;
      if (direction === -1 && product > 0) return true;
    }
    const next = scene + direction;
    return next >= 0 && next < SCENES.length;
  }, []);

  const isAtSceneEdge = useCallback((direction: 1 | -1) => {
    const scene = rootRef.current?.querySelector<HTMLElement>(
      `[data-scene-index='${activeSceneRef.current}']`,
    );
    if (!scene) return true;

    const top = documentTop(scene);
    const bottom = top + scene.offsetHeight;
    if (direction === 1) {
      return window.scrollY + window.innerHeight >= bottom - SCENE_EDGE_TOLERANCE;
    }
    return window.scrollY <= top + SCENE_EDGE_TOLERANCE;
  }, []);

  const step = useCallback(
    (direction: 1 | -1) => {
      if (transitionRef.current || !canStep(direction)) return false;

      const scene = activeSceneRef.current;
      const product = activeProductRef.current;
      if (scene === 1) {
        if (direction === 1 && product < BESTSELLER_SLUGS.length - 1) {
          setProduct(product + 1);
          return true;
        }
        if (direction === -1 && product > 0) {
          setProduct(product - 1);
          return true;
        }
      }

      goToScene(scene + direction);
      return true;
    },
    [canStep, goToScene, setProduct],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    const readScene = () => {
      frame = 0;
      const scenes = Array.from(root.querySelectorAll<HTMLElement>("[data-home-scene]"));
      // The scene crossing the header band is authoritative. Using the centre
      // of the viewport made a tall scene activate the next state while most
      // of the current scene was still visible.
      const marker = window.scrollY + Math.min(window.innerHeight * 0.12, 96);
      let next = 0;
      for (const scene of scenes) {
        if (documentTop(scene) <= marker) next = Number(scene.dataset.sceneIndex ?? next);
      }

      if (next !== activeSceneRef.current && !transitionRef.current) {
        activeSceneRef.current = next;
        setActiveScene(next);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(readScene);
    };

    readScene();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    if (reduced.matches || !finePointer.matches) return;

    let accumulated = 0;
    let direction: 1 | -1 = 1;
    let resetTimer: number | undefined;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || event.defaultPrevented) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (getComputedStyle(document.body).overflow === "hidden") return;

      const nextDirection: 1 | -1 = event.deltaY >= 0 ? 1 : -1;
      // The mobile reference scrolls naturally through scenes that are taller
      // than one viewport (the manufacturing mosaic and footer). Desktop keeps
      // that exact behavior and only performs a scene jump at an edge.
      if (!isAtSceneEdge(nextDirection)) return;
      if (!canStep(nextDirection)) return;

      event.preventDefault();
      if (transitionRef.current) return;

      if (nextDirection !== direction) accumulated = 0;
      direction = nextDirection;
      const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
      accumulated += event.deltaY * multiplier;

      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        accumulated = 0;
      }, 160);

      if (Math.abs(accumulated) < TRACKPAD_THRESHOLD) return;
      accumulated = 0;
      step(direction);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditable(event.target)) return;
      const direction =
        event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey)
          ? 1
          : event.key === "ArrowUp" || event.key === "PageUp" || (event.key === " " && event.shiftKey)
            ? -1
            : 0;
      if (!direction || !isAtSceneEdge(direction) || !canStep(direction)) return;
      event.preventDefault();
      step(direction);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(resetTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [canStep, isAtSceneEdge, step]);

  return (
    <div
      ref={rootRef}
      className={styles.experience}
      data-home-experience
      data-active-scene={activeScene}
      data-active-scene-name={SCENES[activeScene]}
      data-active-product={BESTSELLER_SLUGS[activeProduct]}
      data-transitioning={isTransitioning || undefined}
    >
      <LoadingScreen />
      <SiteHeader overHero activeScene={activeScene} footerSceneIndex={SCENES.length - 1} />

      <main>
        <div className={styles.scene} data-home-scene="hero" data-scene-index="0">
          <Hero />
        </div>
        <StackReveal scene="bestsellers" sceneIndex={1}>
          <Bestsellers
            index={activeProduct}
            isActive={activeScene === 1}
            onIndexChange={setProduct}
          />
        </StackReveal>
        <StackReveal scene="manufacturing" sceneIndex={2}>
          <Collage />
        </StackReveal>
        <StackReveal scene="reading" sceneIndex={3}>
          <BlogCarousel />
        </StackReveal>
        <StackReveal scene="about" sceneIndex={4}>
          <About />
        </StackReveal>
      </main>

      <StackReveal pinned={false} scene="footer" sceneIndex={5}>
        <SiteFooter />
      </StackReveal>
    </div>
  );
}
