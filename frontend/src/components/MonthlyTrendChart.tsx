import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { api } from "../lib/api"
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
    months.push({ year: y, month: m, label: `${m}月` })
  }
  return months
}

interface MonthlyTrendChartProps {
  year: number
  month: number
}

export const MonthlyTrendChart = ({ year, month }: MonthlyTrendChartProps) => {
  const [thisYearExpenses, setThisYearExpenses] = useState<ExpenseResponse[]>(
    [],
  )
  const [lastYearExpenses, setLastYearExpenses] = useState<ExpenseResponse[]>(
    [],
  )

  const fetchData = useCallback(async () => {
    try {
      const results = await Promise.all([
        api.getExpenses(year),
        month < 12 ? api.getExpenses(year - 1) : Promise.resolve([]),
      ])
      setThisYearExpenses(results[0])
      setLastYearExpenses(results[1])
    } catch {
      // エラーは親で表示済み
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
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
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
        <Bar
          dataKey="amount"
          fill="#2563eb"
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
