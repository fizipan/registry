import * as React from "react"

import { type RegistryItem, getItem } from "@/docs/registry-data"
import { href } from "@/docs/use-route"
import { AdminShellPage } from "@/docs/pages/admin-shell-page"
import { FontPage } from "@/docs/pages/font-page"
import { PageHeaderPage } from "@/docs/pages/page-header-page"
import { ThemePage } from "@/docs/pages/theme-page"
import { TimePickerPage } from "@/docs/pages/time-picker-page"

type ItemPage = (props: { item: RegistryItem }) => React.ReactNode

const byName: Record<string, ItemPage> = {
  "admin-shell": AdminShellPage,
  "page-header": PageHeaderPage,
  "time-picker": TimePickerPage,
}

const byType: Record<string, ItemPage> = {
  "registry:theme": ThemePage,
  "registry:font": FontPage,
}

/** The datasheet for a registry item, or null when no page knows how to show it. */
export function pageFor(name: string) {
  const item = getItem(name)
  if (!item) return null
  const Page = byName[item.name] ?? byType[item.type]
  return Page ? <Page item={item} /> : null
}

export function NotFoundPage() {
  return (
    <header className="flex flex-col gap-3 border-b-2 border-foreground pb-4">
      <h1 className="font-display text-5xl leading-[0.9] font-bold tracking-wide uppercase">
        Part not found
      </h1>
      <p className="text-muted-foreground">
        There's no part with that name.{" "}
        <a
          href={href("")}
          className="text-foreground underline underline-offset-4"
        >
          See all parts
        </a>
        .
      </p>
    </header>
  )
}
