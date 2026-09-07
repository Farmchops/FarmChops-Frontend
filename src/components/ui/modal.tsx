import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"

/**
 * Modal — one dialog shell for the whole app (replaces ~10 hand-rolled copies).
 * Backdrop click + Esc close, focus trap, scroll lock, restores focus on close,
 * role="dialog" / aria-modal / aria-labelledby.
 *
 *   <Modal open={open} onClose={() => setOpen(false)} title="Clear cart?">
 *     <p>…</p>
 *     <Modal.Footer>…</Modal.Footer>
 *   </Modal>
 *
 * No new dependency — intentionally hand-rolled (see DESIGN_SYSTEM_PLAN.md §4).
 */
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  /** Hide the default close (X) button. */
  hideClose?: boolean
  /** Max width of the panel. */
  size?: "sm" | "md" | "lg"
  className?: string
  children: React.ReactNode
}

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
} as const

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

function Modal({
  open,
  onClose,
  title,
  description,
  hideClose,
  size = "md",
  className,
  children,
}: ModalProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()
  const descId = React.useId()

  // Scroll lock + restore focus to the trigger on close.
  React.useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"

    // Move focus into the dialog.
    const raf = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)
      ;(first ?? panelRef.current)?.focus()
    })

    return () => {
      cancelAnimationFrame(raf)
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  // Key handling: Esc to close, Tab trapped within the panel.
  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== "Tab") return
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!nodes || nodes.length === 0) {
        e.preventDefault()
        return
      }
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKeyDown, true)
    return () => document.removeEventListener("keydown", onKeyDown, true)
  }, [open, onClose])

  if (!open || typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "relative w-full rounded-card bg-surface shadow-e3 outline-none sm:rounded-panel",
          SIZES[size],
          className
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 p-5 pb-0">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="text-title font-semibold text-ink">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="mt-1 text-meta text-ink-muted">
                  {description}
                </p>
              )}
            </div>
            {!hideClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close dialog"
                className="-mr-2 -mt-2 shrink-0"
              >
                <X className="size-5" />
              </Button>
            )}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}

function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-5 flex items-center justify-end gap-3", className)}
      {...props}
    />
  )
}

Modal.Footer = ModalFooter

export { Modal }
