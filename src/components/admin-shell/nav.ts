import type * as React from "react"

export type NavIcon = React.ComponentType<{ className?: string }>
export type NavLink = {
  title: string
  href: string
  icon?: NavIcon
  badge?: number
  exact?: boolean
}
export type NavParent = { title: string; icon?: NavIcon; items: NavLink[] }
export type NavItem = NavLink | NavParent
export type NavSection = { label?: string; items: NavItem[] }
/** Spread every prop onto the anchor: the sidebar passes data attributes, ARIA and handlers through it. */
export type LinkComponentProps = Omit<React.ComponentProps<"a">, "href"> & {
  href: string
}
export type LinkComponent = React.ComponentType<LinkComponentProps>
export type ShellUser = { name: string; email?: string; avatar?: string }
export type Crumb = { title: string; href?: string }

export function isParent(item: NavItem): item is NavParent {
  return "items" in item
}

/** Strips ?query and #hash, and a trailing "/" unless the path is "/". */
export function normalizePath(path: string): string {
  const bare = path.split(/[?#]/, 1)[0]
  return bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare || "/"
}

type Entry = { id: string; link: NavLink }

/** Every link with its position id: "<section>-<item>" or "<section>-<item>-<child>". */
function entries(nav: NavSection[]): Entry[] {
  return nav.flatMap((section, s) =>
    section.items.flatMap((item, i) =>
      isParent(item)
        ? item.items.map((link, j) => ({ id: `${s}-${i}-${j}`, link }))
        : [{ id: `${s}-${i}`, link: item }]
    )
  )
}

function bestEntry(nav: NavSection[], currentPath: string): Entry | null {
  const path = normalizePath(currentPath)
  let best: Entry | null = null
  let bestLength = -1
  for (const entry of entries(nav)) {
    const href = normalizePath(entry.link.href)
    const matches =
      path === href ||
      (entry.link.exact !== true && href !== "/" && path.startsWith(href + "/"))
    if (matches && href.length > bestLength) {
      best = entry
      bestLength = href.length
    }
  }
  return best
}

/** The href of the link that matches `currentPath`: longest wins, first on a tie. */
export function activeHref(
  nav: NavSection[],
  currentPath: string
): string | null {
  return bestEntry(nav, currentPath)?.link.href ?? null
}

/** Like `activeHref`, but returns the link's position id, so duplicate hrefs stay distinct. */
export function activeId(
  nav: NavSection[],
  currentPath: string
): string | null {
  return bestEntry(nav, currentPath)?.id ?? null
}

/** The parent's id ("<section>-<item>") for a child link id, else null. */
export function parentIdOf(id: string | null): string | null {
  const parts = id?.split("-") ?? []
  return parts.length === 3 ? `${parts[0]}-${parts[1]}` : null
}

/** True for a plain primary-button click; false for open-in-new-tab style clicks. */
export function isPlainClick(e: {
  button: number
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
}): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}

export function parentOf(nav: NavSection[], href: string): NavParent | null {
  for (const section of nav) {
    for (const item of section.items) {
      if (isParent(item) && item.items.some((l) => l.href === href)) return item
    }
  }
  return null
}

export function formatBadge(count: number): string {
  return count > 99 ? "99+" : String(count)
}

export function badgeTotal(parent: NavParent): number {
  return parent.items.reduce((sum, l) => sum + Math.max(l.badge ?? 0, 0), 0)
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("")
}
