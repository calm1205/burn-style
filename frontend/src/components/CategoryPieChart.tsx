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
    <div className="mt-6">
      <div className="flex justify-center">
        <PieChart width={300} height={250}>
          <Pie
            data={categoryData}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius={45}
            outerRadius={70}
            strokeWidth={2}
            isAnimationActive={false}
            label={({ x, y, name, textAnchor }) => (
              <text
                x={x}
                y={y}
                textAnchor={textAnchor}
                dominantBaseline="central"
                fontSize={11}
                fill="#6b7280"
              >
                {name}
              </text>
            )}
            labelLine
          />
          <Tooltip
            trigger="hover"
            formatter={(value) => `${Number(value).toLocaleString()}円`}
          />
        </PieChart>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {categoryData.map((c) => (
          <li key={c.name} className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span
                className="inline-block size-3 rounded-full"
                style={{ backgroundColor: c.fill }}
              />
              <span className="text-sm">{c.name}</span>
            </div>
            <span className="text-sm font-mono">
              {c.amount.toLocaleString()}円
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
