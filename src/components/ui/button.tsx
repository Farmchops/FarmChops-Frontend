import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button — the one primary-action control. Token-driven; see
 * docs/DESIGN_SYSTEM_PLAN.md §2.5. For links styled as buttons, apply
 * `buttonVariants({ variant, size })` to the <Link> directly.
 *
 * Every size is a >= 44px hit target (WCAG 2.5.5). There is deliberately no
 * sub-44px size — override with a className if a dense context truly needs it.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-card font-medium select-none " +
    "transition-colors outline-none " +
    "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas " +
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none " +
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-fg hover:bg-brand-hover",
        secondary:
          "bg-surface text-ink border border-line-input hover:bg-surface-sunken",
        ghost: "text-ink hover:bg-surface-sunken",
        danger: "bg-danger text-danger-fg hover:bg-danger-hover",
      },
      size: {
        default: "h-11 px-5 text-body",
        lg: "h-12 px-6 text-body",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Button.displayName = "Button"

// buttonVariants is exported so links can be styled as buttons:
// <Link className={buttonVariants({ variant: "secondary" })} />
// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
