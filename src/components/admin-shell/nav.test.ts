import { describe, expect, it } from "vitest"

import {
  activeHref,
  badgeTotal,
  formatBadge,
  initials,
  normalizePath,
  parentOf,
  type NavParent,
  type NavSection,
} from "./nav"

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

describe("nav", () => {
  it("normalizes paths", () => {
    expect(normalizePath("/users/?tab=2#x")).toBe("/users")
    expect(normalizePath("/")).toBe("/")
    expect(normalizePath("/a/b/")).toBe("/a/b")
  })

  it("matches exact, prefix and longest", () => {
    expect(activeHref(nav, "/")).toBe("/")
    expect(activeHref(nav, "/employees/42/edit")).toBe("/employees")
    expect(activeHref(nav, "/leave/new")).toBe("/leave/new")
    expect(activeHref(nav, "/leave/123")).toBeNull() // "/leave" is exact
    expect(activeHref(nav, "/employees?tab=1")).toBe("/employees")
  })

  it("never lights the root link on other pages", () => {
    expect(activeHref(nav, "/employees")).toBe("/employees")
    expect(activeHref(nav, "/settings")).toBeNull()
  })

  it("finds a link's parent", () => {
    expect(parentOf(nav, "/leave/calendar")?.title).toBe("Leave")
    expect(parentOf(nav, "/employees")).toBeNull()
  })

  it("formats and sums badges", () => {
    expect([formatBadge(1), formatBadge(99), formatBadge(100)]).toEqual([
      "1",
      "99",
      "99+",
    ])
    expect(badgeTotal(nav[1].items[1] as NavParent)).toBe(122)
  })

  it("builds initials", () => {
    expect(initials("Rina Putri")).toBe("RP")
    expect(initials("rina")).toBe("R")
    expect(initials("  Ana  Maria  Lopez ")).toBe("AM")
  })
})
