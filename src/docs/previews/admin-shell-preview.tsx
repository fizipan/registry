import * as React from "react"
import {
  BellIcon,
  CalendarIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  PlusIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react"

import { AdminShell } from "@/components/admin-shell/admin-shell"
import {
  type LinkComponent,
  type NavSection,
  isParent,
} from "@/components/admin-shell/nav"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/registry/page-header/page-header"

const nav: NavSection[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboardIcon }],
  },
  {
    label: "People",
    items: [
      { title: "Employees", href: "/employees", icon: UsersIcon, badge: 3 },
      {
        title: "Leave",
        icon: CalendarIcon,
        items: [
          { title: "Requests", href: "/leave/requests", badge: 12 },
          { title: "New request", href: "/leave/new" },
          { title: "Calendar", href: "/leave/calendar" },
        ],
      },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "General", href: "/settings", icon: SettingsIcon, exact: true },
      { title: "Roles", href: "/settings/roles", icon: ShieldIcon },
    ],
  },
]

function crumbsFor(path: string) {
  for (const section of nav) {
    for (const item of section.items) {
      if (isParent(item)) {
        const child = item.items.find((l) => l.href === path)
        if (child) return [{ title: item.title }, { title: child.title }]
      } else if (item.href === path) {
        return [{ title: item.title }]
      }
    }
  }
  return [{ title: "Dashboard" }]
}

const NavigateContext = React.createContext<(path: string) => void>(() => {})

// Defined at module scope so its identity never changes: a new component type
// per render would remount every link and drop focus after each click.
const PreviewLink: LinkComponent = ({ href, onClick, ...props }) => {
  const navigate = React.useContext(NavigateContext)
  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event)
        event.preventDefault()
        navigate(href)
      }}
      {...props}
    />
  )
}

export function AdminShellPreview() {
  const [path, setPath] = React.useState("/")

  const crumbs = crumbsFor(path)
  const title = crumbs[crumbs.length - 1].title

  return (
    <NavigateContext value={setPath}>
      <AdminShell
        nav={nav}
        currentPath={path}
        linkComponent={PreviewLink}
        brand={{ name: "Acme Admin", href: "/" }}
        user={{ name: "Rina Putri", email: "rina@example.com" }}
        onSignOut={() => {}}
        breadcrumbs={crumbs}
        headerActions={
          <Button variant="ghost" size="icon">
            <BellIcon />
            <span className="sr-only">Notifications</span>
          </Button>
        }
      >
        <PageHeader
          title={title}
          description="Placeholder content for the preview."
          actions={
            <Button size="sm">
              <PlusIcon data-icon="inline-start" />
              New
            </Button>
          }
        />
        <div className="flex min-h-48 flex-1 items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
          <FileTextIcon className="size-4" />
          Page content goes here.
        </div>
      </AdminShell>
    </NavigateContext>
  )
}
