import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge — the fixed set of product/status pills (see DESIGN_SYSTEM_PLAN.md §3.6).
 * Show at most two on a product card. Not interactive; for filter chips that
 * toggle, use a Button with size overrides instead.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill font-semibold leading-none " +
    "[&_svg]:shrink-0 [&_svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "bg-surface-sunken text-ink-secondary",
        brand: "bg-brand text-brand-fg",
        brandSoft: "bg-brand-tint text-brand-ink",
        deal: "bg-deal text-deal-fg",
        success: "bg-success-tint text-success-ink",
        warning: "bg-warning-tint text-warning-ink",
        danger: "bg-danger text-danger-fg",
      },
      size: {
        sm: "px-2 py-0.5 text-caption",
        md: "px-2.5 py-1 text-fine",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "sm",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
