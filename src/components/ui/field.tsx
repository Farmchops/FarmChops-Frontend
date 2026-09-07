import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Field — label + control + hint/error, with the a11y wiring done once.
 * Clones its single child control to attach id / aria-invalid / aria-describedby.
 *
 *   <Field label="Email" error={errors.email}>
 *     <Input type="email" value={email} onChange={...} />
 *   </Field>
 */
interface FieldProps {
  label?: React.ReactNode
  hint?: React.ReactNode
  error?: React.ReactNode
  /** Mark the label with a required asterisk. Does not set `required` on the control. */
  required?: boolean
  className?: string
  /** Provide to override the generated id (must match the control). */
  htmlFor?: string
  children: React.ReactElement
}

function Field({
  label,
  hint,
  error,
  required,
  className,
  htmlFor,
  children,
}: FieldProps) {
  const generatedId = React.useId()
  const id = htmlFor ?? (children.props as { id?: string }).id ?? generatedId
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy =
    [hintId, errorId].filter(Boolean).join(" ") || undefined

  const control = React.cloneElement(children, {
    id,
    "aria-invalid": error ? true : (children.props as Record<string, unknown>)["aria-invalid"],
    "aria-describedby":
      [describedBy, (children.props as { "aria-describedby"?: string })["aria-describedby"]]
        .filter(Boolean)
        .join(" ") || undefined,
  } as Record<string, unknown>)

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-meta font-medium text-ink">
          {label}
          {required && <span className="text-danger-ink"> *</span>}
        </label>
      )}
      {control}
      {hint && !error && (
        <p id={hintId} className="text-fine text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-fine text-danger-ink">
          {error}
        </p>
      )}
    </div>
  )
}

export { Field }
