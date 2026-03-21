import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { ExpenseResponse } from "../lib/types"

export const ExpenseAnnualPage = () => {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setExpenses(await api.getExpenses(year))
    } catch (err) {
      setError(getErrorMessage(err, "データ取得に失敗"))
    }
  }, [year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  )

  const monthlyTotals = useMemo(() => {
    const totals = Array.from({ length: 12 }, () => 0)
    for (const e of expenses) {
      const m = new Date(e.expensed_at).getMonth()
      totals[m] += e.amount
    }
    return totals
  }, [expenses])

  return (
    <div
      className="mx-auto flex h-full max-w-2xl flex-col px-6"
      style={{ paddingTop: "10vh" }}
    >
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      <div className="flex shrink-0 items-center justify-between bg-white py-8">
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          onClick={() => setYear((y) => y - 1)}
        >
          <DoubleArrowLeftIcon className="size-4" />
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-500">{year}年の支出</p>
          <p className="text-3xl font-bold">{total.toLocaleString()}円</p>
        </div>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          onClick={() => setYear((y) => y + 1)}
        >
          <DoubleArrowRightIcon className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto flex flex-col gap-2 pt-4">
        {monthlyTotals.map((amount, i) => (
          <div
            key={`month-${String(i)}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
          >
            <span className="text-sm">{i + 1}月</span>
            <span className="text-sm font-mono">
              {amount.toLocaleString()}円
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
