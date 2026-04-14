import { useMemo } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

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
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barCategoryGap="20%">
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--chart-label)" }}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--chart-label)" }}
          tickFormatter={(v: number) => `¥${(v / 1000).toFixed(0)}k`}
          width={50}
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
        <Bar
          dataKey="amount"
          fill="var(--chart-bar)"
          radius={[6, 6, 0, 0]}
          barSize={32}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
