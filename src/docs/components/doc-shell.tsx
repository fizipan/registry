import * as React from "react"
import { MenuIcon, MoonIcon, SunIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useTheme } from "@/components/theme-provider"
import {
  REPO_URL,
  getItem,
  groups,
  itemsOfType,
  typeLabel,
} from "@/docs/registry-data"
import { href } from "@/docs/use-route"

function Wordmark({ className }: { className?: string }) {
  return (
    <a
      href={href("")}
      className={cn(
        "font-display text-lg leading-none font-bold tracking-wider uppercase",
        className
      )}
    >
      fizipan<span className="text-sidebar-primary">/</span>registry
    </a>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}

function useDarkMode() {
  const { theme, setTheme } = useTheme()
  const systemDark = React.useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(prefers-color-scheme: dark)")
      query.addEventListener("change", onChange)
      return () => query.removeEventListener("change", onChange)
    },
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false
  )
  const dark = theme === "dark" || (theme === "system" && systemDark)
  return { dark, toggle: () => setTheme(dark ? "light" : "dark") }
}

function ShellActions({ className }: { className?: string }) {
  const { dark, toggle } = useDarkMode()

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button variant="ghost" size="icon-sm" asChild>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Source on GitHub"
        >
          <GitHubIcon />
        </a>
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={toggle}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </Button>
    </div>
  )
}

function NavList({
  route,
  onNavigate,
}: {
  route: string
  onNavigate?: () => void
}) {
  const sections = [
    ...groups.map((group) => ({
      label: group.label,
      links: itemsOfType(group.type).map((item) => ({
        route: item.name,
        label: item.name,
        tag: typeLabel(item.type),
        mono: true,
      })),
    })),
    {
      label: "Guides",
      links: [
        { route: "setup", label: "Install routes", tag: "", mono: false },
      ],
    },
  ].filter((section) => section.links.length > 0)

  return (
    <nav aria-label="Registry" className="flex flex-col gap-6">
      <a
        href={href("")}
        onClick={onNavigate}
        aria-current={route === "" ? "page" : undefined}
        className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-muted transition-colors outline-none hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring active:bg-sidebar-accent/80 aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-sidebar-accent-foreground pointer-coarse:py-3"
      >
        All parts
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-sidebar-primary opacity-0 transition-opacity duration-150 group-aria-[current=page]:opacity-100"
        />
      </a>
      {sections.map((section) => (
        <div key={section.label} className="flex flex-col gap-1">
          <p className="px-2 pb-1 font-display text-xs font-semibold tracking-[0.12em] text-sidebar-muted uppercase">
            {section.label}
          </p>
          <ul className="flex flex-col gap-0.5 pointer-coarse:gap-0">
            {section.links.map((link) => (
              <li key={link.route}>
                <a
                  href={href(link.route)}
                  onClick={onNavigate}
                  aria-current={route === link.route ? "page" : undefined}
                  className={cn(
                    "group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sidebar-foreground/80 transition-colors outline-none hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring active:bg-sidebar-accent/80 aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-sidebar-accent-foreground pointer-coarse:py-3",
                    link.mono ? "font-mono text-[0.8125rem]" : "text-sm"
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-sidebar-primary opacity-0 transition-opacity duration-150 group-aria-[current=page]:opacity-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/** The document title for a route, so each page is announced by name. */
function pageTitle(route: string) {
  if (route === "") return "fizipan/registry · shadcn/ui parts"
  if (route === "setup") return "Install routes · fizipan/registry"
  const item = getItem(route)
  return `${item ? item.name : "Part not found"} · fizipan/registry`
}

export function DocShell({
  route,
  children,
}: {
  route: string
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const mainRef = React.useRef<HTMLElement>(null)
  const mounted = React.useRef(false)
  const navigated = React.useRef(false)

  // A route change is a page change: move focus into the content so keyboard
  // and screen-reader users start at the top of the new page.
  React.useEffect(() => {
    document.title = pageTitle(route)
    if (mounted.current) mainRef.current?.focus({ preventScroll: true })
    mounted.current = true
  }, [route])

  return (
    <div className="flex min-h-svh">
      {/* A plain #content href would be read as a route, so focus main instead. */}
      <a
        href={href(route)}
        onClick={(event) => {
          event.preventDefault()
          mainRef.current?.focus()
        }}
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-sidebar focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-ring"
      >
        Skip to content
      </a>
      <aside className="hidden w-60 shrink-0 bg-sidebar text-sidebar-foreground md:block">
        <div className="sticky top-0 flex h-svh flex-col gap-8 overflow-y-auto px-4 py-6">
          <Wordmark className="px-2" />
          <NavList route={route} />
          <ShellActions className="mt-auto px-1 text-sidebar-foreground [&_[data-slot=button]]:text-sidebar-muted [@media(hover:hover)]:[&_[data-slot=button]:hover]:bg-sidebar-accent [@media(hover:hover)]:[&_[data-slot=button]:hover]:text-sidebar-accent-foreground" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-sidebar pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-3 pl-[max(1rem,env(safe-area-inset-left))] text-sidebar-foreground md:hidden">
          <Wordmark />
          <div className="flex items-center gap-1 [&_[data-slot=button]]:text-sidebar-foreground [&_[data-slot=button]]:pointer-coarse:size-11 [@media(hover:hover)]:[&_[data-slot=button]:hover]:bg-sidebar-accent">
            <ShellActions />
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open navigation"
                  // SheetTrigger replaces data-slot, so the wrapper's button rules miss this one.
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:bg-sidebar-accent pointer-coarse:size-11"
                >
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent
                data-docs-nav
                side="right"
                // After a nav tap, leave focus on the new page, not the hamburger.
                onCloseAutoFocus={(event) => {
                  if (navigated.current) {
                    event.preventDefault()
                    // Tapping the current page changes no route, so focus main here too.
                    mainRef.current?.focus({ preventScroll: true })
                  }
                  navigated.current = false
                }}
                className="w-72 overflow-y-auto border-none bg-sidebar pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] text-sidebar-foreground"
              >
                <SheetHeader>
                  <SheetTitle className="text-sidebar-foreground">
                    Navigation
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Parts and guides in the registry
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <NavList
                    route={route}
                    onNavigate={() => {
                      navigated.current = true
                      setMenuOpen(false)
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main
          ref={mainRef}
          tabIndex={-1}
          className="mx-auto flex w-full max-w-5xl flex-col gap-10 pt-8 pr-[max(1.25rem,env(safe-area-inset-right))] pb-[calc(5rem+env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] outline-none sm:pr-[max(2rem,env(safe-area-inset-right))] sm:pl-[max(2rem,env(safe-area-inset-left))] md:px-12 md:pt-12"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
