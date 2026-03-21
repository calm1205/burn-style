import { Pie, PieChart, Tooltip } from "recharts"
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

interface CategoryTotal {
  name: string
  amount: number
  fill: string
}

const aggregateByCategory = (expenses: ExpenseResponse[]): CategoryTotal[] => {
  const map = new Map<string, number>()
  for (const e of expenses) {
    if (e.categories.length === 0) {
      map.set("未分類", (map.get("未分類") ?? 0) + e.amount)
    } else {
      for (const c of e.categories) {
        map.set(c.name, (map.get(c.name) ?? 0) + e.amount)
      }
    }
  }
  return [...map.entries()]
    .map(([name, amount], i) => ({
      name,
      amount,
      fill: COLORS[i % COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount)
}

interface CategoryPieChartProps {
  expenses: ExpenseResponse[]
}

export const CategoryPieChart = ({ expenses }: CategoryPieChartProps) => {
  const categoryData = aggregateByCategory(expenses)

  if (categoryData.length === 0) return null

  return (
    <div className="mt-6 flex justify-center">
      <PieChart width={300} height={250}>
        <Pie
          data={categoryData}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={70}
          strokeWidth={2}
          isAnimationActive={false}
          label={({ name }) => name}
          labelLine
        />
        <Tooltip formatter={(value) => `${Number(value).toLocaleString()}円`} />
      </PieChart>
    </div>
  )
}
