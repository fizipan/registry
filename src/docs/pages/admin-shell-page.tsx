import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  CodeSample,
  PropTable,
  SheetSection,
  type PropRow,
} from "@/docs/components/datasheet"
import { type RegistryItem } from "@/docs/registry-data"
import { ItemHeader } from "@/docs/pages/item-header"

const shellProps: PropRow[] = [
  {
    name: "nav",
    type: "NavSection[]",
    note: "The menu. An empty array renders the frame with an empty sidebar.",
  },
  {
    name: "currentPath",
    type: "string",
    note: "The current location. Query, hash and a trailing slash are ignored.",
  },
  {
    name: "linkComponent",
    type: "LinkComponent",
    fallback: "<a>",
    note: (
      <>
        Renders every navigation link. Spread every prop onto the anchor: the
        sidebar passes className, data attributes, ARIA and handlers through it.
        Next.js <code className="font-mono">Link</code> fits as is.
      </>
    ),
  },
  {
    name: "brand",
    type: "{ name: string; logo?: ReactNode; href?: string }",
    note: "Name and logo at the top of the sidebar. href links through linkComponent.",
  },
  {
    name: "user",
    type: "{ name: string; email?: string; avatar?: string }",
    fallback: "-",
    note: "Shows the user menu in the sidebar footer. Without it there is no footer.",
  },
  {
    name: "userMenu",
    type: "ReactNode",
    fallback: "-",
    note: "Extra DropdownMenuItem elements, shown above sign out.",
  },
  {
    name: "onSignOut",
    type: "() => void",
    fallback: "-",
    note: 'Adds a "Sign out" item to the user menu.',
  },
  {
    name: "breadcrumbs",
    type: "{ title: string; href?: string }[]",
    fallback: "-",
    note: "Header breadcrumbs. The last item is the current page.",
  },
  {
    name: "headerActions",
    type: "ReactNode",
    fallback: "-",
    note: "Right side of the header: notifications, search, a theme toggle.",
  },
  {
    name: "defaultSidebarOpen",
    type: "boolean",
    fallback: "true",
    note: "Whether the sidebar starts expanded.",
  },
  {
    name: "children",
    type: "ReactNode",
    note: "The page content, inside the inset panel.",
  },
]

const linkFields: PropRow[] = [
  { name: "title", type: "string", note: "The label." },
  { name: "href", type: "string", note: "Where the link goes." },
  {
    name: "icon",
    type: "ComponentType<{ className?: string }>",
    fallback: "-",
    note: "Any Lucide icon fits.",
  },
  {
    name: "badge",
    type: "number",
    fallback: "-",
    note: "Count shown at the right when above 0.",
  },
  {
    name: "exact",
    type: "boolean",
    fallback: "false",
    note: "Match only the exact path, not the paths below it.",
  },
]

const parentFields: PropRow[] = [
  { name: "title", type: "string", note: "The label." },
  {
    name: "icon",
    type: "ComponentType<{ className?: string }>",
    fallback: "-",
    note: "Any Lucide icon fits.",
  },
  {
    name: "items",
    type: "NavLink[]",
    note: "The submenu. An item with items is a parent; one without is a link.",
  },
]

const sectionFields: PropRow[] = [
  {
    name: "label",
    type: "string",
    fallback: "-",
    note: "Group label above the section.",
  },
  {
    name: "items",
    type: "(NavLink | NavParent)[]",
    note: "Links and parents in order.",
  },
]

const behavior = [
  {
    rule: "Active link",
    text: 'A link is active when currentPath equals its href, or starts with href + "/" unless exact is set. The longest match wins, and active links get aria-current="page".',
  },
  {
    rule: "Accordion",
    text: "One parent is open at a time. The parent holding the active link opens on load and when the path changes. You can still open or close any parent.",
  },
  {
    rule: "Badges",
    text: "A count of 100 or more shows as 99+, with the full number for screen readers. A closed parent shows the sum of its children.",
  },
  {
    rule: "Collapsed",
    text: "In icon mode links show a tooltip and a badge becomes a dot. A parent becomes a dropdown to the right that lists its children.",
  },
  {
    rule: "Mobile",
    text: "Below the sidebar breakpoint it is a sheet. Clicking a link closes it.",
  },
]

const nextjs = `"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { AdminShell } from "@/components/admin-shell/admin-shell"
import { nav } from "@/lib/nav"

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AdminShell
      nav={nav}
      currentPath={pathname}
      linkComponent={Link}
      brand={{ name: "Acme Admin", href: "/" }}
    >
      {children}
    </AdminShell>
  )
}`

const tanstack = `import {
  Link as RouterLink,
  useLocation,
} from "@tanstack/react-router"

import { AdminShell } from "@/components/admin-shell/admin-shell"
import type { LinkComponent } from "@/components/admin-shell/nav"
import { nav } from "@/lib/nav"

// to is typed per route; cast if your route tree is registered.
const Link: LinkComponent = ({ href, ...props }) => (
  <RouterLink to={href as never} {...props} />
)

export function Shell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()

  return (
    <AdminShell
      nav={nav}
      currentPath={pathname}
      linkComponent={Link}
      brand={{ name: "Acme Admin", href: "/" }}
    >
      {children}
    </AdminShell>
  )
}`

const reactRouter = `import { Link as RouterLink, useLocation } from "react-router"

import { AdminShell } from "@/components/admin-shell/admin-shell"
import type { LinkComponent } from "@/components/admin-shell/nav"
import { nav } from "@/lib/nav"

const Link: LinkComponent = ({ href, ...props }) => (
  <RouterLink to={href} {...props} />
)

export function Shell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()

  return (
    <AdminShell
      nav={nav}
      currentPath={pathname}
      linkComponent={Link}
      brand={{ name: "Acme Admin", href: "/" }}
    >
      {children}
    </AdminShell>
  )
}`

const navSample = `import { UsersIcon } from "lucide-react"

import type { NavSection } from "@/components/admin-shell/nav"

export const nav: NavSection[] = [
  {
    label: "People",
    items: [
      { title: "Employees", href: "/employees", icon: UsersIcon, badge: 3 },
    ],
  },
]`

export function AdminShellPage({ item }: { item: RegistryItem }) {
  return (
    <>
      <ItemHeader item={item} />

      <SheetSection
        title="Typical application"
        description="The whole shell with sample data. Click around: menu items move the active state, and the Leave parent opens on its own."
      >
        <iframe
          src="#/preview/admin-shell"
          title="Admin shell preview"
          className="h-[600px] w-full rounded-lg border bg-background"
        />
      </SheetSection>

      <SheetSection
        title="Pin description"
        description="Links and the current path come in as props, so the block never imports a router."
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">AdminShell</h3>
            <PropTable label="AdminShell props" rows={shellProps} />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">NavSection</h3>
            <PropTable
              label="NavSection fields"
              rows={sectionFields}
              first="Field"
            />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">NavLink</h3>
            <PropTable label="NavLink fields" rows={linkFields} first="Field" />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">NavParent</h3>
            <PropTable
              label="NavParent fields"
              rows={parentFields}
              first="Field"
            />
          </div>
        </div>
      </SheetSection>

      <SheetSection
        title="Behavior"
        description="What the shell does without being told."
      >
        <Table aria-label="Behavior">
          <TableBody>
            {behavior.map((row) => (
              <TableRow key={row.rule}>
                <TableCell className="w-36 align-top text-sm font-medium">
                  {row.rule}
                </TableCell>
                <TableCell className="text-sm whitespace-normal text-muted-foreground">
                  {row.text}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SheetSection>

      <SheetSection
        title="Usage"
        description="Wrap your routes once. Each router needs a two-line link wrapper that maps href to its own prop and spreads the rest."
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">Menu data</h3>
            <CodeSample code={navSample} />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">Next.js App Router</h3>
            <CodeSample code={nextjs} />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">TanStack Router</h3>
            <CodeSample code={tanstack} />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">React Router</h3>
            <CodeSample code={reactRouter} />
          </div>
        </div>
      </SheetSection>
    </>
  )
}
