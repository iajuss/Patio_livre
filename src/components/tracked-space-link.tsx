"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Zone } from "@/lib/domain/catalog";
import { trackEvent } from "@/lib/track-client";

type TrackedSpaceLinkProps = {
  href: string;
  className: string;
  ariaLabel: string;
  spaceSlug: string;
  zone: Zone;
  children: ReactNode;
};

/** Link do catálogo que preserva a navegação e registra o espaço escolhido. */
export function TrackedSpaceLink({ href, className, ariaLabel, spaceSlug, zone, children }: TrackedSpaceLinkProps) {
  return (
    <Link aria-label={ariaLabel} className={className} href={href} onClick={() => trackEvent("space_clicked", { spaceSlug, zone })}>
      {children}
    </Link>
  );
}
