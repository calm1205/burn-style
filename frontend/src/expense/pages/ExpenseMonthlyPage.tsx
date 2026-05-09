import { useCallback, useEffect, useState } from "react"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { ExpenseResponse } from "../../common/libs/types"
import { ExpenseList } from "../components/ExpenseList"

export const ExpenseMonthlyPage = () => {
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

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden px-5">
      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <h1 className="shrink-0 pt-2 pb-2 text-3xl font-bold tracking-tight">Expense</h1>
      <ExpenseList expenses={expenses} />
    </div>
  )
}
