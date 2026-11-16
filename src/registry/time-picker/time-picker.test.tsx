import { describe, expect, it } from "vitest"

import {
  formatTime,
  getMinuteOptions,
  isTimeInRange,
  parseTime,
} from "./time-picker"

describe("parseTime", () => {
  it("parses HH:mm", () => {
    expect(parseTime("09:05")).toEqual({ hour: 9, minute: 5 })
    expect(parseTime("00:00")).toEqual({ hour: 0, minute: 0 })
    expect(parseTime("23:59")).toEqual({ hour: 23, minute: 59 })
  })
  it("rejects everything else", () => {
    for (const bad of ["", "9:05", "24:00", "12:60", "12:5", "12-30", " 12:30", "12:30:00"]) {
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
    for (const step of [0, -5, 1.5, Number.NaN]) expect(getMinuteOptions(step)).toHaveLength(60)
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
    const at = (h: number, m: number) => isTimeInRange({ hour: h, minute: m }, "08:00", "17:00")
    expect([at(8, 0), at(17, 0), at(7, 59), at(17, 1)]).toEqual([true, true, false, false])
  })
  it("ignores malformed bounds", () => {
    expect(isTimeInRange({ hour: 3, minute: 0 }, "8:00", "25:00")).toBe(true)
  })
  it("allows nothing when min is after max", () => {
    expect(isTimeInRange({ hour: 12, minute: 0 }, "18:00", "08:00")).toBe(false)
  })
})
