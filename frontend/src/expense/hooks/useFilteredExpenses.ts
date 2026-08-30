import { useMemo } from "react"

import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"
import { applyFilter, type ExpenseFilter } from "../libs/expenseFilter"

/** filter 適用 → 新しい順ソート + 合計を一括算出。 */
export const useFilteredExpenses = (
  expenses: ExpenseResponse[],
  filter: ExpenseFilter,
  allCategories: CategoryResponse[] = [],
) => {
  const usedCategories = useMemo<CategoryResponse[]>(() => {
    const usedUuids = new Set(expenses.flatMap((e) => (e.category ? [e.category.uuid] : [])))
    return allCategories
      .filter((c) => usedUuids.has(c.uuid))
      .toSorted((a, b) => a.position - b.position)
  }, [expenses, allCategories])

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
