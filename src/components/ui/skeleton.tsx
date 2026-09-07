import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Skeleton — loading placeholder. Sized by the caller (width/height classes).
 * The pulse is neutralised automatically under prefers-reduced-motion (global
 * rule in index.css).
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-card bg-surface-sunken", className)}
      {...props}
    />
  )
}

export { Skeleton }
