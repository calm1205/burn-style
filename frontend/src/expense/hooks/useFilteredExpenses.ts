import { useMemo } from "react"

import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"
import { applyFilter, type ExpenseFilter } from "../libs/expenseFilter"

/** filter 適用 → 新しい順ソート + 合計を一括算出。 */
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

  const filtered = useMemo(
    () =>
      applyFilter(expenses, filter).toSorted(
        (a, b) => new Date(b.expensed_at).getTime() - new Date(a.expensed_at).getTime(),
      ),
    [expenses, filter],
  )

  const total = useMemo(() => filtered.reduce((sum, e) => sum + e.amount, 0), [filtered])

  return { usedCategories, filtered, total }
}
