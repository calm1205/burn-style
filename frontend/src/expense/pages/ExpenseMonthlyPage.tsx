import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { ExpenseResponse } from "../../common/libs/types"
import { ExpenseList } from "../components/ExpenseList"
import { defaultFilter, type ExpenseFilter } from "../libs/expenseFilter"

const isValidDateKey = (s: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(s)

export const ExpenseMonthlyPage = () => {
  const [searchParams] = useSearchParams()
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setExpenses(await api.getExpenses())
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const initialFilter = useMemo<ExpenseFilter>(() => {
    const dateParam = searchParams.get("date")
    if (dateParam && isValidDateKey(dateParam)) {
      return { ...defaultFilter(), date: dateParam }
    }
    return defaultFilter()
    // initial読み取りのみで意図的に searchParams 変更には追従しない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden px-5">
      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <h1 className="shrink-0 pt-2 pb-2 text-3xl font-bold tracking-tight">Expense</h1>
      <ExpenseList expenses={expenses} initialFilter={initialFilter} />
    </div>
  )
}
