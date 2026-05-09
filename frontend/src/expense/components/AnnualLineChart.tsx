import { useMemo, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { MONTH_LABELS } from "../../common/libs/constants"
import type { ExpenseResponse } from "../../common/libs/types"
import { CHART_COLORS } from "../libs/colors"

interface AnnualLineChartProps {
  expenses: ExpenseResponse[]
}

export const AnnualLineChart = ({ expenses }: AnnualLineChartProps) => {
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const { data, categories } = useMemo(() => {
    const catSet = new Set<string>()
    for (const e of expenses) {
      if (e.categories.length === 0) {
        catSet.add("Uncategorized")
      } else {
        for (const c of e.categories) {
          catSet.add(c.name)
        }
      }
    }
    const cats = [...catSet]

    const months = Array.from({ length: 12 }, (_, i) => {
      const row: Record<string, string | number> = { label: MONTH_LABELS[i] }
      for (const cat of cats) {
        row[cat] = 0
      }
      return row
    })

    for (const e of expenses) {
      const m = new Date(e.expensed_at).getMonth()
      if (e.categories.length === 0) {
        ;(months[m].Uncategorized as number) += e.amount
      } else {
        for (const c of e.categories) {
          ;(months[m][c.name] as number) += e.amount
        }
      }
    }

    return { data: months, categories: cats }
  }, [expenses])

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

  const visibleCategories = categories.filter((c) => !hidden.has(c))

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--chart-label)" }}
            stroke="var(--chart-grid)"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--chart-label)" }}
            stroke="var(--chart-grid)"
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            width={40}
          />
          <Tooltip
            formatter={(value) => [`¥${Number(value).toLocaleString()}`]}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              fontSize: "12px",
              backgroundColor: "var(--chart-tooltip-bg)",
              color: "var(--chart-tooltip-text)",
            }}
          />
          {visibleCategories.map((cat) => (
            <Line
              key={cat}
              type="monotone"
              dataKey={cat}
              stroke={CHART_COLORS[categories.indexOf(cat) % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 2 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <ul className="flex flex-wrap gap-x-3 gap-y-1.5 px-1">
        {categories.map((cat, i) => {
          const isHidden = hidden.has(cat)
          return (
            <li key={cat}>
              <button
                type="button"
                onClick={() => toggle(cat)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] transition-opacity ${
                  isHidden
                    ? "border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600"
                    : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
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
