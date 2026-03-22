import { useMemo, useState } from "react"
import { CHART_COLORS } from "../lib/colors"
import type { ExpenseResponse } from "../lib/types"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const getColor = (amount: number, mean: number, sd: number) => {
  if (amount === 0)
    return { bg: "var(--color-gray-100)", text: "var(--color-gray-700)" }
  if (sd === 0)
    return { bg: "var(--color-chart-scale-3)", text: "var(--color-gray-700)" }
  const z = (amount - mean) / sd
  if (z > 0.75) return { bg: "var(--color-chart-scale-5)", text: "#FFFFFF" }
  if (z > 0.25) return { bg: "var(--color-chart-scale-4)", text: "#FFFFFF" }
  if (z > -0.25)
    return { bg: "var(--color-chart-scale-3)", text: "var(--color-gray-700)" }
  if (z > -0.75)
    return { bg: "var(--color-chart-scale-2)", text: "var(--color-gray-700)" }
  return { bg: "var(--color-chart-scale-1)", text: "var(--color-gray-700)" }
}

interface ExpenseHeatmapProps {
  year: number
  month: number
  expenses: ExpenseResponse[]
}

export const ExpenseHeatmap = ({
  year,
  month,
  expenses,
}: ExpenseHeatmapProps) => {
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const allCategories = useMemo(() => {
    const catSet = new Set<string>()
    for (const e of expenses) {
      if (e.categories.length === 0) {
        catSet.add("未分類")
      } else {
        for (const c of e.categories) catSet.add(c.name)
      }
    }
    return [...catSet]
  }, [expenses])

  const filteredExpenses = useMemo(() => {
    if (hidden.size === 0) return expenses
    return expenses.filter((e) => {
      if (e.categories.length === 0) return !hidden.has("未分類")
      return e.categories.some((c) => !hidden.has(c.name))
    })
  }, [expenses, hidden])

  const { dailyTotals, daysInMonth, startOffset, mean, sd } = useMemo(() => {
    const totals = new Map<number, number>()
    for (const e of filteredExpenses) {
      const d = new Date(e.expensed_at)
      const day = d.getDate()
      totals.set(day, (totals.get(day) ?? 0) + e.amount)
    }

    const days = new Date(year, month, 0).getDate()
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    const amounts = [...totals.values()]
    const avg =
      amounts.length > 0
        ? amounts.reduce((s, v) => s + v, 0) / amounts.length
        : 0
    const variance =
      amounts.length > 0
        ? amounts.reduce((s, v) => s + (v - avg) ** 2, 0) / amounts.length
        : 0

    return {
      dailyTotals: totals,
      daysInMonth: days,
      startOffset: offset,
      mean: avg,
      sd: Math.sqrt(variance),
    }
  }, [year, month, filteredExpenses])

  const toggle = (cat: string) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  const cells: (number | null)[] = [
    ...Array.from<null>({ length: startOffset }).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  const remainder = cells.length % 7
  if (remainder > 0) {
    cells.push(...Array.from<null>({ length: 7 - remainder }).fill(null))
  }

  return (
    <div className="flex flex-col gap-4 px-5">
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="flex items-center justify-center text-xs text-gray-400"
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const amount = day ? (dailyTotals.get(day) ?? 0) : 0
          const color = day !== null ? getColor(amount, mean, sd) : null
          return (
            <div
              key={`${day ?? "empty"}-${String(i)}`}
              className="flex aspect-square items-center justify-center rounded text-xs"
              style={
                color
                  ? { backgroundColor: color.bg, color: color.text }
                  : undefined
              }
              title={
                day ? `${month}/${day}: ¥${amount.toLocaleString()}` : undefined
              }
            >
              {day}
            </div>
          )
        })}
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1.5 px-1">
        {allCategories.map((cat, i) => {
          const isHidden = hidden.has(cat)
          return (
            <li key={cat}>
              <button
                type="button"
                onClick={() => toggle(cat)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] transition-opacity ${
                  isHidden
                    ? "border-gray-200 text-gray-300"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <span
                  className="inline-block size-2 rounded-full"
                  style={{
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    opacity: isHidden ? 0.2 : 1,
                  }}
                />
                {cat}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
