import type { Driver } from "driver.js";
import { TOURS, type TourId } from "./steps";

const key = (userId: string, tourId: TourId) => `blogging:tour:v1:${userId}:${tourId}`;

export function hasSeenTour(userId: string, tourId: TourId): boolean {
  try {
    return localStorage.getItem(key(userId, tourId)) === "1";
  } catch {
    return true; // storage blocked: don't nag on every page view
  }
}

function markSeen(userId: string, tourId: TourId) {
  try {
    localStorage.setItem(key(userId, tourId), "1");
  } catch {
    // ignore
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Pages stream in (Suspense, lazy editor), so wait briefly for the anchors to exist. */
async function waitForAnchors(selectors: string[], timeoutMs = 4000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (selectors.every((s) => document.querySelector(s))) return;
    await sleep(150);
  }
}

let stopActive: (() => void) | null = null;

/**
 * Starts a tour. Returns a cancel function (use it as an effect cleanup).
 * A tour is marked as seen only when the user finishes or dismisses it, not when it is cancelled
 * by navigating away.
 */
export function startTour(tourId: TourId, userId: string): () => void {
  stopActive?.();

  let cancelled = false;
  let instance: Driver | null = null;

  void (async () => {
    const [{ driver }] = await Promise.all([import("driver.js"), import("driver.js/dist/driver.css")]);
    const steps = TOURS[tourId];
    await waitForAnchors(steps.flatMap((s) => (s.element ? [s.element] : [])));
    await sleep(700); // let the page's entrance animation settle so the spotlight lines up
    if (cancelled) return;

    const isVisible = (selector: string) => {
      const el = document.querySelector(selector);
      return !!el && el.getClientRects().length > 0; // display:none elements have no boxes
    };
    const available = steps.filter((s) => !s.element || isVisible(s.element));
    if (available.length === 0) return;

    instance = driver({
      showProgress: true,
      allowClose: true,
      animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      overlayColor: "#01100a",
      overlayOpacity: 0.78,
      stagePadding: 8,
      stageRadius: 12,
      popoverClass: "tour-popover",
      progressText: "{{current}} of {{total}}",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Got it",
      steps: available.map((s) => ({
        element: s.element,
        popover: { title: s.title, description: s.description, side: s.side, align: "center" },
      })),
      onDestroyed: () => {
        if (!cancelled) markSeen(userId, tourId);
        if (stopActive === stop) stopActive = null;
      },
    });
    instance.drive();
  })();

  function stop() {
    cancelled = true;
    instance?.destroy();
  }
  stopActive = stop;
  return stop;
}
