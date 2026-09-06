"use client";

import { useEffect, useRef } from "react";
import type { Zone } from "@/lib/domain/catalog";
import { trackEvent } from "@/lib/track-client";

/** Registra a abertura real da página, inclusive por acesso direto ao link. */
export function SpaceViewTracker({ spaceSlug, zone }: { spaceSlug: string; zone: Zone }) {
  const lastTrackedSpace = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (lastTrackedSpace.current === spaceSlug) return;
    lastTrackedSpace.current = spaceSlug;
    trackEvent("space_viewed", { spaceSlug, zone });
  }, [spaceSlug, zone]);

  return null;
}
