import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/docs/components/copy-button"

/** A datasheet title strip: part name, one-line function, and a ruled block of facts. */
export function TitleStrip({
  name,
  description,
  facts,
  aside,
}: {
  name: string
  description: React.ReactNode
  facts: { label: string; value: React.ReactNode; mono?: boolean }[]
  aside?: React.ReactNode
}) {
  return (
    <header className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 border-b-2 border-foreground pb-4">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h1 className="font-display text-5xl leading-[0.9] font-bold tracking-wide uppercase sm:text-6xl">
            {name}
          </h1>
          {aside}
        </div>
        <p className="max-w-[62ch] text-base text-pretty text-muted-foreground">
          {description}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex min-w-0 flex-col gap-1 bg-card px-3 py-2.5"
          >
            <dt className="text-xs text-muted-foreground">{fact.label}</dt>
            <dd
              className={cn(
                "min-w-0 break-words text-foreground",
                fact.mono === false ? "text-sm" : "font-mono text-[0.8125rem]"
              )}
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </header>
  )
}

/** A ruled datasheet section with a condensed caps heading. */
export function SheetSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const id = React.useId()

  return (
    <section
      aria-labelledby={id}
      className={cn(
        "flex flex-col gap-4 border-t border-border pt-6",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <h2
          id={id}
          className="font-display text-xl font-semibold tracking-wide uppercase"
        >
          {title}
        </h2>
        {description && (
          <p className="max-w-[65ch] text-sm text-pretty text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

/** A static code sample with a copy button. */
export function CodeSample({
  code,
  label = "Copy code",
}: {
  code: string
  label?: string
}) {
  return (
    <div className="relative rounded-lg border border-border bg-muted/60">
      <pre className="overflow-x-auto p-4 pr-12 font-mono text-[0.8125rem] leading-6">
        <code>{code}</code>
      </pre>
      <div className="absolute top-2 right-2">
        <CopyButton value={code} label={label} />
      </div>
    </div>
  )
}

export type PropRow = {
  name: string
  type: string
  fallback?: string
  note: React.ReactNode
}

/** A pin table that stacks into a definition list below the sm breakpoint. */
export function PropTable({
  label,
  rows,
  first = "Prop",
}: {
  label: string
  rows: PropRow[]
  first?: string
}) {
  return (
    <>
      <div className="hidden sm:block">
        <Table aria-label={label}>
          <TableHeader>
            <TableRow>
              <TableHead>{first}</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-mono text-[0.8125rem] font-medium">
                  {row.name}
                </TableCell>
                <TableCell className="font-mono text-[0.8125rem] text-muted-foreground">
                  {row.type}
                </TableCell>
                <TableCell className="font-mono text-[0.8125rem] text-muted-foreground">
                  {row.fallback ?? "-"}
                </TableCell>
                <TableCell className="min-w-56 text-sm whitespace-normal text-muted-foreground">
                  {row.note}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <dl
        aria-label={label}
        className="flex flex-col divide-y divide-border border-y border-border sm:hidden"
      >
        {rows.map((row) => (
          <div key={row.name} className="flex flex-col gap-1 py-3">
            <dt className="font-mono text-[0.8125rem] font-medium">
              {row.name}
            </dt>
            <dd className="font-mono text-xs break-words text-muted-foreground">
              {row.type} · default {row.fallback ?? "-"}
            </dd>
            <dd className="text-sm text-pretty text-muted-foreground">
              {row.note}
            </dd>
          </div>
        ))}
      </dl>
    </>
  )
}
