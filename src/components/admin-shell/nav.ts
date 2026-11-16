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
export type LinkComponentProps = {
  href: string
  className?: string
  children?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  "aria-current"?: "page"
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

function links(nav: NavSection[]): NavLink[] {
  return nav.flatMap((section) =>
    section.items.flatMap((item) => (isParent(item) ? item.items : [item]))
  )
}

/** The href of the link that matches `currentPath`: longest wins, first on a tie. */
export function activeHref(
  nav: NavSection[],
  currentPath: string
): string | null {
  const path = normalizePath(currentPath)
  let best: string | null = null
  for (const link of links(nav)) {
    const href = normalizePath(link.href)
    const matches =
      path === href ||
      (link.exact !== true && href !== "/" && path.startsWith(href + "/"))
    if (matches && (best === null || href.length > best.length)) best = href
  }
  return best === null
    ? null
    : (links(nav).find((l) => normalizePath(l.href) === best)?.href ?? null)
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
