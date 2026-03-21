import { useMemo } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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

interface AnnualLineChartProps {
  expenses: ExpenseResponse[]
}

export const AnnualLineChart = ({ expenses }: AnnualLineChartProps) => {
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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          width={40}
        />
        <Tooltip
          formatter={(value) => [`${Number(value).toLocaleString()}円`]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {categories.map((cat, i) => (
          <Line
            key={cat}
            type="monotone"
            dataKey={cat}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 2 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
