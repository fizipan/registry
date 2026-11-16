import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type CopyButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "children"
> & {
  value: string
  /** Accessible name before copying, e.g. "Copy command". */
  label?: string
  /** Show "Copy" / "Copied" as text next to the icon. */
  showLabel?: boolean
  onCopied?: () => void
}

/** Copies `value` and reports "Copied" for a moment. */
export function CopyButton({
  value,
  label = "Copy",
  showLabel = false,
  onCopied,
  variant = "ghost",
  size,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    onCopied?.()
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size ?? (showLabel ? "sm" : "icon-sm")}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      onClick={copy}
      {...props}
    >
      {copied ? (
        <CheckIcon data-icon={showLabel ? "inline-start" : undefined} />
      ) : (
        <CopyIcon data-icon={showLabel ? "inline-start" : undefined} />
      )}
      {showLabel && <span aria-hidden>{copied ? "Copied" : "Copy"}</span>}
    </Button>
  )
}
