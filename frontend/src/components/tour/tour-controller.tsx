"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { hasSeenTour, startTour } from "@/lib/tour/start";
import { tourIdForPath } from "@/lib/tour/steps";

/**
 * Lives in the navbar (which persists across pages): auto-plays each page's tour once per user,
 * and renders the "?" button that replays the current page's tour.
 */
export function TourController({ userId }: { userId: string }) {
  const tourId = tourIdForPath(usePathname());

  useEffect(() => {
    if (!tourId || hasSeenTour(userId, tourId)) return;
    return startTour(tourId, userId);
  }, [tourId, userId]);

  if (!tourId) return null;

  return (
    <button
      type="button"
      className="theme-toggle"
      data-tour="tour-button"
      aria-label="Take a tour of this page"
      title="Take a tour of this page"
      onClick={() => startTour(tourId, userId)}
    >
      <span className="font-display text-base font-semibold leading-none">?</span>
    </button>
  );
}
