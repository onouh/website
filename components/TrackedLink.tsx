"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent, type FunnelEvent, type FunnelProperties } from "@/lib/analytics";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: FunnelEvent;
  properties?: FunnelProperties;
  children: ReactNode;
};

/** Anchor that reports one funnel event on click. Usable from server
 * components — props stay serializable; the tracking lives client-side. */
export function TrackedLink({
  event,
  properties,
  children,
  onClick,
  ...rest
}: TrackedLinkProps) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        trackEvent(event, properties);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
