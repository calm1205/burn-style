import { useMemo } from "react"
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

interface DailyAreaChartProps {
  year: number
  month: number
  expenses: ExpenseResponse[]
}

export const DailyAreaChart = ({
  year,
  month,
  expenses,
}: DailyAreaChartProps) => {
  const { data, categories } = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate()
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

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const row: Record<string, string | number> = { label: `${i + 1}` }
      for (const cat of cats) {
        row[cat] = 0
      }
      return row
    })

    for (const e of expenses) {
      const day = new Date(e.expensed_at).getDate() - 1
      if (e.categories.length === 0) {
        ;(days[day].未分類 as number) += e.amount
      } else {
        for (const c of e.categories) {
          ;(days[day][c.name] as number) += e.amount
        }
      }
    }

    return { data: days, categories: cats }
  }, [year, month, expenses])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          width={40}
        />
        <Tooltip
          formatter={(value) => [`¥${Number(value).toLocaleString()}`]}
        />
        {categories.map((cat, i) => (
          <Area
            key={cat}
            type="monotone"
            dataKey={cat}
            stackId="1"
            fill={COLORS[i % COLORS.length]}
            stroke={COLORS[i % COLORS.length]}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
