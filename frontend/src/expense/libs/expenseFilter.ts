import type { ExpenseResponse } from "../../common/libs/types"

export type FilterScope = "week" | "month" | "all"

export interface ExpenseFilter {
  q: string
  scope: FilterScope
  categoryUuids: string[]
  min: number
  max: number
  /** 特定日のみ表示する場合に YYYY-MM-DD を指定。設定時は scope を無視。 */
  date: string | null
}

export const SCOPE_OPTIONS: { k: FilterScope; label: string; short: string }[] = [
  { k: "week", label: "This week", short: "Week" },
  { k: "month", label: "This month", short: "Month" },
  { k: "all", label: "All time", short: "All" },
]

export const defaultFilter = (): ExpenseFilter => ({
  q: "",
  scope: "month",
  categoryUuids: [],
  min: 0,
  max: 0,
  date: null,
})

export const filterCount = (f: ExpenseFilter): number => {
  let n = 0
  if (f.q) n++
  if (f.scope !== "month") n++
  if (f.categoryUuids.length > 0) n++
  if (f.min > 0 || f.max > 0) n++
  if (f.date) n++
  return n
}

const sameLocalDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export const parseDateKey = (key: string): Date | null => {
  const parts = key.split("-").map(Number)
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null
  return new Date(parts[0], parts[1] - 1, parts[2])
}

export const applyFilter = (expenses: ExpenseResponse[], f: ExpenseFilter): ExpenseResponse[] => {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)
  const targetDate = f.date ? parseDateKey(f.date) : null

  return expenses.filter((e) => {
    const d = new Date(e.expensed_at)

    if (targetDate) {
      if (!sameLocalDay(d, targetDate)) return false
    } else if (f.scope === "week") {
      if (d < weekStart) return false
      if (d > now && !sameLocalDay(d, now)) return false
    } else if (f.scope === "month") {
      if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) return false
    }

    if (f.q && !e.name.toLowerCase().includes(f.q.toLowerCase())) return false
    if (f.categoryUuids.length > 0) {
      const hit = e.categories.some((c) => f.categoryUuids.includes(c.uuid))
      if (!hit) return false
    }
    if (f.min > 0 && e.amount < f.min) return false
    if (f.max > 0 && e.amount > f.max) return false
    return true
  })
}
