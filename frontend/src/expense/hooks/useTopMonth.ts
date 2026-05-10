import { useCallback, useEffect, useMemo, useState } from "react"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { ExpenseResponse } from "../../common/libs/types"

/** Top 画面の今月分データ取得 + ヒートマップ用 totals + 集計を提供。 */
export const useTopMonth = (year: number, month: number, today: number, daysInMonth: number) => {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setExpenses(await api.getExpenses(year, month))
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [year, month])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totals = useMemo(() => {
    const arr: number[] = Array.from({ length: daysInMonth }, () => 0)
    for (const e of expenses) {
      const d = new Date(e.expensed_at)
      if (d.getFullYear() === year && d.getMonth() === month - 1) {
        arr[d.getDate() - 1] += e.amount
      }
    }
    return arr
  }, [expenses, year, month, daysInMonth])

  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])
  const perDay = today > 0 ? Math.round(total / today) : 0

  const monthExpenses = useMemo(
    () =>
      [...expenses].toSorted(
        (a, b) => new Date(b.expensed_at).getTime() - new Date(a.expensed_at).getTime(),
      ),
    [expenses],
  )

  return { error, totals, total, perDay, monthExpenses }
}
