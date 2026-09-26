import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createDefaultExpenseFilter, presetDateRange } from "./expenseFilter"
import {
  createDefaultMonthExpenseFilter,
  enrichExpenseFilterForUi,
  parseExpenseFilterFromSearchParams,
  seedDefaultMonthSearchParams,
  serializeExpenseFilterToSearchParams,
  shouldSeedDefaultMonthQuery,
} from "./expenseFilterQuery"

describe("shouldSeedDefaultMonthQuery", () => {
  it("returns true only for empty params", () => {
    expect(shouldSeedDefaultMonthQuery(new URLSearchParams())).toBe(true)
    expect(shouldSeedDefaultMonthQuery(new URLSearchParams("q=x"))).toBe(false)
  })
})

describe("parseExpenseFilterFromSearchParams", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 16, 12, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns all-time filter when params are empty", () => {
    const f = parseExpenseFilterFromSearchParams(new URLSearchParams())
    expect(f.scope).toBe("all")
    expect(f.dateStart).toBeNull()
    expect(f.dateEnd).toBeNull()
  })

  it("maps legacy date param to a single-day range", () => {
    const f = parseExpenseFilterFromSearchParams(new URLSearchParams("date=2026-06-10"))
    expect(f.dateStart).toBe("2026-06-10")
    expect(f.dateEnd).toBe("2026-06-10")
  })

  it("reads from/to and enriches week preset", () => {
    const week = presetDateRange("week")
    const f = parseExpenseFilterFromSearchParams(
      new URLSearchParams(`from=${week.start}&to=${week.end}`),
    )
    expect(f.scope).toBe("week")
  })

  it("ignores invalid min and unknown vibe", () => {
    const f = parseExpenseFilterFromSearchParams(new URLSearchParams("min=abc&vibeSocial=INVALID"))
    expect(f.amountMin).toBe(0)
    expect(f.vibeSocial).toBeNull()
  })

  it("reads to-only through today as all time", () => {
    const f = parseExpenseFilterFromSearchParams(new URLSearchParams("to=2026-06-16"))
    expect(f.scope).toBe("all")
    expect(f.dateStart).toBeNull()
    expect(f.dateEnd).toBe("2026-06-16")
  })

  it("parses categories and recurring", () => {
    const id = "0123456789abcdef0123456789abcdef"
    const f = parseExpenseFilterFromSearchParams(
      new URLSearchParams(`categories=${id},bad&vibeSocial=SOLO&recurring=only`),
    )
    expect(f.categoryUuids).toEqual([id])
    expect(f.vibeSocial).toBe("SOLO")
    expect(f.recurringMode).toBe("only")
  })
})

describe("serializeExpenseFilterToSearchParams", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 16, 12, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("omits defaults for all-time filter", () => {
    expect(
      serializeExpenseFilterToSearchParams({
        ...createDefaultExpenseFilter(),
        scope: "all",
        dateStart: null,
        dateEnd: "2026-06-16",
      }).toString(),
    ).toBe("to=2026-06-16")
  })

  it("writes from/to for default month scope without explicit dates", () => {
    const params = serializeExpenseFilterToSearchParams(createDefaultExpenseFilter())
    expect(params.get("from")).toBe("2026-06-01")
    expect(params.get("to")).toBe("2026-06-30")
  })

  it("writes from/to for dated filters without scope", () => {
    const month = createDefaultMonthExpenseFilter()
    const params = serializeExpenseFilterToSearchParams(month)
    expect(params.get("from")).toBe("2026-06-01")
    expect(params.get("to")).toBe("2026-06-30")
    expect(params.has("scope")).toBe(false)
  })

  it("writes from/to for month scope even when dates were cleared on the object", () => {
    const params = serializeExpenseFilterToSearchParams({
      ...createDefaultExpenseFilter(),
      scope: "month",
      month: "2026-05",
      dateStart: null,
      dateEnd: null,
    })
    expect(params.get("from")).toBe("2026-05-01")
    expect(params.get("to")).toBe("2026-05-31")
  })
})

describe("roundtrip", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 16, 12, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("roundtrips category ids in hex uuid form", () => {
    const id = "0123456789abcdef0123456789abcdef"
    const original = {
      ...createDefaultMonthExpenseFilter(),
      categoryUuids: [id],
    }
    const parsed = parseExpenseFilterFromSearchParams(
      serializeExpenseFilterToSearchParams(original),
    )
    expect(parsed.categoryUuids).toEqual([id])
  })
})

describe("seedDefaultMonthSearchParams", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 16, 12, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("matches createDefaultMonthExpenseFilter serialization", () => {
    expect(seedDefaultMonthSearchParams().toString()).toBe(
      serializeExpenseFilterToSearchParams(createDefaultMonthExpenseFilter()).toString(),
    )
  })
})

describe("enrichExpenseFilterForUi", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 16, 12, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("sets month key when range is not the current month", () => {
    const f = enrichExpenseFilterForUi({
      ...createDefaultExpenseFilter(),
      dateStart: "2026-05-01",
      dateEnd: "2026-05-31",
    })
    expect(f.scope).toBe("month")
    expect(f.month).toBe("2026-05")
  })
})
