import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { ExpenseResponse } from "../../common/libs/types"
import { ExpenseEmptyState } from "../components/ExpenseEmptyState"
import { ExpenseList } from "../components/ExpenseList"

export const ExpenseMonthlyPage = () => {
  const now = new Date()
  const [searchParams, setSearchParams] = useSearchParams()

  const year = Number(searchParams.get("year")) || now.getFullYear()
  const month = Number(searchParams.get("month")) || now.getMonth() + 1

  const updateParams = (params: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(params)) {
      next.set(k, v)
    }
    setSearchParams(next, { replace: true })
  }

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

  const goPrev = () => {
    if (month === 1) {
      updateParams({ year: String(year - 1), month: "12" })
    } else {
      updateParams({ year: String(year), month: String(month - 1) })
    }
  }

  const goNext = () => {
    if (month === 12) {
      updateParams({ year: String(year + 1), month: "1" })
    } else {
      updateParams({ year: String(year), month: String(month + 1) })
    }
  }

  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden px-6">
      {error && <p className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex shrink-0 items-center justify-between py-8">
        <button
          type="button"
          aria-label="Previous month"
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          onClick={goPrev}
        >
          <DoubleArrowLeftIcon className="size-4" />
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {year}/{month}
          </p>
          <p className="text-4xl font-extrabold">¥{total.toLocaleString()}</p>
        </div>
        <button
          type="button"
          aria-label="Next month"
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          onClick={goNext}
        >
          <DoubleArrowRightIcon className="size-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {expenses.length === 0 ? (
          <ExpenseEmptyState period={`${year}/${month}`} />
        ) : (
          <ExpenseList expenses={expenses} />
        )}
      </div>
    </div>
  )
}
