import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { App } from "@/App"
import { ThemeProvider } from "@/components/theme-provider"
import {
  installCommands,
  items,
  registryDependencyName,
} from "@/docs/registry-data"
import { pageFor } from "@/docs/pages"

function renderApp() {
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}

function goTo(path: string) {
  act(() => {
    window.location.hash = path
    window.dispatchEvent(new HashChangeEvent("hashchange"))
  })
}

afterEach(() => {
  window.location.hash = ""
})

describe("registry data", () => {
  it("builds the three install routes for an item", () => {
    expect(installCommands("time-picker")).toEqual({
      namespace: "npx shadcn@latest add @fizipan/time-picker",
      github: "npx shadcn@latest add fizipan/registry/time-picker",
      mcp: "Add @fizipan/time-picker to this project",
    })
  })

  it("names registry dependencies the way a reader installs them", () => {
    expect(registryDependencyName("button")).toBe("button")
    expect(
      registryDependencyName(
        "https://fizipan-registry.vercel.app/r/font-inter.json"
      )
    ).toBe("@fizipan/font-inter")
  })
})

describe("docs pages", () => {
  it("has a datasheet for every registry item", () => {
    for (const item of items) {
      expect(pageFor(item.name), item.name).not.toBeNull()
    }
  })

  it("lists every item in the catalog", () => {
    renderApp()
    const table = screen.getByRole("table", { name: "Parts" })
    for (const item of items) {
      expect(
        within(table).getByRole("link", { name: item.name })
      ).toBeInTheDocument()
    }
  })

  it("opens a datasheet from the hash", () => {
    renderApp()
    goTo("#/time-picker")
    expect(
      screen.getByRole("heading", { level: 1, name: "time-picker" })
    ).toBeInTheDocument()
  })

  it("shows a not-found page for an unknown part", () => {
    renderApp()
    goTo("#/nope")
    expect(
      screen.getByRole("heading", { level: 1, name: "Part not found" })
    ).toBeInTheDocument()
  })
})

describe("blocks and previews", () => {
  it("renders the preview without the docs shell", () => {
    renderApp()
    goTo("#/preview/admin-shell")
    expect(
      screen.queryByRole("navigation", { name: "Registry" })
    ).not.toBeInTheDocument()
    expect(screen.getAllByText("Acme Admin").length).toBeGreaterThan(0)
  })

  it("groups blocks in the nav", () => {
    renderApp()
    const nav = screen.getByRole("navigation", { name: "Registry" })
    expect(within(nav).getByText("Blocks")).toBeInTheDocument()
    expect(
      within(nav).getByRole("link", { name: "admin-shell" })
    ).toBeInTheDocument()
  })
})

describe("admin shell preview", () => {
  const navLink = (name: string) =>
    screen
      .getAllByRole("link")
      .find(
        (a) =>
          a.getAttribute("data-sidebar") === "menu-button" &&
          a.textContent?.startsWith(name)
      )!

  it("keeps the clicked link mounted and focused, and moves the active state", async () => {
    const user = userEvent.setup()
    renderApp()
    goTo("#/preview/admin-shell")

    const link = navLink("Employees")
    link.focus()
    await user.click(link)

    expect(link).toBeInTheDocument()
    expect(navLink("Employees")).toBe(link)
    expect(link).toHaveFocus()
    expect(link).toHaveAttribute("aria-current", "page")
    expect(navLink("Dashboard")).not.toHaveAttribute("aria-current")
  })
})

describe("admin shell datasheet", () => {
  it("documents the router wrapper pitfalls", () => {
    renderApp()
    goTo("#/admin-shell")
    const text = document.body.textContent ?? ""
    expect(text).toContain("activeOptions={{ exact: true }}")
    expect(text).toContain("not NavLink")
    expect(text).toContain("module scope")
    expect(text).toContain("<main>")
    expect(text).toContain("typedRoutes")
    expect(text).toContain("forwardRef")
    expect(text).toContain("client component")
    expect(text).toContain("an icon")
  })
})

describe("ordering block", () => {
  it("switches the install route and copies the command", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText")
    renderApp()
    goTo("#/time-picker")

    const ordering = screen.getByRole("region", {
      name: "Ordering information",
    })
    await user.click(within(ordering).getByRole("tab", { name: "GitHub" }))
    await user.click(
      within(ordering).getByRole("button", { name: "Copy command" })
    )

    expect(writeText).toHaveBeenCalledWith(
      "npx shadcn@latest add fizipan/registry/time-picker"
    )
    expect(
      within(ordering).getByRole("button", { name: "Copied" })
    ).toBeInTheDocument()
  })
})
