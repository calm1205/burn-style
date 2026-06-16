import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"
import { computeCategories, computeVibes, computeYear, fmtAmount, monthLabel } from "./insightStats"

const cat = (uuid: string, name: string): CategoryResponse => ({
  uuid,
  name,
  symbol: null,
  position: 0,
})

const mkExpense = (overrides: Partial<ExpenseResponse> = {}): ExpenseResponse => ({
  uuid: "u",
  name: "x",
  amount: 100,
  expensed_at: new Date(2026, 5, 1).toISOString(),
  created_at: new Date(2026, 5, 1).toISOString(),
  updated_at: new Date(2026, 5, 1).toISOString(),
  deleted_at: null,
  categories: [],
  vibe_social: null,
  vibe_planning: null,
  vibe_necessity: null,
  recurring_expense_uuid: null,
  ...overrides,
})

describe("monthLabel", () => {
  it("formats year and month in English long form", () => {
    expect(monthLabel(2026, 6)).toBe("June 2026")
  })
})

describe("fmtAmount", () => {
  it("formats with yen sign and grouping", () => {
    expect(fmtAmount(1234567)).toBe("¥1,234,567")
  })

  it("rounds non-integer amounts", () => {
    expect(fmtAmount(99.6)).toBe("¥100")
  })
})

describe("computeVibes", () => {
  it("counts each vibe and sorts descending by count", () => {
    const expenses = [
      mkExpense({ uuid: "1", vibe_planning: "ROUTINE", vibe_necessity: "NEEDED" }),
      mkExpense({ uuid: "2", vibe_planning: "ROUTINE", vibe_necessity: "WANTED" }),
      mkExpense({ uuid: "3", vibe_planning: "SPONTANEOUS", vibe_necessity: "NEEDED" }),
    ]
    const result = computeVibes(expenses)
    const routine = result.find((v) => v.key === "ROUTINE")
    expect(routine?.count).toBe(2)
    const counts = result.map((v) => v.count)
    expect(counts).toEqual([...counts].toSorted((a, b) => b - a))
  })

  it("returns empty array when no vibes are set", () => {
    expect(computeVibes([mkExpense()])).toEqual([])
  })

  it("computes percentages relative to total vibe assignments", () => {
    const expenses = [
      mkExpense({ uuid: "1", vibe_social: "SOLO" }),
      mkExpense({ uuid: "2", vibe_social: "WITH_SOMEONE" }),
    ]
    const result = computeVibes(expenses)
    expect(result.map((v) => v.pct).every((p) => p === 50)).toBe(true)
  })
})

describe("computeCategories", () => {
  it("aggregates amount per category and sorts by amount desc", () => {
    const food = cat("c1", "Food")
    const transport = cat("c2", "Transport")
    const expenses = [
      mkExpense({ uuid: "1", amount: 100, categories: [food] }),
      mkExpense({ uuid: "2", amount: 200, categories: [transport] }),
      mkExpense({ uuid: "3", amount: 300, categories: [food] }),
    ]
    const result = computeCategories(expenses)
    expect(result[0].category?.uuid).toBe("c1")
    expect(result[0].amount).toBe(400)
    expect(result[1].amount).toBe(200)
  })

  it("groups expenses with no category under null", () => {
    const expenses = [mkExpense({ amount: 100, categories: [] })]
    const result = computeCategories(expenses)
    expect(result[0].category).toBeNull()
    expect(result[0].amount).toBe(100)
    expect(result[0].pct).toBe(100)
  })
})

describe("computeYear", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 16))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns 12 months ending at the current month", () => {
    const result = computeYear([])
    expect(result).toHaveLength(12)
    expect(result[11].current).toBe(true)
    expect(result[11].year).toBe(2026)
    expect(result[11].month).toBe(6)
    expect(result[0].year).toBe(2025)
    expect(result[0].month).toBe(7)
  })

  it("accumulates amount into the matching month bucket", () => {
    const expenses = [
      mkExpense({ amount: 100, expensed_at: new Date(2026, 5, 1).toISOString() }),
      mkExpense({ amount: 200, expensed_at: new Date(2026, 5, 20).toISOString() }),
      mkExpense({ amount: 50, expensed_at: new Date(2025, 11, 1).toISOString() }),
    ]
    const result = computeYear(expenses)
    const june = result.find((m) => m.year === 2026 && m.month === 6)
    expect(june?.amount).toBe(300)
    const dec = result.find((m) => m.year === 2025 && m.month === 12)
    expect(dec?.amount).toBe(50)
  })

  it("ignores expenses outside the 12-month window", () => {
    const expenses = [mkExpense({ amount: 999, expensed_at: new Date(2024, 0, 1).toISOString() })]
    const result = computeYear(expenses)
    expect(result.reduce((s, m) => s + m.amount, 0)).toBe(0)
  })
})
