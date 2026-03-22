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
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-1 flex-col items-center justify-center">
        <button
          type="button"
          className="w-full max-w-sm rounded-2xl bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
          onClick={() => navigate("/expense/monthly")}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start gap-1">
              <span className="text-sm text-gray-500">
                {year}/{String(month).padStart(2, "0")}
              </span>
              <span className="text-3xl font-extrabold">
                ¥{total.toLocaleString()}
              </span>
            </div>
            <ChevronRightIcon className="size-5 text-gray-400" />
          </div>
          <SimplePieChart expenses={expenses} />
        </button>

        <button
          type="button"
          className="mt-6 w-full max-w-sm rounded-2xl bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md"
          onClick={() => navigate("/expense/annual")}
        >
          <p className="mb-3 text-left text-xs font-medium text-gray-500">
            Annual
          </p>
          <MonthlyTrendChart year={year} month={month} />
        </button>
      </div>
    </div>
  )
}
