import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input — text field on tokens. 16px text (text-body) so mobile Safari doesn't
 * zoom on focus. Pair with <Field> for label / hint / error wiring.
 * Set aria-invalid to surface the error styling.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full rounded-control border border-line-input bg-surface px-3 text-body text-ink",
        "placeholder:text-ink-muted",
        "outline-none transition-colors",
        "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40",
        "disabled:opacity-50 disabled:pointer-events-none",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger/30",
        "file:border-0 file:bg-transparent file:text-meta file:font-medium",
        className
      )}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
