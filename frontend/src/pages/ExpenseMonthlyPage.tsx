import {
  CalendarIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ListBulletIcon,
  PieChartIcon,
} from "@radix-ui/react-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { CategoryPieChart } from "../components/CategoryPieChart"
import { ExpenseHeatmap } from "../components/ExpenseHeatmap"
import { ExpenseList } from "../components/ExpenseList"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { ExpenseResponse } from "../lib/types"

type Tab = "list" | "pie" | "heatmap"
const VALID_TABS: Tab[] = ["list", "pie", "heatmap"]

export const ExpenseMonthlyPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")
  const tab: Tab = VALID_TABS.includes(tabParam as Tab)
    ? (tabParam as Tab)
    : "list"

  const setTab = (t: Tab) => {
    setSearchParams(t === "list" ? {} : { tab: t }, { replace: true })
  }

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
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

  const goPrev = () => {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const goNext = () => {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  )

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
          onClick={goPrev}
        >
          <DoubleArrowLeftIcon className="size-4" />
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {year}/{month}の支出
          </p>
          <p className="text-3xl font-bold">{total.toLocaleString()}円</p>
        </div>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          onClick={goNext}
        >
          <DoubleArrowRightIcon className="size-4" />
        </button>
      </div>

      <div className="flex shrink-0 gap-4 border-b border-gray-200">
        {[
          { key: "list" as const, label: "list", icon: ListBulletIcon },
          { key: "pie" as const, label: "pie chart", icon: PieChartIcon },
          { key: "heatmap" as const, label: "heat map", icon: CalendarIcon },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 border-b-2 px-1 py-2 text-sm ${
              tab === key
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>

      {tab === "list" && <ExpenseList expenses={expenses} />}

      {tab === "pie" && (
        <div className="min-h-0 flex-1 overflow-y-auto pt-4">
          <CategoryPieChart expenses={expenses} />
        </div>
      )}

      {tab === "heatmap" && (
        <div className="min-h-0 flex-1 overflow-y-auto pt-4">
          <ExpenseHeatmap year={year} month={month} expenses={expenses} />
        </div>
      )}
    </div>
  )
}
