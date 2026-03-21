import { useCallback, useEffect, useMemo, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { api } from "../lib/api"
import type { ExpenseResponse } from "../lib/types"

interface MonthlyTrendChartProps {
  year: number
  month: number
}

export const MonthlyTrendChart = ({ year, month }: MonthlyTrendChartProps) => {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])

  const fetchData = useCallback(async () => {
    try {
      setExpenses(await api.getExpenses(year))
    } catch {
      // エラーは親で表示済み
    }
  }, [year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const data = useMemo(() => {
    return Array.from({ length: month }, (_, i) => {
      const m = i + 1
      const total = expenses
        .filter((e) => new Date(e.expensed_at).getMonth() + 1 === m)
        .reduce((sum, e) => sum + e.amount, 0)
      return { label: `${m}月`, amount: total }
    })
  }, [month, expenses])

  return (
    <ResponsiveContainer width="100%" height={200}>
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
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
