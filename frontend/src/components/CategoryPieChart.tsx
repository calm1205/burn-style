import { Cell, Pie, PieChart, type PieLabelRenderProps } from "recharts"
import type { ExpenseResponse } from "../lib/types"

const COLORS = [
  "#94a3b8",
  "#a1a1aa",
  "#9ca3af",
  "#a3a3a3",
  "#b4bcd0",
  "#c4b5a0",
  "#a8b8b0",
  "#b0a8b8",
]

interface CategoryTotal {
  name: string
  amount: number
}

const renderLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, outerRadius, name, value } = props
  const RADIAN = Math.PI / 180
  const cxNum = Number(cx)
  const cyNum = Number(cy)
  const outerR = Number(outerRadius)
  const angle = Number(midAngle)

  const startX = cxNum + outerR * Math.cos(-angle * RADIAN)
  const startY = cyNum + outerR * Math.sin(-angle * RADIAN)
  const midX = cxNum + (outerR + 20) * Math.cos(-angle * RADIAN)
  const midY = cyNum + (outerR + 20) * Math.sin(-angle * RADIAN)
  const isRight = midX > cxNum
  const endX = isRight ? midX + 20 : midX - 20
  const textAnchor = isRight ? "start" : "end"

  return (
    <g>
      <polyline
        points={`${startX},${startY} ${midX},${midY} ${endX},${midY}`}
        fill="none"
        stroke="#9ca3af"
        strokeWidth={1}
      />
      <text
        x={endX + (isRight ? 4 : -4)}
        y={midY}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="text-xs"
        fill="#6b7280"
      >
        {name}
      </text>
      <text
        x={endX + (isRight ? 4 : -4)}
        y={midY + 14}
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="text-xs"
        fill="#9ca3af"
      >
        {Number(value).toLocaleString()}円
      </text>
    </g>
  )
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
    .map(([name, amount]) => ({ name, amount }))
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
      <PieChart width={360} height={280}>
        <Pie
          data={categoryData}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={45}
          outerRadius={70}
          strokeWidth={2}
          label={renderLabel}
          isAnimationActive={false}
        >
          {categoryData.map((_, i) => (
            <Cell key={categoryData[i].name} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </div>
  )
}
