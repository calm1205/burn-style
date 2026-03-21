import { ChevronRightIcon } from "@radix-ui/react-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { MonthlyTrendChart } from "../components/MonthlyTrendChart"
import { SimplePieChart } from "../components/SimplePieChart"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { ExpenseResponse } from "../lib/types"

export const TopPage = () => {
  const navigate = useNavigate()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setExpenses(await api.getExpenses(year, month))
    } catch (err) {
      setError(getErrorMessage(err, "データ取得に失敗"))
    }
  }, [year, month])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  )

  return (
    <div className="flex h-full flex-col px-6">
      <h1 className="shrink-0 pt-6 text-lg font-bold">BurnStyle</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-1 flex-col items-center justify-center">
        <button
          type="button"
          className="flex w-full max-w-sm items-center justify-between rounded-lg border border-gray-200 px-5 py-4 hover:bg-gray-50"
          onClick={() => navigate("/expense/monthly")}
        >
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm text-gray-500">
              Total - {year}/{String(month).padStart(2, "0")}
            </span>
            <span className="text-3xl font-bold">
              {total.toLocaleString()}円
            </span>
          </div>
          <ChevronRightIcon className="size-5 text-gray-400" />
        </button>

        <button
          type="button"
          className="mt-6 w-full max-w-sm rounded-lg border border-gray-200 px-4 py-4 hover:bg-gray-50"
          onClick={() => navigate("/expense/monthly?tab=pie")}
        >
          <p className="text-left text-xs font-medium text-gray-500">
            Category
          </p>
          <SimplePieChart expenses={expenses} />
        </button>

        <button
          type="button"
          className="mt-6 w-full max-w-sm rounded-lg border border-gray-200 px-4 py-4 hover:bg-gray-50"
          onClick={() => navigate("/expense/annual")}
        >
          <p className="mb-3 text-left text-xs font-medium text-gray-500">
            Monthly
          </p>
          <MonthlyTrendChart year={year} month={month} />
        </button>
      </div>
    </div>
  )
}
