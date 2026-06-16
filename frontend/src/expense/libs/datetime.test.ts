import { describe, expect, it } from "vitest"

import { toLocalDatetime } from "./datetime"

describe("toLocalDatetime", () => {
  it("formats an ISO string to local YYYY-MM-DDTHH:MM", () => {
    const local = new Date(2026, 5, 16, 10, 30)
    expect(toLocalDatetime(local.toISOString())).toBe("2026-06-16T10:30")
  })

  it("pads single-digit month/day/hour/minute with zeros", () => {
    const local = new Date(2026, 0, 5, 3, 7)
    expect(toLocalDatetime(local.toISOString())).toBe("2026-01-05T03:07")
  })
})
