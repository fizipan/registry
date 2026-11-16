import { HomeIcon, UsersIcon, CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SheetSection } from "@/docs/components/datasheet"
import { type RegistryItem, getItem, typeLabel } from "@/docs/registry-data"
import { href } from "@/docs/use-route"
import { ItemHeader } from "@/docs/pages/item-header"

const groups: { title: string; match: (token: string) => boolean }[] = [
  {
    title: "Surface",
    match: (t) =>
      /^(background|foreground|card|popover|border|input|ring|radius)/.test(t),
  },
  {
    title: "Actions",
    match: (t) => /^(primary|secondary|muted|accent|destructive)/.test(t),
  },
  {
    title: "Status",
    match: (t) => /^(success|warning|info|brand-soft)/.test(t),
  },
  { title: "Brand surface", match: (t) => t.startsWith("surface-brand") },
  { title: "Sidebar", match: (t) => t.startsWith("sidebar") },
  { title: "Chart", match: (t) => t.startsWith("chart") },
]

const isScale = (token: string) => /^(brand|ink)-\d+$/.test(token)

function Swatch({ value }: { value?: string }) {
  if (!value) return <span className="text-muted-foreground">inherits</span>
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden
        className="size-5 shrink-0 rounded-[5px] border border-border"
        // Token values are data from registry.json, so they are set inline.
        style={{ background: value }}
      />
      <span className="font-mono text-xs text-muted-foreground">{value}</span>
    </span>
  )
}

function Scale({ name, values }: { name: string; values: [string, string][] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-mono text-[0.8125rem]">{name}</p>
      <div className="grid grid-cols-11 overflow-hidden rounded-md border border-border">
        {values.map(([step, value]) => (
          <div key={step} className="flex flex-col">
            <span aria-hidden className="h-10" style={{ background: value }} />
            <span className="py-1 text-center font-mono text-[0.625rem] text-muted-foreground tabular-nums">
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** A small app frame in the theme: the sidebar, a brand panel, actions and status badges. */
function Sample() {
  const nav = [
    { label: "Dashboard", icon: HomeIcon, active: true },
    { label: "People", icon: UsersIcon },
    { label: "Schedule", icon: CalendarIcon },
  ]
  return (
    <div className="flex overflow-hidden rounded-lg border border-border">
      <div className="hidden w-44 shrink-0 flex-col gap-1 bg-sidebar p-3 text-sidebar-foreground sm:flex">
        {nav.map(({ label, icon: Icon, active }) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-muted"
            )}
          >
            <Icon className={cn("size-4", active && "text-sidebar-primary")} />
            {label}
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-4">
        <div className="flex flex-col gap-1 rounded-lg border border-surface-brand-border bg-surface-brand p-4 text-surface-brand-foreground">
          <p className="font-display text-3xl leading-none font-bold tracking-wide uppercase">
            Good morning
          </p>
          <p className="text-sm text-surface-brand-muted">
            3 leave requests need a decision.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Approve</Button>
          <Button size="sm" variant="secondary">
            Later
          </Button>
          <Button size="sm" variant="outline">
            Details
          </Button>
          <Button size="sm" variant="destructive">
            Decline
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-success-soft text-success">Approved</Badge>
          <Badge className="bg-warning-soft text-warning">Pending</Badge>
          <Badge className="bg-info-soft text-info">In review</Badge>
          <Badge className="bg-brand-soft text-brand-soft-foreground">
            Selected
          </Badge>
        </div>
      </div>
    </div>
  )
}

export function ThemePage({ item }: { item: RegistryItem }) {
  const light = item.cssVars?.light ?? {}
  const dark = item.cssVars?.dark ?? {}
  const tokens = Object.keys(light).filter((token) => !isScale(token))
  const scale = (prefix: string) =>
    Object.entries(light)
      .filter(([token]) => token.startsWith(`${prefix}-`) && isScale(token))
      .map(([token, value]) => [token.split("-")[1], value] as [string, string])
  const fonts = (item.registryDependencies ?? [])
    .map((address) => address.match(/\/r\/(.+)\.json$/)?.[1])
    .flatMap((name) => (name ? [getItem(name)] : []))
    .filter((font): font is RegistryItem => font !== null)

  return (
    <>
      <ItemHeader item={item} />

      <SheetSection
        title="Typical application"
        description="This whole site runs on the theme. Below, the extra tokens at work in a small app frame. Toggle dark mode in the sidebar to see both."
      >
        <Sample />
      </SheetSection>

      <SheetSection
        title="Scales"
        description="Full brand and neutral ramps, available as Tailwind colors such as bg-brand-500 and text-ink-600."
      >
        <div className="flex flex-col gap-4">
          <Scale name="brand" values={scale("brand")} />
          <Scale name="ink" values={scale("ink")} />
        </div>
      </SheetSection>

      <SheetSection
        title="Characteristics"
        description="Every token the theme sets, with its light and dark value. Installing it replaces your current theme variables."
      >
        {groups.map((group) => {
          const rows = tokens.filter(group.match)
          if (rows.length === 0) return null
          const value = (scheme: Record<string, string>, token: string) =>
            token === "radius" ? (
              <span className="font-mono text-xs">
                {scheme[token] ?? "inherits"}
              </span>
            ) : (
              <Swatch value={scheme[token]} />
            )
          return (
            <div key={group.title} className="flex flex-col gap-2">
              <Table
                aria-label={`${group.title} tokens`}
                className="hidden table-fixed sm:table"
              >
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[34%]">{group.title}</TableHead>
                    <TableHead className="w-[33%]">Light</TableHead>
                    <TableHead className="w-[33%]">Dark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((token) => (
                    <TableRow key={token}>
                      <TableCell className="font-mono text-[0.8125rem]">
                        --{token}
                      </TableCell>
                      <TableCell>
                        {token === "radius" ? (
                          <span className="font-mono text-xs">
                            {light[token]}
                          </span>
                        ) : (
                          <Swatch value={light[token]} />
                        )}
                      </TableCell>
                      <TableCell>
                        {token === "radius" ? (
                          <span className="text-muted-foreground">
                            inherits
                          </span>
                        ) : (
                          <Swatch value={dark[token]} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="pt-2 text-sm font-medium sm:hidden">
                {group.title}
              </p>
              <dl
                aria-label={`${group.title} tokens`}
                className="flex flex-col divide-y divide-border border-y border-border sm:hidden"
              >
                {rows.map((token) => (
                  <div key={token} className="flex flex-col gap-1.5 py-2.5">
                    <dt className="font-mono text-[0.8125rem] break-all">
                      --{token}
                    </dt>
                    <dd className="flex items-center gap-2">
                      <span className="w-10 shrink-0 text-xs text-muted-foreground">
                        Light
                      </span>
                      {value(light, token)}
                    </dd>
                    <dd className="flex items-center gap-2">
                      <span className="w-10 shrink-0 text-xs text-muted-foreground">
                        Dark
                      </span>
                      {value(dark, token)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}
      </SheetSection>

      {fonts.length > 0 && (
        <SheetSection
          title="Typography"
          description="The theme pulls in these font parts."
        >
          <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {fonts.map((font) => (
              <li key={font.name} className="flex flex-col gap-1 bg-card p-4">
                <a
                  href={href(font.name)}
                  className="font-mono text-[0.8125rem] font-medium underline-offset-4 hover:text-primary hover:underline"
                >
                  {font.name}
                </a>
                <p className="text-sm text-muted-foreground">
                  {font.font?.variable} · {typeLabel(font.type)}
                </p>
              </li>
            ))}
          </ul>
        </SheetSection>
      )}
    </>
  )
}
