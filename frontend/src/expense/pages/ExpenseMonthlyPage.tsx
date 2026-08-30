import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"
import { ExpenseList } from "../components/ExpenseList"
import { createDefaultExpenseFilter, type ExpenseFilter } from "../libs/expenseFilter"

const isValidDateKey = (s: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(s)

export const ExpenseMonthlyPage = () => {
  const [searchParams] = useSearchParams()
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")

  const fetchExpenses = useCallback(async () => {
    try {
      const [loadedExpenses, loadedCategories] = await Promise.all([
        api.getExpenses(),
        api.getCategories(),
      ])
      setExpenses(loadedExpenses)
      setCategories(loadedCategories)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const initialFilter = useMemo<ExpenseFilter>(() => {
    const dateParam = searchParams.get("date")
    if (dateParam && isValidDateKey(dateParam)) {
      return { ...createDefaultExpenseFilter(), dateStart: dateParam, dateEnd: dateParam }
    }
    return createDefaultExpenseFilter()
    // initial読み取りのみで意図的に searchParams 変更には追従しない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden px-5">
      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <ExpenseList expenses={expenses} categories={categories} initialFilter={initialFilter} />
    </div>
  )
}
