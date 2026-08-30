import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { ExpenseResponse } from "../../common/libs/types"
import { applyFilter, createDefaultExpenseFilter, filterCount, parseDateKey } from "./expenseFilter"

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

describe("createDefaultExpenseFilter", () => {
  it("defaults to month scope and empty values", () => {
    expect(createDefaultExpenseFilter()).toEqual({
      searchQuery: "",
      scope: "month",
      categoryUuids: [],
      amountMin: 0,
      amountMax: 0,
      dateStart: null,
      dateEnd: null,
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
    expect(filterCount(createDefaultExpenseFilter())).toBe(0)
  })

  it("counts searchQuery, scope!=month, categories, amount range, and date range", () => {
    expect(
      filterCount({
        searchQuery: "x",
        scope: "week",
        categoryUuids: ["c1"],
        amountMin: 100,
        amountMax: 200,
        dateStart: "2026-06-16",
        dateEnd: "2026-06-20",
        month: null,
        vibeSocial: null,
        vibePlanning: null,
        vibeNecessity: null,
        recurringMode: "all",
      }),
    ).toBe(5)
  })

  it("counts the date range once when only start or only end is set", () => {
    expect(filterCount({ ...createDefaultExpenseFilter(), dateStart: "2026-06-01" })).toBe(1)
    expect(filterCount({ ...createDefaultExpenseFilter(), dateEnd: "2026-06-30" })).toBe(1)
    expect(
      filterCount({
        ...createDefaultExpenseFilter(),
        dateStart: "2026-06-01",
        dateEnd: "2026-06-30",
      }),
    ).toBe(1)
  })

  it("counts recurringMode when not 'all'", () => {
    expect(filterCount({ ...createDefaultExpenseFilter(), recurringMode: "exclude" })).toBe(1)
    expect(filterCount({ ...createDefaultExpenseFilter(), recurringMode: "only" })).toBe(1)
  })

  it("does not double-count when only amountMin or only amountMax is set", () => {
    expect(filterCount({ ...createDefaultExpenseFilter(), amountMin: 100 })).toBe(1)
    expect(filterCount({ ...createDefaultExpenseFilter(), amountMax: 100 })).toBe(1)
  })

  it("counts each vibe axis independently", () => {
    expect(
      filterCount({
        ...createDefaultExpenseFilter(),
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
    const filtered = applyFilter([inMonth, lastMonth], createDefaultExpenseFilter())
    expect(filtered.map((e) => e.uuid)).toEqual(["a"])
  })

  it("month scope honors explicit month key", () => {
    const inMonth = mkExpense({ uuid: "a", expensed_at: new Date(2026, 4, 15).toISOString() })
    const otherMonth = mkExpense({ uuid: "b", expensed_at: new Date(2026, 5, 15).toISOString() })
    const filtered = applyFilter([inMonth, otherMonth], {
      ...createDefaultExpenseFilter(),
      month: "2026-05",
    })
    expect(filtered.map((e) => e.uuid)).toEqual(["a"])
  })

  it("week scope includes last 7 days up to today", () => {
    const today = mkExpense({ uuid: "a", expensed_at: new Date(2026, 5, 16, 9, 0).toISOString() })
    const sixDays = mkExpense({ uuid: "b", expensed_at: new Date(2026, 5, 10, 0, 0).toISOString() })
    const tooOld = mkExpense({ uuid: "c", expensed_at: new Date(2026, 5, 9, 23, 0).toISOString() })
    const filtered = applyFilter([today, sixDays, tooOld], {
      ...createDefaultExpenseFilter(),
      scope: "week",
    })
    expect(filtered.map((e) => e.uuid).toSorted()).toEqual(["a", "b"])
  })

  it("equal start and end restrict to a single local day and override scope", () => {
    const target = mkExpense({
      uuid: "a",
      expensed_at: new Date(2026, 5, 10, 23, 30).toISOString(),
    })
    const other = mkExpense({ uuid: "b", expensed_at: new Date(2026, 5, 11, 0, 30).toISOString() })
    const filtered = applyFilter([target, other], {
      ...createDefaultExpenseFilter(),
      scope: "all",
      dateStart: "2026-06-10",
      dateEnd: "2026-06-10",
    })
    expect(filtered.map((e) => e.uuid)).toEqual(["a"])
  })

  it("date range includes both endpoints inclusively", () => {
    const before = mkExpense({ uuid: "a", expensed_at: new Date(2026, 5, 9, 23, 0).toISOString() })
    const startDay = mkExpense({
      uuid: "b",
      expensed_at: new Date(2026, 5, 10, 0, 30).toISOString(),
    })
    const endDay = mkExpense({
      uuid: "c",
      expensed_at: new Date(2026, 5, 12, 23, 30).toISOString(),
    })
    const after = mkExpense({ uuid: "d", expensed_at: new Date(2026, 5, 13, 0, 10).toISOString() })
    const filtered = applyFilter([before, startDay, endDay, after], {
      ...createDefaultExpenseFilter(),
      scope: "all",
      dateStart: "2026-06-10",
      dateEnd: "2026-06-12",
    })
    expect(filtered.map((e) => e.uuid).toSorted()).toEqual(["b", "c"])
  })

  it("open-ended start keeps everything on or after the start day", () => {
    const before = mkExpense({ uuid: "a", expensed_at: new Date(2026, 5, 9, 23, 0).toISOString() })
    const onOrAfter = mkExpense({
      uuid: "b",
      expensed_at: new Date(2026, 5, 10, 0, 0).toISOString(),
    })
    const filtered = applyFilter([before, onOrAfter], {
      ...createDefaultExpenseFilter(),
      scope: "all",
      dateStart: "2026-06-10",
    })
    expect(filtered.map((e) => e.uuid)).toEqual(["b"])
  })

  it("open-ended end keeps everything on or before the end day", () => {
    const onOrBefore = mkExpense({
      uuid: "a",
      expensed_at: new Date(2026, 5, 10, 23, 30).toISOString(),
    })
    const after = mkExpense({ uuid: "b", expensed_at: new Date(2026, 5, 11, 0, 30).toISOString() })
    const filtered = applyFilter([onOrBefore, after], {
      ...createDefaultExpenseFilter(),
      scope: "all",
      dateEnd: "2026-06-10",
    })
    expect(filtered.map((e) => e.uuid)).toEqual(["a"])
  })

  it("searchQuery matches name case-insensitively", () => {
    const hit = mkExpense({ uuid: "a", name: "Latte" })
    const miss = mkExpense({ uuid: "b", name: "Bread" })
    const filtered = applyFilter([hit, miss], {
      ...createDefaultExpenseFilter(),
      searchQuery: "latt",
    })
    expect(filtered.map((e) => e.uuid)).toEqual(["a"])
  })

  it("categoryUuids filters by any matching category", () => {
    const cat = { uuid: "c1", name: "Food", symbol: null, position: 0 }
    const hit = mkExpense({ uuid: "a", categories: [cat] })
    const miss = mkExpense({ uuid: "b", categories: [] })
    const filtered = applyFilter([hit, miss], {
      ...createDefaultExpenseFilter(),
      categoryUuids: ["c1"],
    })
    expect(filtered.map((e) => e.uuid)).toEqual(["a"])
  })

  it("filters by each vibe axis independently", () => {
    const solo = mkExpense({ uuid: "a", vibe_social: "SOLO" })
    const withSomeone = mkExpense({ uuid: "b", vibe_social: "WITH_SOMEONE" })
    const none = mkExpense({ uuid: "c", vibe_social: null })
    const filtered = applyFilter([solo, withSomeone, none], {
      ...createDefaultExpenseFilter(),
      scope: "all",
      vibeSocial: "SOLO",
    })
    expect(filtered.map((e) => e.uuid)).toEqual(["a"])
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
    const filtered = applyFilter([hit, partial], {
      ...createDefaultExpenseFilter(),
      scope: "all",
      vibeSocial: "SOLO",
      vibePlanning: "ROUTINE",
      vibeNecessity: "NEEDED",
    })
    expect(filtered.map((e) => e.uuid)).toEqual(["a"])
  })

  it("recurringMode 'all' includes both recurring and non-recurring", () => {
    const normal = mkExpense({ uuid: "a", recurring_expense_uuid: null })
    const recurring = mkExpense({ uuid: "b", recurring_expense_uuid: "r1" })
    const filtered = applyFilter([normal, recurring], {
      ...createDefaultExpenseFilter(),
      scope: "all",
    })
    expect(filtered.map((e) => e.uuid).toSorted()).toEqual(["a", "b"])
  })

  it("recurringMode 'exclude' drops recurring-generated expenses", () => {
    const normal = mkExpense({ uuid: "a", recurring_expense_uuid: null })
    const recurring = mkExpense({ uuid: "b", recurring_expense_uuid: "r1" })
    const filtered = applyFilter([normal, recurring], {
      ...createDefaultExpenseFilter(),
      scope: "all",
      recurringMode: "exclude",
    })
    expect(filtered.map((e) => e.uuid)).toEqual(["a"])
  })

  it("recurringMode 'only' keeps only recurring-generated expenses", () => {
    const normal = mkExpense({ uuid: "a", recurring_expense_uuid: null })
    const recurring = mkExpense({ uuid: "b", recurring_expense_uuid: "r1" })
    const filtered = applyFilter([normal, recurring], {
      ...createDefaultExpenseFilter(),
      scope: "all",
      recurringMode: "only",
    })
    expect(filtered.map((e) => e.uuid)).toEqual(["b"])
  })

  it("amountMin and amountMax bound the amount inclusively", () => {
    const e1 = mkExpense({ uuid: "a", amount: 50 })
    const e2 = mkExpense({ uuid: "b", amount: 200 })
    const e3 = mkExpense({ uuid: "c", amount: 1000 })
    const filtered = applyFilter([e1, e2, e3], {
      ...createDefaultExpenseFilter(),
      scope: "all",
      amountMin: 100,
      amountMax: 500,
    })
    expect(filtered.map((e) => e.uuid)).toEqual(["b"])
  })
})
