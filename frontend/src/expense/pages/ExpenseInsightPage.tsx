import { useCallback, useEffect, useMemo, useState } from "react"

import { api } from "../../common/libs/api"
import { categoryGlyph } from "../../common/libs/category"
import { getErrorMessage } from "../../common/libs/client"
import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"
import { InsightYearChart, type YearMonth } from "../components/InsightYearChart"

const VIBE_LABELS: { key: string; label: string; field: keyof ExpenseResponse }[] = [
  { key: "ROUTINE", label: "Routine", field: "vibe_planning" },
  { key: "SPONTANEOUS", label: "Spontaneous", field: "vibe_planning" },
  { key: "NEEDED", label: "Needed it", field: "vibe_necessity" },
  { key: "WANTED", label: "Wanted it", field: "vibe_necessity" },
  { key: "SOLO", label: "Solo", field: "vibe_social" },
  { key: "WITH_SOMEONE", label: "With someone", field: "vibe_social" },
]

const monthLabel = (year: number, month: number): string =>
  new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })

const fmtAmount = (n: number): string => `¥${Math.round(n).toLocaleString()}`

interface VibeStat {
  key: string
  label: string
  count: number
  pct: number
}

interface CategoryStat {
  category: CategoryResponse | null
  amount: number
  pct: number
}

const computeVibes = (expenses: ExpenseResponse[]): VibeStat[] => {
  const counts = new Map<string, number>()
  for (const e of expenses) {
    for (const { key, field } of VIBE_LABELS) {
      if (e[field] === key) {
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
  }
  const total = [...counts.values()].reduce((s, n) => s + n, 0)
  return VIBE_LABELS.map(({ key, label }) => {
    const count = counts.get(key) ?? 0
    return { key, label, count, pct: total > 0 ? (count / total) * 100 : 0 }
  })
    .filter((v) => v.count > 0)
    .toSorted((a, b) => b.count - a.count)
}

const computeCategories = (expenses: ExpenseResponse[]): CategoryStat[] => {
  const map = new Map<string, { category: CategoryResponse | null; amount: number }>()
  for (const e of expenses) {
    if (e.categories.length === 0) {
      const entry = map.get("__none__") ?? { category: null, amount: 0 }
      entry.amount += e.amount
      map.set("__none__", entry)
    } else {
      for (const c of e.categories) {
        const entry = map.get(c.uuid) ?? { category: c, amount: 0 }
        entry.amount += e.amount
        map.set(c.uuid, entry)
      }
    }
  }
  const total = [...map.values()].reduce((s, x) => s + x.amount, 0)
  return [...map.values()]
    .map(({ category, amount }) => ({
      category,
      amount,
      pct: total > 0 ? (amount / total) * 100 : 0,
    }))
    .toSorted((a, b) => b.amount - a.amount)
}

const computeYear = (expenses: ExpenseResponse[]): YearMonth[] => {
  const now = new Date()
  const months: YearMonth[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${d.getMonth() + 1}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      amount: 0,
      current: i === 0,
    })
  }
  for (const e of expenses) {
    const d = new Date(e.expensed_at)
    const k = `${d.getFullYear()}-${d.getMonth() + 1}`
    const target = months.find((m) => m.key === k)
    if (target) target.amount += e.amount
  }
  return months
}

export const ExpenseInsightPage = () => {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setExpenses(await api.getExpenses())
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const thisMonth = useMemo(
    () =>
      expenses.filter((e) => {
        const d = new Date(e.expensed_at)
        return d.getFullYear() === year && d.getMonth() + 1 === month
      }),
    [expenses, year, month],
  )

  const vibes = useMemo(() => computeVibes(thisMonth), [thisMonth])
  const cats = useMemo(() => computeCategories(thisMonth), [thisMonth])
  const yearMonths = useMemo(() => computeYear(expenses), [expenses])

  const catTotal = cats.reduce((s, c) => s + c.amount, 0)
  const topVibe = vibes[0]

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden">
      {error && (
        <p className="mx-5 shrink-0 pt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="shrink-0 px-5 pt-2 pb-3">
        <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          The full read
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Insights</h1>
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {monthLabel(year, month)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="mb-2.5 px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          Why you spent
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          {topVibe ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight tabular-nums">
                  {Math.round(topVibe.pct)}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  was {topVibe.label.toLowerCase()}
                </span>
              </div>
              <div className="mt-3 flex h-3.5 gap-0.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                {vibes.map((v, i) => (
                  <div
                    key={v.key}
                    style={{ width: `${v.pct}%`, opacity: 1 - i * 0.18 }}
                    className="bg-primary"
                  />
                ))}
              </div>
              <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
                {vibes.map((v, i) => (
                  <div key={v.key} className="flex items-center gap-2.5 py-2">
                    <div
                      style={{ opacity: 1 - i * 0.18 }}
                      className="size-2.5 rounded-sm bg-primary"
                    />
                    <span className="flex-1 text-sm font-medium">{v.label}</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {v.count} {v.count === 1 ? "time" : "times"}
                    </span>
                    <span className="min-w-9 text-right text-sm font-bold tabular-nums">
                      {Math.round(v.pct)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="py-2 text-sm text-gray-400 dark:text-gray-500">
              No vibe data this month yet.
            </p>
          )}
        </div>

        <div className="mt-6 mb-2.5 px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          This month by category
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          {cats.length > 0 ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight tabular-nums">
                  {fmtAmount(catTotal)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">total</span>
              </div>
              <div className="mt-3 flex h-3.5 gap-0.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                {cats.map((c, i) => (
                  <div
                    key={c.category?.uuid ?? "__none__"}
                    style={{ width: `${c.pct}%`, opacity: 1 - i * 0.13 }}
                    className="bg-primary"
                  />
                ))}
              </div>
              <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
                {cats.map((c, i) => (
                  <div
                    key={c.category?.uuid ?? "__none__"}
                    className="flex items-center gap-2.5 py-2"
                  >
                    <div
                      style={{ opacity: 1 - i * 0.13 }}
                      className="size-2.5 rounded-sm bg-primary"
                    />
                    <span className="text-sm">{c.category ? categoryGlyph(c.category) : "·"}</span>
                    <span className="flex-1 text-sm font-medium">
                      {c.category ? c.category.name : "Uncategorized"}
                    </span>
                    <span className="text-[11px] text-gray-400 tabular-nums dark:text-gray-500">
                      {fmtAmount(c.amount)}
                    </span>
                    <span className="min-w-10 text-right text-sm font-bold tabular-nums">
                      {Math.round(c.pct)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="py-2 text-sm text-gray-400 dark:text-gray-500">
              No expenses this month yet.
            </p>
          )}
        </div>

        <div className="mt-6 mb-2.5 px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          Last 12 months
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <InsightYearChart year={yearMonths} />
        </div>
      </div>
    </div>
  )
}
