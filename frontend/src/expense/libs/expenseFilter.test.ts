import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { ExpenseResponse } from "../../common/libs/types"
import { applyFilter, defaultFilter, filterCount, parseDateKey } from "./expenseFilter"

const mkExpense = (overrides: Partial<ExpenseResponse> = {}): ExpenseResponse => ({
  uuid: "u1",
  name: "Coffee",
  amount: 500,
  expensed_at: new Date(2026, 5, 10, 12, 0).toISOString(),
  created_at: new Date(2026, 5, 10, 12, 0).toISOString(),
  updated_at: new Date(2026, 5, 10, 12, 0).toISOString(),
  deleted_at: null,
  categories: [],
  vibe_social: null,
  vibe_planning: null,
  vibe_necessity: null,
  recurring_expense_uuid: null,
  ...overrides,
})

describe("defaultFilter", () => {
  it("defaults to month scope and empty values", () => {
    expect(defaultFilter()).toEqual({
      q: "",
      scope: "month",
      categoryUuids: [],
      min: 0,
      max: 0,
      date: null,
      month: null,
      vibeSocial: null,
      vibePlanning: null,
      vibeNecessity: null,
      recurringMode: "all",
    })
  })
})

describe("filterCount", () => {
  it("returns 0 for default filter", () => {
    expect(filterCount(defaultFilter())).toBe(0)
  })

  it("counts q, scope!=month, categories, amount range, and date", () => {
    expect(
      filterCount({
        q: "x",
        scope: "week",
        categoryUuids: ["c1"],
        min: 100,
        max: 200,
        date: "2026-06-16",
        month: null,
        vibeSocial: null,
        vibePlanning: null,
        vibeNecessity: null,
        recurringMode: "all",
      }),
    ).toBe(5)
  })

  it("counts recurringMode when not 'all'", () => {
    expect(filterCount({ ...defaultFilter(), recurringMode: "exclude" })).toBe(1)
    expect(filterCount({ ...defaultFilter(), recurringMode: "only" })).toBe(1)
  })

  it("does not double-count when only min or only max is set", () => {
    expect(filterCount({ ...defaultFilter(), min: 100 })).toBe(1)
    expect(filterCount({ ...defaultFilter(), max: 100 })).toBe(1)
  })

  it("counts each vibe axis independently", () => {
    expect(
      filterCount({
        ...defaultFilter(),
        vibeSocial: "SOLO",
        vibePlanning: "ROUTINE",
        vibeNecessity: "NEEDED",
      }),
    ).toBe(3)
  })
})

describe("parseDateKey", () => {
  it("parses YYYY-MM-DD into a local Date", () => {
    const d = parseDateKey("2026-06-16")
    expect(d).not.toBeNull()
    expect(d?.getFullYear()).toBe(2026)
    expect(d?.getMonth()).toBe(5)
    expect(d?.getDate()).toBe(16)
  })

  it("returns null for malformed input", () => {
    expect(parseDateKey("2026-06")).toBeNull()
    expect(parseDateKey("not-a-date")).toBeNull()
  })
})

describe("applyFilter", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 16, 12, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("month scope includes only current month", () => {
    const inMonth = mkExpense({ uuid: "a", expensed_at: new Date(2026, 5, 1).toISOString() })
    const lastMonth = mkExpense({ uuid: "b", expensed_at: new Date(2026, 4, 30).toISOString() })
    const result = applyFilter([inMonth, lastMonth], defaultFilter())
    expect(result.map((e) => e.uuid)).toEqual(["a"])
  })

  it("month scope honors explicit month key", () => {
    const inMonth = mkExpense({ uuid: "a", expensed_at: new Date(2026, 4, 15).toISOString() })
    const otherMonth = mkExpense({ uuid: "b", expensed_at: new Date(2026, 5, 15).toISOString() })
    const result = applyFilter([inMonth, otherMonth], { ...defaultFilter(), month: "2026-05" })
    expect(result.map((e) => e.uuid)).toEqual(["a"])
  })

  it("week scope includes last 7 days up to today", () => {
    const today = mkExpense({ uuid: "a", expensed_at: new Date(2026, 5, 16, 9, 0).toISOString() })
    const sixDays = mkExpense({ uuid: "b", expensed_at: new Date(2026, 5, 10, 0, 0).toISOString() })
    const tooOld = mkExpense({ uuid: "c", expensed_at: new Date(2026, 5, 9, 23, 0).toISOString() })
    const result = applyFilter([today, sixDays, tooOld], { ...defaultFilter(), scope: "week" })
    expect(result.map((e) => e.uuid).toSorted()).toEqual(["a", "b"])
  })

  it("date filter restricts to a single local day and overrides scope", () => {
    const target = mkExpense({
      uuid: "a",
      expensed_at: new Date(2026, 5, 10, 23, 30).toISOString(),
    })
    const other = mkExpense({ uuid: "b", expensed_at: new Date(2026, 5, 11, 0, 30).toISOString() })
    const result = applyFilter([target, other], {
      ...defaultFilter(),
      scope: "all",
      date: "2026-06-10",
    })
    expect(result.map((e) => e.uuid)).toEqual(["a"])
  })

  it("q matches name case-insensitively", () => {
    const hit = mkExpense({ uuid: "a", name: "Latte" })
    const miss = mkExpense({ uuid: "b", name: "Bread" })
    const result = applyFilter([hit, miss], { ...defaultFilter(), q: "latt" })
    expect(result.map((e) => e.uuid)).toEqual(["a"])
  })

  it("categoryUuids filters by any matching category", () => {
    const cat = { uuid: "c1", name: "Food", symbol: null, position: 0 }
    const hit = mkExpense({ uuid: "a", categories: [cat] })
    const miss = mkExpense({ uuid: "b", categories: [] })
    const result = applyFilter([hit, miss], {
      ...defaultFilter(),
      categoryUuids: ["c1"],
    })
    expect(result.map((e) => e.uuid)).toEqual(["a"])
  })

  it("filters by each vibe axis independently", () => {
    const solo = mkExpense({ uuid: "a", vibe_social: "SOLO" })
    const with_ = mkExpense({ uuid: "b", vibe_social: "WITH_SOMEONE" })
    const none = mkExpense({ uuid: "c", vibe_social: null })
    const result = applyFilter([solo, with_, none], {
      ...defaultFilter(),
      scope: "all",
      vibeSocial: "SOLO",
    })
    expect(result.map((e) => e.uuid)).toEqual(["a"])
  })

  it("combines multiple vibe axes with AND semantics", () => {
    const hit = mkExpense({
      uuid: "a",
      vibe_social: "SOLO",
      vibe_planning: "ROUTINE",
      vibe_necessity: "NEEDED",
    })
    const partial = mkExpense({
      uuid: "b",
      vibe_social: "SOLO",
      vibe_planning: "SPONTANEOUS",
      vibe_necessity: "NEEDED",
    })
    const result = applyFilter([hit, partial], {
      ...defaultFilter(),
      scope: "all",
      vibeSocial: "SOLO",
      vibePlanning: "ROUTINE",
      vibeNecessity: "NEEDED",
    })
    expect(result.map((e) => e.uuid)).toEqual(["a"])
  })

  it("recurringMode 'all' includes both recurring and non-recurring", () => {
    const normal = mkExpense({ uuid: "a", recurring_expense_uuid: null })
    const recurring = mkExpense({ uuid: "b", recurring_expense_uuid: "r1" })
    const result = applyFilter([normal, recurring], { ...defaultFilter(), scope: "all" })
    expect(result.map((e) => e.uuid).toSorted()).toEqual(["a", "b"])
  })

  it("recurringMode 'exclude' drops recurring-generated expenses", () => {
    const normal = mkExpense({ uuid: "a", recurring_expense_uuid: null })
    const recurring = mkExpense({ uuid: "b", recurring_expense_uuid: "r1" })
    const result = applyFilter([normal, recurring], {
      ...defaultFilter(),
      scope: "all",
      recurringMode: "exclude",
    })
    expect(result.map((e) => e.uuid)).toEqual(["a"])
  })

  it("recurringMode 'only' keeps only recurring-generated expenses", () => {
    const normal = mkExpense({ uuid: "a", recurring_expense_uuid: null })
    const recurring = mkExpense({ uuid: "b", recurring_expense_uuid: "r1" })
    const result = applyFilter([normal, recurring], {
      ...defaultFilter(),
      scope: "all",
      recurringMode: "only",
    })
    expect(result.map((e) => e.uuid)).toEqual(["b"])
  })

  it("min and max bound the amount inclusively", () => {
    const e1 = mkExpense({ uuid: "a", amount: 50 })
    const e2 = mkExpense({ uuid: "b", amount: 200 })
    const e3 = mkExpense({ uuid: "c", amount: 1000 })
    const result = applyFilter([e1, e2, e3], {
      ...defaultFilter(),
      scope: "all",
      min: 100,
      max: 500,
    })
    expect(result.map((e) => e.uuid)).toEqual(["b"])
  })
})
