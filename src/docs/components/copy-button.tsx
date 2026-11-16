import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
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
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    await navigator.clipboard.writeText(value)
    // Every copy restarts the window, so a second click is never cut short.
    window.clearTimeout(timer.current)
    setCopied(true)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
    onCopied?.()
  }

  const iconData = showLabel ? "inline-start" : undefined

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size ?? (showLabel ? "sm" : "icon-sm")}
        aria-label={copied ? "Copied" : label}
        title={copied ? "Copied" : label}
        onClick={copy}
        className={cn(
          "hover:bg-foreground/6 dark:hover:bg-foreground/10 pointer-coarse:h-11 pointer-coarse:min-w-11",
          className
        )}
        {...props}
      >
        <span
          aria-hidden
          data-copied={copied || undefined}
          className="copy-swap grid place-items-center *:col-start-1 *:row-start-1"
        >
          <CopyIcon data-icon={iconData} />
          <CheckIcon
            data-icon={iconData}
            className={showLabel ? undefined : "text-primary"}
          />
        </span>
        {showLabel && (
          // Both labels share one cell, so the button keeps the wider width.
          <span
            aria-hidden
            data-copied={copied || undefined}
            className="copy-swap grid justify-items-start *:col-start-1 *:row-start-1"
          >
            <span>Copy</span>
            <span>Copied</span>
          </span>
        )}
      </Button>
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  )
}
