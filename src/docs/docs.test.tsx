import { act, fireEvent, render, screen, within } from "@testing-library/react"
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

  it("keeps the stamp for a full window after the latest copy", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    try {
      userEvent.setup() // installs the clipboard stub
      renderApp()
      goTo("#/time-picker")
      const ordering = screen.getByRole("region", {
        name: "Ordering information",
      })
      const copy = () =>
        act(async () => {
          fireEvent.click(
            within(ordering).getByRole("button", {
              name: /^cop(y command|ied)$/i,
            })
          )
        })
      const stamp = () => ordering.querySelector("[data-stamped]") !== null

      await copy()
      expect(stamp()).toBe(true)
      await act(() => vi.advanceTimersByTimeAsync(600))
      await copy()
      await act(() => vi.advanceTimersByTimeAsync(300))
      // 900 ms after the first copy, 300 ms after the second: still stamped.
      expect(stamp()).toBe(true)
      await act(() => vi.advanceTimersByTimeAsync(500))
      expect(stamp()).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it("announces a successful copy to assistive tech", async () => {
    const user = userEvent.setup()
    renderApp()
    goTo("#/time-picker")
    const ordering = screen.getByRole("region", {
      name: "Ordering information",
    })
    const status = within(ordering).getByRole("status")
    expect(status).toHaveTextContent("")
    await user.click(
      within(ordering).getByRole("button", { name: "Copy command" })
    )
    expect(status).toHaveTextContent("Copied to clipboard")
  })
})

describe("focus and skip link", () => {
  it("moves focus to the main region when the route changes", () => {
    renderApp()
    expect(screen.getByRole("main")).not.toHaveFocus()
    goTo("#/time-picker")
    expect(screen.getByRole("main")).toHaveFocus()
  })

  it("offers a skip link that focuses main without changing the route", async () => {
    const user = userEvent.setup()
    renderApp()
    goTo("#/time-picker")
    screen.getByRole("link", { name: "All parts" }).focus()
    const skip = screen.getByRole("link", { name: "Skip to content" })
    await user.click(skip)
    expect(screen.getByRole("main")).toHaveFocus()
    expect(window.location.hash).toBe("#/time-picker")
  })
})

describe("theme", () => {
  it("syncs color-scheme and theme-color with the resolved theme", async () => {
    document.head.insertAdjacentHTML(
      "beforeend",
      '<meta name="theme-color" content="#181211" />'
    )
    const user = userEvent.setup()
    renderApp()
    await user.click(
      screen.getAllByRole("button", { name: /switch to dark mode/i })[0]!
    )
    expect(document.documentElement.style.colorScheme).toBe("dark")
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      "#070505"
    )
    document.querySelector('meta[name="theme-color"]')?.remove()
  })
})
