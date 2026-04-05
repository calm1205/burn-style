import {
  CalendarIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ListBulletIcon,
  MixIcon,
  PieChartIcon,
} from "@radix-ui/react-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"

import { CategoryBubbleChart } from "../components/CategoryBubbleChart"
import { CategoryPieChart } from "../components/CategoryPieChart"
import { ExpenseHeatmap } from "../components/ExpenseHeatmap"
import { ExpenseList } from "../components/ExpenseList"
import { useSwipe } from "../hooks/useSwipe"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { ExpenseResponse } from "../lib/types"

type Tab = "list" | "pie" | "heatmap" | "bubble"
const VALID_TABS: Tab[] = ["list", "pie", "heatmap", "bubble"]

export const ExpenseMonthlyPage = () => {
  const now = new Date()
  const [searchParams, setSearchParams] = useSearchParams()

  const year = Number(searchParams.get("year")) || now.getFullYear()
  const month = Number(searchParams.get("month")) || now.getMonth() + 1
  const tabParam = searchParams.get("tab")
  const tab: Tab = VALID_TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "list"

  const updateParams = (params: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(params)) {
      next.set(k, v)
    }
    setSearchParams(next, { replace: true })
  }

  const setTab = (t: Tab) => {
    const next = new URLSearchParams(searchParams)
    if (t === "list") {
      next.delete("tab")
    } else {
      next.set("tab", t)
    }
    setSearchParams(next, { replace: true })
  }

  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [error, setError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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

  const categories = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      if (e.categories.length === 0) {
        map.set("未分類", (map.get("未分類") ?? 0) + e.amount)
      } else {
        for (const c of e.categories) {
          map.set(c.name, (map.get(c.name) ?? 0) + e.amount)
        }
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name)
  }, [expenses])

  useEffect(() => {
    if (selectedCategory && !categories.includes(selectedCategory)) {
      setSelectedCategory(null)
    }
  }, [categories, selectedCategory])

  const filteredExpenses = useMemo(() => {
    if (!selectedCategory) return expenses
    return expenses.filter((e) => {
      if (selectedCategory === "未分類") return e.categories.length === 0
      return e.categories.some((c) => c.name === selectedCategory)
    })
  }, [expenses, selectedCategory])

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

  const total = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [filteredExpenses],
  )

  const { ref: swipeRef } = useSwipe<HTMLDivElement>({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
  })

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden px-6">
      {error && <p className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex shrink-0 items-center justify-between py-8">
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          onClick={goPrev}
        >
          <DoubleArrowLeftIcon className="size-4" />
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {year}/{month}の支出
          </p>
          <p className="text-4xl font-extrabold">¥{total.toLocaleString()}</p>
        </div>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          onClick={goNext}
        >
          <DoubleArrowRightIcon className="size-4" />
        </button>
      </div>

      {categories.length > 1 && (
        <div className="flex shrink-0 gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs transition-colors ${
                selectedCategory === cat
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="flex shrink-0 gap-4 border-b border-gray-100 dark:border-gray-700">
        {[
          { key: "list" as const, label: "list", icon: ListBulletIcon },
          { key: "pie" as const, label: "pie", icon: PieChartIcon },
          { key: "heatmap" as const, label: "heat map", icon: CalendarIcon },
          { key: "bubble" as const, label: "bubble", icon: MixIcon },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 border-b-2 px-1 py-2 text-sm ${
              tab === key
                ? "border-primary text-primary"
                : "border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            }`}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>

      <div ref={swipeRef} className="flex min-h-0 flex-1 flex-col">
        {tab === "list" && <ExpenseList expenses={filteredExpenses} />}

        {tab === "pie" && (
          <div className="min-h-0 flex-1 overflow-y-auto pt-4">
            <CategoryPieChart expenses={filteredExpenses} />
          </div>
        )}

        {tab === "heatmap" && (
          <div className="min-h-0 flex-1 overflow-y-auto pt-4">
            <ExpenseHeatmap year={year} month={month} expenses={filteredExpenses} />
          </div>
        )}

        {tab === "bubble" && (
          <div className="min-h-0 flex-1 overflow-y-auto pt-4">
            <CategoryBubbleChart expenses={filteredExpenses} />
          </div>
        )}
      </div>
    </div>
  )
}
