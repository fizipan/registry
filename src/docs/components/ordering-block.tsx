import * as React from "react"

import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/docs/components/copy-button"

export type OrderingRoute = {
  id: string
  label: string
  /** What gets copied: a shell command, a prompt, or a config snippet. */
  code: string
  kind?: "command" | "prompt" | "config"
  note?: React.ReactNode
}

/**
 * The datasheet's "ordering code": one copyable line per install route.
 * Switching tabs rewrites the line in place; copying stamps it.
 */
export function OrderingBlock({
  title = "Ordering information",
  routes,
}: {
  title?: string
  routes: OrderingRoute[]
}) {
  const id = React.useId()

  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="sr-only">
        {title}
      </h2>
      <Tabs defaultValue={routes[0].id} className="gap-3">
        <TabsList
          variant="line"
          aria-label="Install route"
          className="pointer-coarse:h-[3.125rem]!"
        >
          {routes.map((route) => (
            <TabsTrigger
              key={route.id}
              value={route.id}
              className="active:text-foreground pointer-coarse:h-11! pointer-coarse:px-3"
            >
              {route.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {routes.map((route) => (
          <TabsContent
            key={route.id}
            value={route.id}
            className="flex flex-col gap-2"
          >
            <CodeLine route={route} />
            {route.note && (
              <p className="text-sm text-pretty text-muted-foreground">
                {route.note}
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}

function CodeLine({ route }: { route: OrderingRoute }) {
  const [stamped, setStamped] = React.useState(false)
  const kind = route.kind ?? "command"

  const timer = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  function stamp() {
    window.clearTimeout(timer.current)
    setStamped(true)
    timer.current = window.setTimeout(() => setStamped(false), 700)
  }

  return (
    <div
      data-stamped={stamped || undefined}
      className={cn(
        "flex items-start gap-3 rounded-lg bg-code-slab py-2 pr-2 pl-4 text-sidebar-foreground ring-1 ring-code-slab-ring transition-[box-shadow,background-color] duration-300 ease-snap",
        // Lands fast, releases slowly. A color fade is not movement, so it stays under reduced motion.
        "data-stamped:bg-brand-950 data-stamped:ring-sidebar-primary data-stamped:duration-100"
      )}
    >
      <pre className="min-w-0 flex-1 py-1.5 font-mono text-[0.8125rem] leading-6 [overflow-wrap:anywhere] whitespace-pre-wrap">
        {kind === "command" && (
          <span aria-hidden className="mr-2 text-sidebar-primary select-none">
            $
          </span>
        )}
        {kind === "prompt" && (
          <span aria-hidden className="mr-2 text-sidebar-primary select-none">
            &gt;
          </span>
        )}
        <code>{withBreaks(route.code)}</code>
      </pre>
      <CopyButton
        value={route.code}
        label={
          kind === "config"
            ? "Copy config"
            : kind === "prompt"
              ? "Copy prompt"
              : "Copy command"
        }
        showLabel
        onCopied={stamp}
        className="shrink-0 text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-accent-foreground dark:hover:bg-white/10"
      />
    </div>
  )
}

/** Lets long commands and URLs wrap after "/" or before "@" instead of mid-name. */
function withBreaks(code: string) {
  return code.split(/(?=@)|(?<=\/)/).map((part, index) => (
    <React.Fragment key={index}>
      {index > 0 && <wbr />}
      {part}
    </React.Fragment>
  ))
}
