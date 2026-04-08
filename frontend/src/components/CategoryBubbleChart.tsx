import { useMemo, useState } from "react"
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"

import { RANGE_COLORS } from "../lib/colors"
import type { ExpenseResponse } from "../lib/types"

const AMOUNT_RANGES = [
  { label: "~¥500", min: 1, max: 500 },
  { label: "¥501~1,500", min: 501, max: 1500 },
  { label: "¥1,501~5,000", min: 1501, max: 5000 },
  { label: "¥5,001~10,000", min: 5001, max: 10000 },
  { label: "¥10,001~30,000", min: 10001, max: 30000 },
  { label: "¥30,001~", min: 30001, max: Infinity },
]

interface BubbleData {
  label: string
  rangeIndex: number
  frequency: number
  total: number
  fill: string
}

interface CategoryBubbleChartProps {
  expenses: ExpenseResponse[]
}

export const CategoryBubbleChart = ({ expenses }: CategoryBubbleChartProps) => {
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

  const data = useMemo(() => {
    const buckets = AMOUNT_RANGES.map((range, i) => ({
      ...range,
      index: i,
      count: 0,
      total: 0,
    }))

    for (const e of filteredExpenses) {
      const bucket = buckets.find((b) => e.amount >= b.min && e.amount <= b.max)
      if (bucket) {
        bucket.count++
        bucket.total += e.amount
      }
    }

    return buckets
      .filter((b) => b.count > 0)
      .map(
        (b): BubbleData => ({
          label: b.label,
          rangeIndex: b.index,
          frequency: b.count,
          total: b.total,
          fill: RANGE_COLORS[b.index % RANGE_COLORS.length],
        }),
      )
  }, [filteredExpenses])

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

  if (data.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ left: 10, right: 20, top: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="frequency"
            name="頻度"
            type="number"
            tick={{ fontSize: 11, fill: "var(--chart-label)" }}
            stroke="var(--chart-grid)"
            label={{
              value: "頻度（回）",
              position: "bottom",
              fontSize: 11,
              fill: "var(--chart-label)",
            }}
            allowDecimals={false}
          />
          <YAxis
            dataKey="rangeIndex"
            name="金額帯"
            type="number"
            domain={[-0.5, AMOUNT_RANGES.length - 0.5]}
            ticks={AMOUNT_RANGES.map((_, i) => i)}
            tickFormatter={(v: number) => AMOUNT_RANGES[v]?.label ?? ""}
            tick={{ fontSize: 10, fill: "var(--chart-label)" }}
            stroke="var(--chart-grid)"
            width={80}
          />
          <ZAxis dataKey="total" range={[60, 500]} name="合計" type="number" />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null
              const d = payload[0].payload as BubbleData
              return (
                <div
                  className="rounded-xl px-3 py-2 text-xs shadow-md"
                  style={{
                    backgroundColor: "var(--chart-tooltip-bg)",
                    color: "var(--chart-tooltip-text)",
                  }}
                >
                  <p className="font-medium">{d.label}</p>
                  <p>回数: {d.frequency}</p>
                  <p>合計: ¥{d.total.toLocaleString()}</p>
                </div>
              )
            }}
          />
          {data.map((d) => (
            <Scatter key={d.label} data={[d]} fill={d.fill} fillOpacity={0.7} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      <ul className="flex flex-wrap gap-x-3 gap-y-1.5 px-1">
        {allCategories.map((cat) => {
          const isHidden = hidden.has(cat)
          return (
            <li key={cat}>
              <button
                type="button"
                onClick={() => toggle(cat)}
                className={`rounded-full border px-2.5 py-0.5 text-[11px] transition-opacity ${
                  isHidden
                    ? "border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600"
                    : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                }`}
              >
                {cat}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
