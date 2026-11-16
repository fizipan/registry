import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AdminShell, type AdminShellProps } from "./admin-shell"
import type { LinkComponent, NavSection } from "./nav"

const nav: NavSection[] = [{ items: [{ title: "Dashboard", href: "/" }] }]

const SpyLink: LinkComponent = (props) => <a data-spy="" {...props} />

function setup(props: Partial<AdminShellProps> = {}) {
  return render(
    <AdminShell
      nav={nav}
      currentPath="/"
      brand={{ name: "Acme" }}
      linkComponent={SpyLink}
      {...props}
    >
      <p>Hello</p>
    </AdminShell>
  )
}

describe("AdminShell", () => {
  it("renders breadcrumbs with links and a current page", () => {
    setup({
      breadcrumbs: [
        { title: "People", href: "/people" },
        { title: "Employees" },
      ],
    })
    const link = screen.getByRole("link", { name: "People" })
    expect(link).toHaveAttribute("href", "/people")
    expect(link).toHaveAttribute("data-spy")
    const page = screen.getByText("Employees")
    expect(page).toHaveAttribute("aria-current", "page")
    expect(page).toHaveClass("truncate")
  })

  it("renders no breadcrumb without breadcrumbs", () => {
    setup()
    expect(screen.queryByRole("navigation", { name: "breadcrumb" })).toBeNull()
    const header = screen.getByRole("banner")
    expect(
      within(header).getByRole("button", { name: "Toggle Sidebar" })
    ).toBeInTheDocument()
  })

  it("renders header actions", () => {
    setup({ headerActions: <button>Notifications</button> })
    const header = screen.getByRole("banner")
    expect(
      within(header).getByRole("button", { name: "Notifications" })
    ).toBeInTheDocument()
  })

  it("composes sidebar, header and content", () => {
    setup()
    expect(within(screen.getByRole("main")).getByText("Hello")).toBeVisible()
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument()
  })

  it("works with the default link component", () => {
    setup({ linkComponent: undefined })
    const link = screen.getByRole("link", { name: "Dashboard" })
    expect(link.tagName).toBe("A")
    expect(link).toHaveAttribute("href", "/")
  })

  it("starts collapsed when defaultSidebarOpen is false", () => {
    const { container } = setup({ defaultSidebarOpen: false })
    expect(container.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      "data-state",
      "collapsed"
    )
  })

  it("renders the frame with an empty nav", () => {
    setup({ nav: [] })
    expect(screen.getByText("Acme")).toBeInTheDocument()
    expect(within(screen.getByRole("main")).getByText("Hello")).toBeVisible()
  })
})
