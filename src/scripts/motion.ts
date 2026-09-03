/**
 * Bounded GSAP entrance + subtle water parallax.
 * Respects prefers-reduced-motion, reinits after Astro navigation, cleans up timelines/listeners.
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

function killAll() {
  if (ctx) {
    ctx.revert();
    ctx = null;
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
  // Reset ambient parallax state to avoid stale transforms across navigations
  for (const el of document.querySelectorAll<HTMLElement>(
    ".water-field__image, .water-field__caustic",
  )) {
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
  }
  for (const el of document.querySelectorAll<HTMLElement>(
    ".water-field__image, .water-field__caustic",
  )) {
    el.style.transform = "none";
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

function createEntranceTimeline(entrances: NodeListOf<HTMLElement>, ambient: AmbientNodes): void {
  ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
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
  }
  if (ambient.caustic) ambient.caustic.style.opacity = "0.9";
  for (const w of ambient.bgWords) {
    w.style.opacity = w.classList.contains("bg-word--cyan") ? "0.07" : "0.045";
  }
}

function setupParallax(ambient: AmbientNodes): void {
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
    if (prefersReduced()) return;
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

function runEntrance() {
  killAll();
  if (prefersReduced()) {
    applyReducedMotionState();
    return;
  }
  const entrances = document.querySelectorAll<HTMLElement>("[data-entrance]");
  for (const el of entrances) el.classList.remove("is-entrance-visible");
  const ambient = collectAmbient();
  createEntranceTimeline(entrances, ambient);
  setupParallax(ambient);
  watchReducedMotion();
}

export function initMotion(): void {
  document.documentElement.classList.add("js");
  runEntrance();
}

export function destroyMotion(): void {
  killAll();
}

// Astro lifecycle
if (typeof document !== "undefined") {
  initMotion();
  document.addEventListener("astro:page-load", initMotion);
  document.addEventListener("astro:before-swap", destroyMotion);
}
