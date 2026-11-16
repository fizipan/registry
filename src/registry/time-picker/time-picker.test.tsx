import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Field, FieldLabel } from "@/components/ui/field"

import source from "./time-picker.tsx?raw"
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

  it("snaps an off-grid minute to the first valid one when picking an hour", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TimePicker
        defaultValue="10:07"
        minuteStep={15}
        onValueChange={onValueChange}
      />
    )
    await user.click(screen.getByRole("button"))
    await user.click(option(hours(), "11"))
    expect(onValueChange).toHaveBeenCalledWith("11:00")
  })

  it("picks the first valid hour for a minute when min is mid-hour", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker min="08:30" onValueChange={onValueChange} />)
    await user.click(screen.getByRole("button"))
    await user.click(option(minutes(), "15"))
    expect(onValueChange).toHaveBeenCalledWith("09:15")
  })

  it("never submits a surrounding form", () => {
    render(<TimePicker />)
    expect(screen.getByRole("button")).toHaveAttribute("type", "button")
  })

  describe("keyboard", () => {
    it("focuses the selected hour on open", async () => {
      const user = userEvent.setup()
      render(<TimePicker defaultValue="09:30" />)
      await user.click(screen.getByRole("button"))
      expect(document.activeElement).toBe(option(hours(), "09"))
    })

    it("focuses the first enabled hour when empty", async () => {
      const user = userEvent.setup()
      render(<TimePicker min="08:00" />)
      await user.click(screen.getByRole("button"))
      expect(document.activeElement).toBe(option(hours(), "08"))
    })

    it("keeps exactly one tab stop per column", async () => {
      const user = userEvent.setup()
      render(<TimePicker defaultValue="09:30" />)
      await user.click(screen.getByRole("button"))
      for (const list of [hours(), minutes()]) {
        const stops = within(list)
          .getAllByRole("option")
          .filter((o) => o.tabIndex === 0)
        expect(stops).toHaveLength(1)
      }
    })

    it("moves with ArrowUp/ArrowDown and skips disabled", async () => {
      const user = userEvent.setup()
      render(<TimePicker min="08:00" />)
      await user.click(screen.getByRole("button"))
      await user.keyboard("{ArrowUp}")
      expect(document.activeElement).toBe(option(hours(), "08"))
      await user.keyboard("{ArrowDown}")
      expect(document.activeElement).toBe(option(hours(), "09"))
    })

    it("switches columns with ArrowRight/ArrowLeft", async () => {
      const user = userEvent.setup()
      render(<TimePicker defaultValue="09:30" />)
      await user.click(screen.getByRole("button"))
      await user.keyboard("{ArrowRight}")
      expect(document.activeElement).toBe(option(minutes(), "30"))
      await user.keyboard("{ArrowLeft}")
      expect(document.activeElement).toBe(option(hours(), "09"))
    })

    it("selects with Enter", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<TimePicker onValueChange={onValueChange} />)
      await user.click(screen.getByRole("button"))
      await user.keyboard("{ArrowDown}{Enter}")
      expect(onValueChange).toHaveBeenLastCalledWith("01:00")
      await user.keyboard("{ArrowRight}{ArrowDown}{Enter}")
      expect(onValueChange).toHaveBeenLastCalledWith("01:01")
      await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())
    })

    it("closes with Escape without changing the value", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<TimePicker defaultValue="09:30" onValueChange={onValueChange} />)
      await user.click(screen.getByRole("button"))
      await user.keyboard("{Escape}")
      await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())
      expect(onValueChange).not.toHaveBeenCalled()
      expect(screen.getByRole("button")).toHaveTextContent("09:30")
    })

    it("scrolls the tab stop into view when nothing is selected", async () => {
      const user = userEvent.setup()
      render(<TimePicker min="08:00" />)
      await user.click(screen.getByRole("button"))
      const scroll = vi.mocked(Element.prototype.scrollIntoView)
      const hourCalls = scroll.mock.contexts.filter((el) =>
        hours().contains(el as Element)
      )
      expect(hourCalls.map((el) => (el as Element).textContent)).toEqual(["08"])
    })

    it("selects with Space", async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<TimePicker onValueChange={onValueChange} />)
      await user.click(screen.getByRole("button"))
      await user.keyboard("{ArrowDown} ")
      expect(onValueChange).toHaveBeenLastCalledWith("01:00")
      await user.keyboard("{ArrowRight}{ArrowDown} ")
      expect(onValueChange).toHaveBeenLastCalledWith("01:01")
      await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())
    })

    it("jumps to the first and last enabled option with Home and End", async () => {
      const user = userEvent.setup()
      render(<TimePicker min="08:00" max="17:00" defaultValue="12:00" />)
      await user.click(screen.getByRole("button"))
      await user.keyboard("{End}")
      expect(document.activeElement).toBe(option(hours(), "17"))
      await user.keyboard("{Home}")
      expect(document.activeElement).toBe(option(hours(), "08"))
    })

    it("stops PageUp and PageDown from scrolling the list", async () => {
      const user = userEvent.setup()
      render(<TimePicker defaultValue="12:00" />)
      await user.click(screen.getByRole("button"))
      const active = document.activeElement as HTMLElement
      for (const key of ["PageUp", "PageDown"]) {
        const event = new KeyboardEvent("keydown", {
          key,
          bubbles: true,
          cancelable: true,
        })
        active.dispatchEvent(event)
        expect(event.defaultPrevented).toBe(true)
      }
    })

    it("moves the tab stop with arrow focus", async () => {
      const user = userEvent.setup()
      render(<TimePicker defaultValue="09:30" />)
      await user.click(screen.getByRole("button"))
      await user.keyboard("{ArrowDown}")
      expect(option(hours(), "10")).toHaveAttribute("tabindex", "0")
      expect(option(hours(), "09")).toHaveAttribute("tabindex", "-1")
      const stops = within(hours())
        .getAllByRole("option")
        .filter((o) => o.tabIndex === 0)
      expect(stops).toHaveLength(1)
    })

    it("resets the tab stop when reopened", async () => {
      const user = userEvent.setup()
      render(<TimePicker defaultValue="09:30" />)
      await user.click(screen.getByRole("button"))
      await user.keyboard("{ArrowDown}{Escape}")
      await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())
      await user.click(screen.getByRole("button"))
      expect(option(hours(), "09")).toHaveAttribute("tabindex", "0")
    })

    it("shows a visible focus ring, with a fill only when not selected", async () => {
      const user = userEvent.setup()
      render(<TimePicker defaultValue="09:30" />)
      await user.click(screen.getByRole("button"))
      expect(option(hours(), "09")).toHaveClass(
        "outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-ring",
        "focus-visible:ring-inset"
      )
      expect(option(hours(), "09")).not.toHaveClass("focus-visible:bg-muted")
      expect(option(hours(), "10")).toHaveClass("focus-visible:bg-muted")
    })

    it("scrolls selected options to the center on open", async () => {
      const user = userEvent.setup()
      render(<TimePicker defaultValue="09:30" />)
      await user.click(screen.getByRole("button"))
      const scroll = vi.mocked(Element.prototype.scrollIntoView)
      expect(scroll).toHaveBeenCalledWith({ block: "center" })
      const texts = scroll.mock.contexts.map(
        (el) => (el as Element).textContent
      )
      expect(texts).toEqual(expect.arrayContaining(["09", "30"]))
    })
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

  it("starts with use client so Server Components can import it", () => {
    expect(source.startsWith('"use client"')).toBe(true)
  })

  describe("accessible value", () => {
    it("exposes the value as the description when labelled", () => {
      render(
        <Field>
          <FieldLabel htmlFor="start">Start time</FieldLabel>
          <TimePicker id="start" defaultValue="09:30" />
        </Field>
      )
      const trigger = screen.getByRole("button", { name: "Start time" })
      expect(trigger).toHaveAccessibleDescription("09:30")
    })

    it("exposes the placeholder when empty", () => {
      render(<TimePicker aria-label="Start" />)
      expect(screen.getByRole("button")).toHaveAccessibleDescription(
        "Select time"
      )
    })

    it("keeps a consumer aria-describedby", () => {
      render(
        <>
          <p id="hint">Pick a time</p>
          <TimePicker
            aria-label="Start"
            defaultValue="09:30"
            aria-describedby="hint"
          />
        </>
      )
      expect(screen.getByRole("button")).toHaveAccessibleDescription(
        "09:30 Pick a time"
      )
    })
  })

  describe("form", () => {
    it("submits the value under name", async () => {
      const user = userEvent.setup()
      render(
        <form data-testid="form">
          <TimePicker name="start" />
        </form>
      )
      const form = screen.getByTestId("form") as HTMLFormElement
      expect(new FormData(form).get("start")).toBe("")
      await user.click(screen.getByRole("button"))
      await user.click(option(hours(), "09"))
      await user.click(option(minutes(), "30"))
      expect(new FormData(form).get("start")).toBe("09:30")
    })

    it("submits nothing without a name", () => {
      render(
        <form data-testid="form">
          <TimePicker defaultValue="09:30" />
        </form>
      )
      const form = screen.getByTestId("form") as HTMLFormElement
      expect([...new FormData(form).keys()]).toEqual([])
    })
  })

  describe("trigger style", () => {
    it("left-aligns, and lets className override", () => {
      render(<TimePicker className="w-full" />)
      const button = screen.getByRole("button")
      expect(button).toHaveClass("justify-start", "font-normal", "w-full")
    })

    it("aligns the popover to the start", async () => {
      const user = userEvent.setup()
      render(<TimePicker />)
      await user.click(screen.getByRole("button"))
      expect(hours().closest("[data-align]")).toHaveAttribute(
        "data-align",
        "start"
      )
    })
  })
})
