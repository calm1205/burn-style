import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { ExpenseResponse } from "../../common/libs/types"
import { MonthlyTrendChart } from "../components/MonthlyTrendChart"
import { SimpleBarChart } from "../components/SimpleBarChart"

const SkeletonBarChart2 = () => (
  <div className="mt-3 flex h-[100px] items-end gap-1.5">
    {Array.from({ length: 5 }, (_, i) => (
      <div
        key={`skel-${String(i)}`}
        className="flex-1 animate-pulse rounded-t-md bg-gray-100 dark:bg-gray-700"
        style={{ height: `${40 + Math.random() * 50}%` }}
      />
    ))}
  </div>
)

const SkeletonBarChart = () => (
  <div className="flex h-[180px] items-end gap-2 pt-4">
    {Array.from({ length: 12 }, (_, i) => (
      <div
        key={`bar-${String(i)}`}
        className="flex-1 animate-pulse rounded-md bg-gray-100 dark:bg-gray-700"
        style={{ height: `${30 + Math.random() * 50}%` }}
      />
    ))}
  </div>
)

export const TopPage = () => {
  const navigate = useNavigate()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setExpenses(await api.getExpenses(year, month))
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-6 pb-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex flex-col items-start gap-1">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {year}/{String(month).padStart(2, "0")}
        </span>
        {loading ? (
          <div className="my-1 h-8 w-40 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700" />
        ) : (
          <span className="text-3xl font-extrabold">¥{total.toLocaleString()}</span>
        )}
      </div>

      <button
        type="button"
        className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
        onClick={() => navigate("/expense/monthly")}
      >
        <p className="mb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
          Monthly
        </p>
        {loading ? (
          <SkeletonBarChart2 />
        ) : expenses.length === 0 ? (
          <div className="flex h-[100px] items-center justify-center text-xs text-gray-400 dark:text-gray-500">
            No expenses this month
          </div>
        ) : (
          <SimpleBarChart expenses={expenses} />
        )}
      </button>

      <button
        type="button"
        className="w-full rounded-2xl bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
        onClick={() => navigate("/expense/annual")}
      >
        <p className="mb-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
          Annual
        </p>
        {loading ? <SkeletonBarChart /> : <MonthlyTrendChart year={year} month={month} />}
      </button>
    </div>
  )
}
