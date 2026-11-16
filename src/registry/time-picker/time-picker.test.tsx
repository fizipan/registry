import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Field, FieldLabel } from "@/components/ui/field"

import {
  formatTime,
  getMinuteOptions,
  isTimeInRange,
  parseTime,
  TimePicker,
} from "./time-picker"

describe("parseTime", () => {
  it("parses HH:mm", () => {
    expect(parseTime("09:05")).toEqual({ hour: 9, minute: 5 })
    expect(parseTime("00:00")).toEqual({ hour: 0, minute: 0 })
    expect(parseTime("23:59")).toEqual({ hour: 23, minute: 59 })
  })
  it("rejects everything else", () => {
    for (const bad of [
      "",
      "9:05",
      "24:00",
      "12:60",
      "12:5",
      "12-30",
      " 12:30",
      "12:30:00",
    ]) {
      expect(parseTime(bad)).toBeNull()
    }
  })
})

it("formatTime zero-pads", () => {
  expect(formatTime(9, 5)).toBe("09:05")
  expect(formatTime(23, 0)).toBe("23:00")
})

describe("getMinuteOptions", () => {
  it("steps through the hour", () => {
    expect(getMinuteOptions(1)).toHaveLength(60)
    expect(getMinuteOptions(15)).toEqual([0, 15, 30, 45])
    expect(getMinuteOptions(7).at(-1)).toBe(56)
  })
  it("falls back to 1 for invalid steps", () => {
    for (const step of [0, -5, 1.5, Number.NaN])
      expect(getMinuteOptions(step)).toHaveLength(60)
  })
  it("gives only 00 for steps of an hour or more", () => {
    expect(getMinuteOptions(60)).toEqual([0])
  })
})

describe("isTimeInRange", () => {
  it("allows anything without bounds", () => {
    expect(isTimeInRange({ hour: 3, minute: 0 })).toBe(true)
  })
  it("treats bounds as inclusive", () => {
    const at = (h: number, m: number) =>
      isTimeInRange({ hour: h, minute: m }, "08:00", "17:00")
    expect([at(8, 0), at(17, 0), at(7, 59), at(17, 1)]).toEqual([
      true,
      true,
      false,
      false,
    ])
  })
  it("ignores malformed bounds", () => {
    expect(isTimeInRange({ hour: 3, minute: 0 }, "8:00", "25:00")).toBe(true)
  })
  it("rejects times outside a single bound", () => {
    expect(isTimeInRange({ hour: 7, minute: 0 }, "08:00")).toBe(false)
    expect(isTimeInRange({ hour: 18, minute: 0 }, undefined, "17:00")).toBe(
      false
    )
  })
  it("applies the valid bound next to a malformed one", () => {
    expect(isTimeInRange({ hour: 7, minute: 0 }, "8:00", "17:00")).toBe(true)
    expect(isTimeInRange({ hour: 18, minute: 0 }, "8:00", "17:00")).toBe(false)
  })
  it("allows nothing when min is after max", () => {
    expect(isTimeInRange({ hour: 12, minute: 0 }, "18:00", "08:00")).toBe(false)
  })
})

const hours = () => screen.getByRole("listbox", { name: "Hour" })
const minutes = () => screen.getByRole("listbox", { name: "Minute" })
const option = (list: HTMLElement, text: string) =>
  within(list).getByRole("option", { name: text })

describe("TimePicker", () => {
  it("shows the placeholder when empty", () => {
    render(<TimePicker />)
    expect(screen.getByRole("button")).toHaveTextContent("Select time")
  })

  it("shows the value", () => {
    render(<TimePicker defaultValue="09:30" />)
    expect(screen.getByRole("button")).toHaveTextContent("09:30")
  })

  it("opens hour and minute columns", async () => {
    const user = userEvent.setup()
    render(<TimePicker />)
    await user.click(screen.getByRole("button"))
    const h = within(hours()).getAllByRole("option")
    expect(h).toHaveLength(24)
    expect(h[0]).toHaveTextContent("00")
    expect(h[23]).toHaveTextContent("23")
    expect(within(minutes()).getAllByRole("option")).toHaveLength(60)
  })

  it("uses custom column labels", async () => {
    const user = userEvent.setup()
    render(<TimePicker hourLabel="Jam" minuteLabel="Menit" />)
    await user.click(screen.getByRole("button"))
    expect(screen.getByRole("listbox", { name: "Jam" })).toBeInTheDocument()
    expect(screen.getByRole("listbox", { name: "Menit" })).toBeInTheDocument()
  })

  it("fills the first valid minute when picking an hour", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker onValueChange={onValueChange} />)
    await user.click(screen.getByRole("button"))
    await user.click(option(hours(), "09"))
    expect(onValueChange).toHaveBeenCalledWith("09:00")
    expect(hours()).toBeInTheDocument()
  })

  it("commits and closes when picking a minute", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker defaultValue="09:00" onValueChange={onValueChange} />)
    await user.click(screen.getByRole("button"))
    await user.click(option(minutes(), "30"))
    expect(onValueChange).toHaveBeenCalledWith("09:30")
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())
    expect(screen.getByRole("button")).toHaveTextContent("09:30")
  })

  it("fills the first valid hour when picking a minute first", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker min="08:00" onValueChange={onValueChange} />)
    await user.click(screen.getByRole("button"))
    await user.click(option(minutes(), "30"))
    expect(onValueChange).toHaveBeenCalledWith("08:30")
  })

  it("stays controlled", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <TimePicker value="09:00" onValueChange={onValueChange} />
    )
    await user.click(screen.getByRole("button"))
    await user.click(option(minutes(), "30"))
    expect(onValueChange).toHaveBeenCalledWith("09:30")
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())
    expect(screen.getByRole("button")).toHaveTextContent("09:00")
    rerender(<TimePicker value="10:15" onValueChange={onValueChange} />)
    expect(screen.getByRole("button")).toHaveTextContent("10:15")
  })

  it("steps minutes", async () => {
    const user = userEvent.setup()
    render(<TimePicker minuteStep={15} />)
    await user.click(screen.getByRole("button"))
    const texts = within(minutes())
      .getAllByRole("option")
      .map((o) => o.textContent)
    expect(texts).toEqual(["00", "15", "30", "45"])
  })

  it("treats a bad step as 1", async () => {
    const user = userEvent.setup()
    render(<TimePicker minuteStep={0} />)
    await user.click(screen.getByRole("button"))
    expect(within(minutes()).getAllByRole("option")).toHaveLength(60)
  })

  it("disables times outside min and max", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker min="08:00" max="17:00" onValueChange={onValueChange} />)
    await user.click(screen.getByRole("button"))
    expect(option(hours(), "07")).toHaveAttribute("aria-disabled", "true")
    expect(option(hours(), "18")).toHaveAttribute("aria-disabled", "true")
    expect(option(hours(), "08")).toHaveAttribute("aria-disabled", "false")
    expect(option(hours(), "17")).toHaveAttribute("aria-disabled", "false")
    await user.click(option(hours(), "07"))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("disables an hour with no valid minute", async () => {
    const user = userEvent.setup()
    render(<TimePicker min="08:50" minuteStep={15} />)
    await user.click(screen.getByRole("button"))
    expect(option(hours(), "08")).toHaveAttribute("aria-disabled", "true")
    expect(option(hours(), "09")).toHaveAttribute("aria-disabled", "false")
  })

  it("snaps the minute when switching hours", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TimePicker
        min="08:30"
        defaultValue="09:15"
        onValueChange={onValueChange}
      />
    )
    await user.click(screen.getByRole("button"))
    await user.click(option(hours(), "08"))
    expect(onValueChange).toHaveBeenCalledWith("08:30")
  })

  it("shows an off-grid value without highlighting a minute", async () => {
    const user = userEvent.setup()
    render(<TimePicker defaultValue="10:07" minuteStep={15} />)
    expect(screen.getByRole("button")).toHaveTextContent("10:07")
    await user.click(screen.getByRole("button"))
    expect(option(hours(), "10")).toHaveAttribute("aria-selected", "true")
    for (const o of within(minutes()).getAllByRole("option")) {
      expect(o).toHaveAttribute("aria-selected", "false")
    }
  })

  it("shows an out-of-range value and stays quiet", () => {
    const onValueChange = vi.fn()
    render(
      <TimePicker value="06:00" min="08:00" onValueChange={onValueChange} />
    )
    expect(screen.getByRole("button")).toHaveTextContent("06:00")
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("does not open when disabled", async () => {
    const user = userEvent.setup()
    render(<TimePicker disabled />)
    expect(screen.getByRole("button")).toBeDisabled()
    await user.click(screen.getByRole("button"))
    expect(screen.queryByRole("listbox")).toBeNull()
  })

  it("works inside Field", () => {
    render(
      <Field data-invalid>
        <FieldLabel htmlFor="start">Start time</FieldLabel>
        <TimePicker id="start" aria-invalid />
      </Field>
    )
    const trigger = screen.getByLabelText("Start time")
    expect(trigger).toBe(screen.getByRole("button"))
    expect(trigger).toHaveAttribute("aria-invalid", "true")
  })
})
