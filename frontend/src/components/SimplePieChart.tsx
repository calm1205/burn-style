import { Pie, PieChart } from "recharts"
import { assignChartColors, CHART_COLORS } from "../lib/colors"
import type { ExpenseResponse } from "../lib/types"

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
  const sorted = [...map.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
  const colorMap = assignChartColors(sorted)
  const data = sorted.map((item) => ({
    ...item,
    fill: colorMap.get(item.name) ?? CHART_COLORS[0],
  }))

  if (data.length === 0) return null

  return (
    <div className="mt-3 flex items-center gap-5">
      <PieChart width={120} height={120}>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          startAngle={90}
          endAngle={-270}
          innerRadius={32}
          outerRadius={52}
          stroke="#fff"
          strokeWidth={3}
          isAnimationActive={false}
        />
      </PieChart>
      <ul className="flex flex-1 flex-col gap-1.5">
        {data.map((c) => (
          <li key={c.name} className="flex items-center gap-2">
            <span
              className="inline-block size-2 shrink-0 rounded-full"
              style={{ backgroundColor: c.fill }}
            />
            <span className="truncate text-xs text-gray-500">{c.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
