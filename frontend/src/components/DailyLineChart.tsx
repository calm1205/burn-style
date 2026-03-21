import { useMemo } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { ExpenseResponse } from "../lib/types"

interface DailyLineChartProps {
  year: number
  month: number
  expenses: ExpenseResponse[]
}

export const DailyLineChart = ({
  year,
  month,
  expenses,
}: DailyLineChartProps) => {
  const data = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate()
    const totals = Array.from({ length: daysInMonth }, () => 0)
    for (const e of expenses) {
      const day = new Date(e.expensed_at).getDate()
      totals[day - 1] += e.amount
    }
    return totals.map((amount, i) => ({
      label: `${i + 1}`,
      amount: amount || 1,
    }))
  }, [year, month, expenses])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={2} />
        <YAxis
          scale="log"
          domain={[1, "auto"]}
          allowDataOverflow
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
          }
          width={40}
        />
        <Tooltip
          formatter={(value) => {
            const v = Number(value)
            return [`¥${(v <= 1 ? 0 : v).toLocaleString()}`]
          }}
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
