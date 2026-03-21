import { Pie, PieChart } from "recharts"
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

interface SimplePieChartProps {
  expenses: ExpenseResponse[]
}

export const SimplePieChart = ({ expenses }: SimplePieChartProps) => {
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
  const data = [...map.entries()]
    .map(([name, amount], i) => ({
      name,
      amount,
      fill: COLORS[i % COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount)

  if (data.length === 0) return null

  return (
    <div className="flex items-center gap-4">
      <PieChart width={130} height={130}>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          startAngle={90}
          endAngle={-270}
          innerRadius={35}
          outerRadius={55}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </PieChart>
      <ul className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1">
        {data.map((c) => (
          <li key={c.name} className="flex items-center gap-2">
            <span
              className="inline-block size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: c.fill }}
            />
            <span className="truncate text-xs text-gray-600">{c.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
