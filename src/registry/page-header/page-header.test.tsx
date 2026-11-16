import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { PageHeader } from "./page-header"

describe("PageHeader", () => {
  it("renders the title as h1", () => {
    render(<PageHeader title="Employees" />)
    expect(
      screen.getByRole("heading", { level: 1, name: "Employees" })
    ).toBeTruthy()
  })

  it("shows the count badge only when given", () => {
    const { container, rerender } = render(
      <PageHeader title="Employees" count={0} />
    )
    expect(screen.getByText("0")).toBeTruthy()
    expect(container.querySelector('[data-slot="badge"]')).not.toBeNull()

    rerender(<PageHeader title="Employees" />)
    expect(container.querySelector('[data-slot="badge"]')).toBeNull()
  })

  it("renders description and actions", () => {
    render(
      <PageHeader
        title="Employees"
        description="Everyone on the payroll"
        actions={<button type="button">Add employee</button>}
      />
    )
    expect(screen.getByText("Everyone on the payroll")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Add employee" })).toBeTruthy()
  })

  it("has no eyebrow", () => {
    render(<PageHeader title="Employees" count={3} />)
    const h1 = screen.getByRole("heading", { level: 1 })
    expect(h1.previousElementSibling).toBeNull()
  })
})
