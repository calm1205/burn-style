import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  FREQUENCY_OPTIONS,
  groupOf,
  matchFrequency,
  monthlyEquivalent,
  todayJst,
} from "./recurringFrequency"

describe("matchFrequency", () => {
  it("matches WEEK/1 to weekly", () => {
    expect(matchFrequency("WEEK", 1)).toBe("weekly")
  })

  it("matches WEEK/2 to biweekly", () => {
    expect(matchFrequency("WEEK", 2)).toBe("biweekly")
  })

  it("matches MONTH/3 to quarterly", () => {
    expect(matchFrequency("MONTH", 3)).toBe("quarterly")
  })

  it("falls back to monthly for unknown combinations", () => {
    expect(matchFrequency("WEEK", 99)).toBe("monthly")
  })
})

describe("groupOf", () => {
  it("returns matching FrequencyOption", () => {
    expect(groupOf("MONTH", 12)).toEqual(FREQUENCY_OPTIONS.find((f) => f.key === "yearly"))
  })

  it("returns null for unknown combination", () => {
    expect(groupOf("MONTH", 99)).toBeNull()
  })
})

describe("monthlyEquivalent", () => {
  it("converts weekly to monthly using 4.345 multiplier", () => {
    expect(monthlyEquivalent(1000, "WEEK", 1)).toBe(4345)
  })

  it("converts biweekly to monthly", () => {
    expect(monthlyEquivalent(1000, "WEEK", 2)).toBe(Math.round((1000 * 4.345) / 2))
  })

  it("divides amount by count for MONTH unit", () => {
    expect(monthlyEquivalent(12000, "MONTH", 12)).toBe(1000)
  })

  it("returns rounded integer", () => {
    expect(Number.isInteger(monthlyEquivalent(333, "MONTH", 3))).toBe(true)
  })
})

describe("todayJst", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns YYYY-MM-DD in JST regardless of system TZ", () => {
    vi.setSystemTime(new Date("2026-06-15T20:00:00Z"))
    expect(todayJst()).toBe("2026-06-16")
  })

  it("does not roll over before 15:00 UTC", () => {
    vi.setSystemTime(new Date("2026-06-15T14:59:59Z"))
    expect(todayJst()).toBe("2026-06-15")
  })
})
