import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { ExpenseResponse } from "../lib/types"

const COLORS = [
  "#1e3a5f",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#a5b4cd",
  "#7ba1c7",
  "#4a7fb5",
]

interface AnnualAreaChartProps {
  expenses: ExpenseResponse[]
}

export const AnnualAreaChart = ({ expenses }: AnnualAreaChartProps) => {
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const { data, categories } = useMemo(() => {
    const catSet = new Set<string>()
    for (const e of expenses) {
      if (e.categories.length === 0) {
        catSet.add("未分類")
      } else {
        for (const c of e.categories) {
          catSet.add(c.name)
        }
      }
    }
    const cats = [...catSet]

    const months = Array.from({ length: 12 }, (_, i) => {
      const row: Record<string, string | number> = { label: `${i + 1}月` }
      for (const cat of cats) {
        row[cat] = 0
      }
      return row
    })

    for (const e of expenses) {
      const m = new Date(e.expensed_at).getMonth()
      if (e.categories.length === 0) {
        ;(months[m].未分類 as number) += e.amount
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
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            width={40}
          />
          <Tooltip
            formatter={(value) => [`¥${Number(value).toLocaleString()}`]}
          />
          {visibleCategories.map((cat) => (
            <Area
              key={cat}
              type="monotone"
              dataKey={cat}
              stackId="1"
              fill={COLORS[categories.indexOf(cat) % COLORS.length]}
              stroke={COLORS[categories.indexOf(cat) % COLORS.length]}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
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
                    ? "border-gray-200 text-gray-300"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                <span
                  className="inline-block size-2 rounded-full"
                  style={{
                    backgroundColor: COLORS[i % COLORS.length],
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
