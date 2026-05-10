import { useMemo } from "react"

import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"
import { applyFilter, type ExpenseFilter } from "../libs/expenseFilter"

const pad = (n: number) => String(n).padStart(2, "0")

const dateKey = (iso: string): string => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const dateLabel = (key: string): string => {
  const [y, m, day] = key.split("-").map(Number)
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export interface DayGroup {
  key: string
  label: string
  items: ExpenseResponse[]
  total: number
}

/** filter 適用 → 日付別グループ化 + 合計を一括算出。 */
export const useFilteredExpenses = (expenses: ExpenseResponse[], filter: ExpenseFilter) => {
  const usedCategories = useMemo<CategoryResponse[]>(() => {
    const map = new Map<string, CategoryResponse>()
    for (const e of expenses) {
      for (const c of e.categories) {
        if (!map.has(c.uuid)) map.set(c.uuid, c)
      }
    }
    return [...map.values()].toSorted((a, b) => a.position - b.position)
  }, [expenses])

  const filtered = useMemo(() => applyFilter(expenses, filter), [expenses, filter])

  const groups = useMemo<DayGroup[]>(() => {
    const sorted = [...filtered].toSorted(
      (a, b) => new Date(b.expensed_at).getTime() - new Date(a.expensed_at).getTime(),
    )
    const map = new Map<string, ExpenseResponse[]>()
    for (const e of sorted) {
      const k = dateKey(e.expensed_at)
      const list = map.get(k)
      if (list) list.push(e)
      else map.set(k, [e])
    }
    return [...map.entries()].map(([key, items]) => ({
      key,
      label: dateLabel(key),
      items,
      total: items.reduce((sum, e) => sum + e.amount, 0),
    }))
  }, [filtered])

  const total = useMemo(() => filtered.reduce((sum, e) => sum + e.amount, 0), [filtered])

  return { usedCategories, filtered, groups, total }
}
