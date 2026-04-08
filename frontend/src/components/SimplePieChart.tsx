import type { PieSectorShapeProps } from "recharts"
import { Pie, PieChart, Sector } from "recharts"

import type { ExpenseResponse } from "../lib/types"

const PIE_FILL = "var(--color-primary)"
const MIN_OUTER = 32
const MAX_OUTER = 55

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
    .map(([name, amount]) => ({ name, amount, fill: PIE_FILL }))
    .toSorted((a, b) => b.amount - a.amount)

  if (data.length === 0) return null

  const maxAmount = data[0].amount

  const renderStepSector = (props: PieSectorShapeProps) => {
    const amount = (props as PieSectorShapeProps & { payload: { amount: number } }).payload.amount
    const ratio = maxAmount > 0 ? amount / maxAmount : 1
    const outerRadius = MIN_OUTER + (MAX_OUTER - MIN_OUTER) * ratio
    return <Sector {...props} outerRadius={outerRadius} />
  }

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
          innerRadius={0}
          outerRadius={MAX_OUTER}
          stroke="var(--chart-pie-stroke)"
          strokeWidth={2}
          isAnimationActive={false}
          shape={renderStepSector}
        />
      </PieChart>
      <ul className="flex flex-1 flex-col gap-1.5">
        {data.map((c, i) => (
          <li key={c.name} className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{i + 1}</span>
            <span className="truncate text-xs text-gray-500 dark:text-gray-400">{c.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
