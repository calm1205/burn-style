import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"
import { ExpenseList } from "../components/ExpenseList"
import type { ExpenseFilter } from "../libs/expenseFilter"
import {
  createDefaultMonthExpenseFilter,
  parseExpenseFilterFromSearchParams,
  seedDefaultMonthSearchParams,
  serializeExpenseFilterToSearchParams,
  shouldSeedDefaultMonthQuery,
} from "../libs/expenseFilterQuery"

export const ExpenseMonthlyPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")
  const seededRef = useRef(false)

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

  useEffect(() => {
    if (seededRef.current) return
    if (!shouldSeedDefaultMonthQuery(searchParams)) return
    seededRef.current = true
    setSearchParams(seedDefaultMonthSearchParams(), { replace: true })
  }, [searchParams, setSearchParams])

  const filter = useMemo((): ExpenseFilter => {
    if (shouldSeedDefaultMonthQuery(searchParams)) {
      return createDefaultMonthExpenseFilter()
    }
    return parseExpenseFilterFromSearchParams(searchParams)
  }, [searchParams])

  const onFilterChange = useCallback(
    (next: ExpenseFilter) => {
      setSearchParams(serializeExpenseFilterToSearchParams(next), { replace: true })
    },
    [setSearchParams],
  )

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden px-5">
      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <ExpenseList
        expenses={expenses}
        categories={categories}
        filter={filter}
        onFilterChange={onFilterChange}
      />
    </div>
  )
}
