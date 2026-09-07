/**
 * Bounded GSAP entrance + subtle water parallax.
 * Respects prefers-reduced-motion, gates parallax on hover+fine pointer,
 * transient will-change only while motion in flight, cleans up before swap.
 *
 * Route-transition ownership: Astro's 250ms root fade owns ClientRouter
 * navigation. `astro:after-swap` fires after body replacement but before the
 * new elements render, so incoming `[data-entrance]` nodes are finalized
 * visible there (pre-paint) and `astro:page-load` skips the GSAP entrance on
 * navigated documents. The authored 24px/620ms cascade runs on initial load
 * only. Persisted WaterField/bg-word hosts stay stable — no ambient rerun.
 */
import { gsap } from "gsap";
import { MOTION } from "./motion-tokens";

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
  // Persist ownership lives on the HOST nodes (`transition:persist` renders
  // `data-astro-transition-persist` on the `.water-field` / bg-words wrapper),
  // never on the animated children — check the hosts so the branch is live.
  isPersisted: boolean;
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
  const isPersisted =
    document.querySelector('[data-astro-transition-persist="water-field"]') !== null ||
    document.querySelector('[data-astro-transition-persist="bg-words"]') !== null;
  return { waterImg, caustic, bgWords, isPersisted };
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
      defaults: { ease: MOTION.ease },
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
        { y: MOTION.entranceY, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: MOTION.entranceDuration,
          stagger: MOTION.entranceStagger,
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
    // Initial load only: ambient settle belongs to the authored entrance.
    // ClientRouter navigations never reach this timeline — they finalize
    // stable ambient in handleAfterSwap/runNavigated, so Astro's 250ms root
    // fade stays the single transition owner (no second ambient run).
    animateAmbientVisible(tl, ambient);
    // Ensure will-change cleared even if timeline completes without onComplete (also killAll covers)
    tl.call(() => clearWillChange(), undefined, ">");
  });
}

function animateAmbientVisible(tl: gsap.core.Timeline, ambient: AmbientNodes): void {
  if (ambient.waterImg) {
    // Decorative WaterField stays painted at its CSS opacity from first paint —
    // never hidden from opacity 0 — so it cannot delay LCP. Only the
    // compositor-safe scale settle animates (transform-only, no opacity tween).
    ambient.waterImg.style.opacity = "0.42";
    tl.fromTo(
      ambient.waterImg,
      { scale: 1.04 },
      { scale: 1, duration: 0.9, clearProps: "scale" },
      0,
    );
  }
  if (ambient.caustic) {
    ambient.caustic.style.opacity = "0.9";
  }
  if (ambient.bgWords.length) {
    // Per-variant settle matches finalizePersistedAmbient/CSS so initial and
    // navigated finals agree (no route jump): normal 0.045, cyan 0.07.
    const normalWords = Array.from(ambient.bgWords).filter(
      (w) => !w.classList.contains("bg-word--cyan"),
    );
    const cyanWords = Array.from(ambient.bgWords).filter((w) =>
      w.classList.contains("bg-word--cyan"),
    );
    if (normalWords.length) {
      tl.fromTo(
        normalWords,
        { x: -18, opacity: 0 },
        { x: 0, opacity: 0.045, duration: 0.7, stagger: 0.08 },
        0.1,
      );
    }
    if (cyanWords.length) {
      tl.fromTo(
        cyanWords,
        { x: -18, opacity: 0 },
        { x: 0, opacity: 0.07, duration: 0.7, stagger: 0.08 },
        0.1,
      );
    }
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

/** Finalize incoming entrances visible with no post-paint tween. Runs at
 * `astro:after-swap` (before new elements render) and on navigated
 * `astro:page-load`, so the first paint already shows the settled state. */
function finalizeEntrancesVisible(): void {
  for (const el of document.querySelectorAll<HTMLElement>("[data-entrance]")) {
    el.classList.add("is-entrance-visible");
    el.style.opacity = "";
    el.style.transform = "";
    el.style.willChange = "";
  }
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
    } else if (navigatedDocument) {
      runNavigated();
    } else {
      runEntrance();
    }
  };
  reduceMql.addEventListener("change", reduceHandler);
}

let isRunning = false;
// True once a ClientRouter navigation finalized this document without the
// GSAP entrance. Survives rapid navigation/back-forward: set in
// handleAfterSwap, consumed per page-load, and kept so a later
// reduced-motion toggle re-runs the navigated path (no post-paint entrance).
let pendingClientNav = false;
let navigatedDocument = false;

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

/** ClientRouter navigation path: no GSAP entrance — Astro's 250ms root fade
 * owns the transition. Incoming entrances are already finalized visible
 * (pre-paint in handleAfterSwap); re-assert here, keep persisted ambient
 * stable, restore parallax gates and live reduced-motion response. */
function runNavigated(): void {
  killAll();
  isRunning = false;
  navigatedDocument = true;
  if (prefersReduced()) {
    applyReducedMotionState();
    return;
  }
  finalizeEntrancesVisible();
  const ambient = collectAmbient();
  finalizePersistedAmbient(ambient);
  setupParallax(ambient);
  // Settle to the same contract as initial load (timeline onComplete clears
  // transient hints): no standing will-change. Parallax keeps working via
  // quickTo, which promotes on transform change without a standing hint.
  clearWillChange();
  watchReducedMotion();
}

/** Runs at `astro:after-swap` — after body replacement, before new elements
 * render. Tears down the previous document's motion and finalizes the
 * incoming state pre-paint, then flags the following `astro:page-load` to
 * take the navigated (GSAP-free) path. */
function handleAfterSwap(): void {
  pendingClientNav = true;
  killAll();
  isRunning = false;
  finalizeEntrancesVisible();
  finalizePersistedAmbient(collectAmbient());
}

export function initMotion(): void {
  document.documentElement.classList.add("js");
  if (pendingClientNav) {
    pendingClientNav = false;
    runNavigated();
    return;
  }
  runEntrance();
}

export function destroyMotion(): void {
  killAll();
  isRunning = false;
}

// Astro lifecycle — full entrance on initial page-load, GSAP-free finalize on
// navigations (flagged at after-swap), teardown before swap
let hasBound = false;
function bindLifecycle() {
  if (hasBound) return;
  hasBound = true;
  document.addEventListener("astro:page-load", initMotion);
  document.addEventListener("astro:after-swap", handleAfterSwap);
  document.addEventListener("astro:before-swap", destroyMotion);
}

if (typeof document !== "undefined") {
  bindLifecycle();
  initMotion();
}
