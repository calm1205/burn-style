import { useMemo } from "react"
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { CHART_COLORS } from "../lib/colors"
import type { ExpenseResponse } from "../lib/types"

interface CategoryBarChartProps {
  expenses: ExpenseResponse[]
}

export const CategoryBarChart = ({ expenses }: CategoryBarChartProps) => {
  const data = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      if (e.categories.length === 0) {
        map.set("Uncategorized", (map.get("Uncategorized") ?? 0) + e.amount)
      } else {
        for (const c of e.categories) {
          map.set(c.name, (map.get(c.name) ?? 0) + e.amount)
        }
      }
    }
    return [...map.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .toSorted((a, b) => b.amount - a.amount)
  }, [expenses])

  if (data.length === 0) {
    return <p className="mt-8 text-center text-sm text-gray-400">No data</p>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 48)}>
      <BarChart data={data} layout="vertical" barCategoryGap="20%">
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--chart-label)" }}
          tickFormatter={(v: number) => `¥${(v / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "var(--chart-label)" }}
          width={100}
        />
        <Tooltip
          formatter={(value) => [`¥${Number(value).toLocaleString()}`]}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            fontSize: "12px",
            backgroundColor: "var(--chart-tooltip-bg)",
            color: "var(--chart-tooltip-text)",
          }}
          cursor={{ fill: "var(--chart-cursor)" }}
        />
        <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={24} isAnimationActive={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
