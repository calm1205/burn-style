import { useCallback, useEffect, useMemo, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { api } from "../lib/api"
import { MONTH_LABELS } from "../lib/constants"
import type { ExpenseResponse } from "../lib/types"

const getLast12Months = (year: number, month: number) => {
  const months: { year: number; month: number; label: string }[] = []
  for (let i = 11; i >= 0; i--) {
    let y = year
    let m = month - i
    while (m <= 0) {
      m += 12
      y -= 1
    }
    months.push({ year: y, month: m, label: MONTH_LABELS[m - 1] })
  }
  return months
}

interface MonthlyTrendChartProps {
  year: number
  month: number
}

export const MonthlyTrendChart = ({ year, month }: MonthlyTrendChartProps) => {
  const [thisYearExpenses, setThisYearExpenses] = useState<ExpenseResponse[]>([])
  const [lastYearExpenses, setLastYearExpenses] = useState<ExpenseResponse[]>([])

  const fetchData = useCallback(async () => {
    try {
      const results = await Promise.all([
        api.getExpenses(year),
        month < 12 ? api.getExpenses(year - 1) : Promise.resolve([]),
      ])
      setThisYearExpenses(results[0])
      setLastYearExpenses(results[1])
    } catch {
      // Error already displayed by parent
    }
  }, [year, month])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const data = useMemo(() => {
    const allExpenses = [...lastYearExpenses, ...thisYearExpenses]
    return getLast12Months(year, month).map(({ year: y, month: m, label }) => {
      const total = allExpenses
        .filter((e) => {
          const d = new Date(e.expensed_at)
          return d.getFullYear() === y && d.getMonth() + 1 === m
        })
        .reduce((sum, e) => sum + e.amount, 0)
      return { label, amount: total }
    })
  }, [year, month, thisYearExpenses, lastYearExpenses])

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barCategoryGap="20%">
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--chart-label)" }}
          interval={0}
          ticks={(() => {
            const labels = data.map((d) => d.label)
            const last = labels.length - 1
            return labels.filter((_, i) => (last - i) % 3 === 0)
          })()}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--chart-label)" }}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          width={40}
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
          radius={[6, 6, 6, 6]}
          barSize={14}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
