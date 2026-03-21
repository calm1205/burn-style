import {
  CalendarIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ListBulletIcon,
  PieChartIcon,
} from "@radix-ui/react-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ExpenseList } from "../components/ExpenseList"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { ExpenseResponse } from "../lib/types"

export const ExpenseMonthlyPage = () => {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [tab, setTab] = useState<"list" | "pie" | "heatmap">("list")
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
        <div className="min-h-0 flex-1 flex items-center justify-center pt-4">
          <p className="text-sm text-gray-400">円グラフ（準備中）</p>
        </div>
      )}

      {tab === "heatmap" && (
        <div className="min-h-0 flex-1 flex items-center justify-center pt-4">
          <p className="text-sm text-gray-400">ヒートマップ（準備中）</p>
        </div>
      )}
    </div>
  )
}
