import {
  ActivityLogIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ListBulletIcon,
  MixIcon,
} from "@radix-ui/react-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { AnnualAreaChart } from "../components/AnnualAreaChart"
import { AnnualLineChart } from "../components/AnnualLineChart"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { ExpenseResponse } from "../lib/types"

type Tab = "list" | "area" | "line"
const VALID_TABS: Tab[] = ["list", "area", "line"]

export const ExpenseAnnualPage = () => {
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
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setError("")
    try {
      setExpenses(await api.getExpenses(year))
    } catch (err) {
      setExpenses([])
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

      <div className="flex shrink-0 gap-4 border-b border-gray-200">
        {[
          { key: "list" as const, label: "list", icon: ListBulletIcon },
          { key: "area" as const, label: "area chart", icon: MixIcon },
          {
            key: "line" as const,
            label: "line chart",
            icon: ActivityLogIcon,
          },
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

      {tab === "list" && (
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
      )}

      {tab === "area" && (
        <div className="min-h-0 flex-1 overflow-y-auto pt-4">
          <AnnualAreaChart expenses={expenses} />
        </div>
      )}

      {tab === "line" && (
        <div className="min-h-0 flex-1 overflow-y-auto pt-4">
          <AnnualLineChart expenses={expenses} />
        </div>
      )}
    </div>
  )
}
