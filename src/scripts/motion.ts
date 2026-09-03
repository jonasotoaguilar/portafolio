/**
 * Bounded GSAP entrance + subtle water parallax.
 * Respects prefers-reduced-motion, gates parallax on hover+fine pointer,
 * transient will-change only while motion in flight, cleans up before swap.
 */
import { gsap } from "gsap";

let ctx: gsap.Context | null = null;
let onMove: ((e: MouseEvent) => void) | null = null;
let reduceMql: MediaQueryList | null = null;
let reduceHandler: (() => void) | null = null;

function prefersReduced(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function allowsParallax(): boolean {
  if (prefersReduced()) return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

let quickX: ((v: number) => void) | null = null;
let quickY: ((v: number) => void) | null = null;
let quickXVeil: ((v: number) => void) | null = null;
let quickYVeil: ((v: number) => void) | null = null;
let parallaxRaf = 0;
let pendingX = 0;
let pendingY = 0;

type AmbientNodes = {
  waterImg: HTMLElement | null;
  caustic: HTMLElement | null;
  bgWords: NodeListOf<HTMLElement>;
  isPersisted: boolean;
  shouldAnimateAmbient: boolean;
};

function clearWillChange() {
  for (const el of document.querySelectorAll<HTMLElement>(
    "[data-entrance], .water-field__image, .water-field__caustic, .bg-word",
  )) {
    el.style.willChange = "";
  }
}

function killAll() {
  // revert GSAP context (kills tweens, timelines)
  if (ctx) {
    ctx.revert();
    ctx = null;
  }
  // kill any remaining tweens on persisted nodes (gsap revert may not clear quickTo)
  for (const el of document.querySelectorAll<HTMLElement>(
    ".water-field__image, .water-field__caustic, .bg-word, [data-entrance]",
  )) {
    gsap.killTweensOf(el);
  }
  if (onMove) {
    window.removeEventListener("mousemove", onMove);
    onMove = null;
  }
  if (parallaxRaf) {
    cancelAnimationFrame(parallaxRaf);
    parallaxRaf = 0;
  }
  quickX = null;
  quickY = null;
  quickXVeil = null;
  quickYVeil = null;

  // Clear transient will-change and reset persisted transforms to avoid stale offset
  clearWillChange();
  for (const el of document.querySelectorAll<HTMLElement>(
    ".water-field__image, .water-field__caustic",
  )) {
    // gsap quickTo sets transform via inline x/y; reset via gsap to ensure no stale
    gsap.set(el, { x: 0, y: 0, clearProps: "transform" });
    el.style.transform = "none";
    // ensure willChange already cleared
  }
  for (const el of document.querySelectorAll<HTMLElement>(".bg-word")) {
    el.style.transform = "";
    // opacity stays via CSS, but ensure no stale inline transform
  }
  // Also clear entrance transient will-change and reset if needed (opacity handled elsewhere)
  for (const el of document.querySelectorAll<HTMLElement>("[data-entrance]")) {
    // keep is-entrance-visible state but ensure no stale willChange
    el.style.willChange = "";
  }

  if (reduceMql && reduceHandler) {
    reduceMql.removeEventListener("change", reduceHandler);
    reduceMql = null;
    reduceHandler = null;
  }
}

function applyReducedMotionState(): void {
  const entrances = document.querySelectorAll<HTMLElement>("[data-entrance]");
  for (const el of entrances) {
    el.classList.add("is-entrance-visible");
    el.style.opacity = "";
    el.style.transform = "";
    el.style.willChange = "";
  }
  for (const el of document.querySelectorAll<HTMLElement>(
    ".water-field__image, .water-field__caustic",
  )) {
    el.style.transform = "none";
    el.style.willChange = "";
  }
  for (const el of document.querySelectorAll<HTMLElement>(".bg-word")) {
    el.style.transform = "";
    el.style.willChange = "";
  }
}

function collectAmbient(): AmbientNodes {
  const waterImg = document.querySelector<HTMLElement>(".water-field__image");
  const caustic = document.querySelector<HTMLElement>(".water-field__caustic");
  const bgWords = document.querySelectorAll<HTMLElement>(".bg-word");
  const isPersisted = waterImg?.hasAttribute("data-astro-transition-persist") ?? false;
  const shouldAnimateAmbient =
    !isPersisted || !document.documentElement.hasAttribute("data-astro-transition");
  return { waterImg, caustic, bgWords, isPersisted, shouldAnimateAmbient };
}

function setTransientWillChange(entrances: NodeListOf<HTMLElement>, ambient: AmbientNodes) {
  for (const el of entrances) el.style.willChange = "transform, opacity";
  if (ambient.waterImg) ambient.waterImg.style.willChange = "transform";
  if (ambient.caustic) ambient.caustic.style.willChange = "transform";
  for (const w of ambient.bgWords) w.style.willChange = "transform, opacity";
}

function createEntranceTimeline(entrances: NodeListOf<HTMLElement>, ambient: AmbientNodes): void {
  setTransientWillChange(entrances, ambient);
  ctx = gsap.context(() => {
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        clearWillChange();
        // ensure entrance final state is clean
        for (const el of entrances) {
          el.classList.add("is-entrance-visible");
          el.style.transform = "";
          el.style.opacity = "";
        }
      },
      onInterrupt: () => {
        clearWillChange();
      },
    });
    if (entrances.length) {
      tl.fromTo(
        entrances,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.06,
          overwrite: "auto",
        },
        0,
      );
      tl.call(
        () => {
          for (const el of entrances) {
            el.classList.add("is-entrance-visible");
            el.style.transform = "";
            el.style.opacity = "";
          }
        },
        undefined,
        ">",
      );
    }
    if (ambient.shouldAnimateAmbient) {
      animateAmbientVisible(tl, ambient);
    } else {
      finalizePersistedAmbient(ambient);
    }
    // Ensure will-change cleared even if timeline completes without onComplete (also killAll covers)
    tl.call(() => clearWillChange(), undefined, ">");
  });
}

function animateAmbientVisible(tl: gsap.core.Timeline, ambient: AmbientNodes): void {
  if (ambient.waterImg) {
    tl.fromTo(
      ambient.waterImg,
      { scale: 1.04, opacity: 0 },
      { scale: 1, opacity: 0.42, duration: 0.9, clearProps: "scale" },
      0,
    );
  }
  if (ambient.caustic) {
    tl.fromTo(ambient.caustic, { opacity: 0 }, { opacity: 0.9, duration: 0.6 }, 0.15);
  }
  if (ambient.bgWords.length) {
    tl.fromTo(
      ambient.bgWords,
      { x: -18, opacity: 0 },
      { x: 0, opacity: 0.045, duration: 0.7, stagger: 0.08 },
      0.1,
    );
  }
}

function finalizePersistedAmbient(ambient: AmbientNodes): void {
  if (ambient.waterImg) {
    ambient.waterImg.style.opacity = "0.42";
    ambient.waterImg.style.transform = "none";
    ambient.waterImg.style.willChange = "";
  }
  if (ambient.caustic) {
    ambient.caustic.style.opacity = "0.9";
    ambient.caustic.style.willChange = "";
  }
  for (const w of ambient.bgWords) {
    w.style.opacity = w.classList.contains("bg-word--cyan") ? "0.07" : "0.045";
    w.style.willChange = "";
    w.style.transform = "";
  }
  // persisted ambient should not retain will-change
  clearWillChange();
}

function setupParallax(ambient: AmbientNodes): void {
  if (!allowsParallax()) return;
  const img = ambient.waterImg;
  const veil = ambient.caustic;
  if (!img && !veil) return;
  if (img) {
    img.style.willChange = "transform";
    quickX = gsap.quickTo(img, "x", { duration: 0.9, ease: "power2.out" });
    quickY = gsap.quickTo(img, "y", { duration: 0.9, ease: "power2.out" });
  }
  if (veil) {
    veil.style.willChange = "transform";
    quickXVeil = gsap.quickTo(veil, "x", { duration: 1, ease: "power2.out" });
    quickYVeil = gsap.quickTo(veil, "y", { duration: 1, ease: "power2.out" });
  }
  onMove = (e: MouseEvent) => {
    if (!allowsParallax()) return;
    pendingX = (e.clientX / window.innerWidth - 0.5) * 10;
    pendingY = (e.clientY / window.innerHeight - 0.5) * 8;
    if (parallaxRaf) return;
    parallaxRaf = requestAnimationFrame(() => {
      parallaxRaf = 0;
      if (quickX) quickX(pendingX);
      if (quickY) quickY(pendingY);
      if (quickXVeil) quickXVeil(pendingX * 0.6);
      if (quickYVeil) quickYVeil(pendingY * 0.6);
    });
  };
  window.addEventListener("mousemove", onMove, { passive: true });
}

function watchReducedMotion(): void {
  // avoid duplicate listeners: killAll already cleared previous
  reduceMql = window.matchMedia("(prefers-reduced-motion: reduce)");
  reduceHandler = () => {
    if (reduceMql?.matches) {
      killAll();
      applyReducedMotionState();
    } else {
      runEntrance();
    }
  };
  reduceMql.addEventListener("change", reduceHandler);
}

let isRunning = false;
function runEntrance() {
  if (isRunning) killAll();
  isRunning = true;
  killAll();
  if (prefersReduced()) {
    applyReducedMotionState();
    isRunning = false;
    return;
  }
  const entrances = document.querySelectorAll<HTMLElement>("[data-entrance]");
  for (const el of entrances) el.classList.remove("is-entrance-visible");
  const ambient = collectAmbient();
  createEntranceTimeline(entrances, ambient);
  setupParallax(ambient);
  watchReducedMotion();
  // mark complete after timeline duration ~1s, will-change already cleared via onComplete
  setTimeout(() => {
    isRunning = false;
  }, 1200);
}

export function initMotion(): void {
  document.documentElement.classList.add("js");
  runEntrance();
}

export function destroyMotion(): void {
  killAll();
  isRunning = false;
}

// Astro lifecycle — initialize exactly once on page-load, teardown before swap
let hasBound = false;
function bindLifecycle() {
  if (hasBound) return;
  hasBound = true;
  document.addEventListener("astro:page-load", initMotion);
  document.addEventListener("astro:before-swap", destroyMotion);
}

if (typeof document !== "undefined") {
  bindLifecycle();
  initMotion();
}
