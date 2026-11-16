import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { AppSidebar, type AppSidebarProps } from "./app-sidebar"
import type { LinkComponent, NavSection } from "./nav"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

const nav: NavSection[] = [
  { items: [{ title: "Dashboard", href: "/" }] },
  {
    label: "People",
    items: [
      { title: "Employees", href: "/employees", badge: 3 },
      {
        title: "Leave",
        items: [
          { title: "Requests", href: "/leave", exact: true, badge: 120 },
          { title: "New request", href: "/leave/new" },
          { title: "Calendar", href: "/leave/calendar", badge: 2 },
        ],
      },
    ],
  },
]

const twoParents: NavSection[] = [
  {
    items: [
      { title: "Top", href: "/top" },
      { title: "Alpha", items: [{ title: "A one", href: "/a/one" }] },
      { title: "Beta", items: [{ title: "B one", href: "/b/one" }] },
    ],
  },
]

const Spy: LinkComponent = (props) => <a {...props} data-spy />

// Like a router link: forwards onClick first, then prevents the native navigation.
const PreventingSpy: LinkComponent = ({ onClick, ...props }) => (
  <a
    {...props}
    data-spy
    onClick={(e) => {
      onClick?.(e)
      e.preventDefault()
    }}
  />
)

function setup(props: Partial<AppSidebarProps> & { open?: boolean } = {}) {
  const { open = true, ...rest } = props
  const ui = (p: Partial<AppSidebarProps>) => (
    <TooltipProvider>
      <SidebarProvider defaultOpen={open}>
        <AppSidebar
          nav={nav}
          currentPath="/"
          linkComponent={Spy}
          brand={{ name: "Acme Admin", href: "/" }}
          {...rest}
          {...p}
        />
      </SidebarProvider>
    </TooltipProvider>
  )
  const view = render(ui({}))
  return {
    ...view,
    rerenderWith: (p: Partial<AppSidebarProps>) => view.rerender(ui(p)),
  }
}

describe("AppSidebar", () => {
  it("renders sections, labels and links through linkComponent", () => {
    setup({ currentPath: "/leave/new" })
    expect(screen.getByText("People")).toBeVisible()
    for (const [name, href] of [
      ["Dashboard", "/"],
      ["Employees", "/employees"],
      ["New request", "/leave/new"],
    ]) {
      const link = screen.getByRole("link", { name: new RegExp(name) })
      expect(link).toHaveAttribute("data-spy")
      expect(link).toHaveAttribute("href", href)
    }
  })

  it("marks the active link", () => {
    setup({ currentPath: "/employees/9" })
    expect(screen.getByRole("link", { name: /Employees/ })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
      "aria-current"
    )
  })

  it("opens the parent that holds the active link", () => {
    setup({ currentPath: "/leave/calendar" })
    expect(screen.getByRole("link", { name: /Calendar/ })).toBeVisible()
  })

  it("keeps one parent open at a time", async () => {
    const user = userEvent.setup()
    setup({ nav: twoParents, currentPath: "/a/one" })
    expect(screen.getByRole("link", { name: "A one" })).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Beta" }))
    expect(screen.getByRole("link", { name: "B one" })).toBeVisible()
    expect(
      screen.queryByRole("link", { name: "A one" })
    ).not.toBeInTheDocument()
  })

  it("reopens the active parent when the path changes", async () => {
    const user = userEvent.setup()
    const { rerenderWith } = setup({ nav: twoParents, currentPath: "/top" })
    await user.click(screen.getByRole("button", { name: "Beta" }))
    expect(screen.getByRole("link", { name: "B one" })).toBeVisible()
    rerenderWith({ currentPath: "/a/one" })
    expect(screen.getByRole("link", { name: "A one" })).toBeVisible()
    expect(
      screen.queryByRole("link", { name: "B one" })
    ).not.toBeInTheDocument()
  })

  it("shows badges and parent sums", async () => {
    const user = userEvent.setup()
    setup()
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("99+")).toBeInTheDocument() // closed Leave: 120 + 2
    await user.click(screen.getByRole("button", { name: /Leave/ }))
    expect(screen.getByText("120")).toHaveClass("sr-only")
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("hides zero and missing badges", () => {
    setup({
      nav: [
        {
          items: [
            { title: "Zero", href: "/zero", badge: 0 },
            { title: "None", href: "/none" },
          ],
        },
      ],
    })
    expect(
      document.querySelector('[data-sidebar="menu-badge"]')
    ).not.toBeInTheDocument()
  })

  it("shows a parent as a dropdown in collapsed mode", async () => {
    const user = userEvent.setup()
    setup({ open: false })
    await user.click(screen.getByRole("button", { name: /Leave/ }))
    for (const name of [/Requests/, /New request/, /Calendar/]) {
      const item = screen.getByRole("menuitem", { name })
      expect(item).toHaveAttribute("data-spy")
    }
  })

  it("renders the brand through linkComponent", () => {
    setup()
    const brand = screen.getByRole("link", { name: "Acme Admin" })
    expect(brand).toHaveAttribute("data-spy")
    expect(brand).toHaveAttribute("href", "/")
  })

  it("shows the user menu only with a user", () => {
    const { unmount } = setup()
    expect(screen.queryByText("RP")).not.toBeInTheDocument()
    unmount()
    setup({ user: { name: "Rina Putri", email: "rina@example.com" } })
    expect(screen.getByText("RP")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /Rina Putri/ })
    ).toBeInTheDocument()
  })

  it("shows sign out only with onSignOut", async () => {
    const user = userEvent.setup()
    const person = { name: "Rina Putri" }
    const { unmount } = setup({ user: person })
    await user.click(screen.getByRole("button", { name: /Rina Putri/ }))
    expect(
      screen.queryByRole("menuitem", { name: "Sign out" })
    ).not.toBeInTheDocument()
    unmount()

    const onSignOut = vi.fn()
    setup({ user: person, onSignOut })
    await user.click(screen.getByRole("button", { name: /Rina Putri/ }))
    const menu = screen.getByRole("menu")
    await user.click(within(menu).getByRole("menuitem", { name: "Sign out" }))
    expect(onSignOut).toHaveBeenCalledTimes(1)
  })

  it("keeps a top-level active link from closing an open parent", () => {
    const { rerenderWith } = setup({ nav: twoParents, currentPath: "/a/one" })
    rerenderWith({ currentPath: "/top" })
    expect(screen.getByRole("link", { name: "A one" })).toBeVisible()
  })

  it("keeps a manual open across a rerender with the same path", async () => {
    const user = userEvent.setup()
    const { rerenderWith } = setup({ nav: twoParents, currentPath: "/a/one" })
    await user.click(screen.getByRole("button", { name: "Beta" }))
    rerenderWith({ currentPath: "/a/one" })
    expect(screen.getByRole("link", { name: "B one" })).toBeVisible()
    expect(
      screen.queryByRole("link", { name: "A one" })
    ).not.toBeInTheDocument()
  })

  it("shows active state, badges and a dot in collapsed mode", async () => {
    const user = userEvent.setup()
    setup({ open: false, currentPath: "/leave/calendar" })
    await user.click(screen.getByRole("button", { name: /Leave/ }))
    expect(screen.getByRole("menuitem", { name: /Calendar/ })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(
      screen.getByRole("menuitem", { name: /New request/ })
    ).not.toHaveAttribute("aria-current")
    expect(
      within(screen.getByRole("menuitem", { name: /Requests/ })).getByText(
        "120"
      )
    ).toHaveClass("sr-only")
    expect(
      within(screen.getByRole("menuitem", { name: /Calendar/ })).getByText("2")
    ).toBeInTheDocument()
  })

  it("marks icons with a dot for badged links and parents", () => {
    const Icon = ({ className }: { className?: string }) => (
      <svg className={className} />
    )
    setup({
      open: false,
      nav: [
        {
          items: [
            { title: "Badged", href: "/b", icon: Icon, badge: 4 },
            { title: "Plain", href: "/p", icon: Icon },
            {
              title: "Group",
              icon: Icon,
              items: [{ title: "Kid", href: "/k", badge: 1 }],
            },
            {
              title: "Empty",
              icon: Icon,
              items: [{ title: "Kid 2", href: "/k2" }],
            },
          ],
        },
      ],
    })
    const dotIn = (name: RegExp) =>
      screen
        .getByRole(name.source === "Group" ? "button" : "link", { name })
        .querySelector("span[aria-hidden]")
    expect(dotIn(/Badged/)).toBeInTheDocument()
    expect(dotIn(/Plain/)).not.toBeInTheDocument()
    expect(dotIn(/Group/)).toBeInTheDocument()
    expect(
      screen
        .getByRole("button", { name: /Empty/ })
        .querySelector("span[aria-hidden]")
    ).not.toBeInTheDocument()
  })

  it("closes the collapsed dropdown when a link is selected", async () => {
    const user = userEvent.setup()
    setup({ open: false, linkComponent: PreventingSpy })
    await user.click(screen.getByRole("button", { name: /Leave/ }))
    await user.click(screen.getByRole("menuitem", { name: /New request/ }))
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })
})
