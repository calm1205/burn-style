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

const CHART_WIDTH = 360
const CHART_HEIGHT = 300
const CX = CHART_WIDTH / 2
const CY = CHART_HEIGHT / 2
const INNER_RADIUS = 45
const OUTER_RADIUS = 70
const LABEL_HEIGHT = 30
const RADIAN = Math.PI / 180

interface CategoryTotal {
  name: string
  amount: number
  fill: string
}

interface LabelPosition {
  name: string
  amount: number
  startX: number
  startY: number
  endX: number
  labelY: number
  isRight: boolean
}

const computeLabelPositions = (data: CategoryTotal[]): LabelPosition[] => {
  const total = data.reduce((sum, d) => sum + d.amount, 0)
  const raw: LabelPosition[] = []

  let currentAngle = 0
  for (const d of data) {
    const sliceAngle = (d.amount / total) * 360
    const midAngle = currentAngle + sliceAngle / 2

    const startX = CX + OUTER_RADIUS * Math.cos(-midAngle * RADIAN)
    const startY = CY + OUTER_RADIUS * Math.sin(-midAngle * RADIAN)
    const midX = CX + (OUTER_RADIUS + 20) * Math.cos(-midAngle * RADIAN)
    const midY = CY + (OUTER_RADIUS + 20) * Math.sin(-midAngle * RADIAN)
    const isRight = midX > CX

    raw.push({
      name: d.name,
      amount: d.amount,
      startX,
      startY,
      endX: isRight ? CX + OUTER_RADIUS + 50 : CX - OUTER_RADIUS - 50,
      labelY: midY,
      isRight,
    })

    currentAngle += sliceAngle
  }

  const rightLabels = raw
    .filter((l) => l.isRight)
    .sort((a, b) => a.labelY - b.labelY)
  const leftLabels = raw
    .filter((l) => !l.isRight)
    .sort((a, b) => a.labelY - b.labelY)

  const resolveOverlap = (labels: LabelPosition[]) => {
    for (let i = 1; i < labels.length; i++) {
      const prev = labels[i - 1]
      const curr = labels[i]
      if (curr.labelY - prev.labelY < LABEL_HEIGHT) {
        curr.labelY = prev.labelY + LABEL_HEIGHT
      }
    }
  }

  resolveOverlap(rightLabels)
  resolveOverlap(leftLabels)

  return [...rightLabels, ...leftLabels]
}

const createLabelRenderer = (data: CategoryTotal[]) => {
  const positionMap = new Map<string, LabelPosition>()
  for (const p of computeLabelPositions(data)) {
    positionMap.set(p.name, p)
  }

  return (props: { name: string }) => {
    const p = positionMap.get(props.name)
    if (!p) return null

    const textAnchor = p.isRight ? "start" : "end"
    const textX = p.endX + (p.isRight ? 4 : -4)

    return (
      <g>
        <polyline
          points={`${p.startX},${p.startY} ${p.endX},${p.labelY} ${p.endX},${p.labelY}`}
          fill="none"
          stroke="#9ca3af"
          strokeWidth={1}
        />
        <text
          x={textX}
          y={p.labelY - 6}
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize={11}
          fill="#6b7280"
        >
          {p.name}
        </text>
        <text
          x={textX}
          y={p.labelY + 8}
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize={11}
          fill="#9ca3af"
        >
          {p.amount.toLocaleString()}円
        </text>
      </g>
    )
  }
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

  const renderLabel = createLabelRenderer(categoryData)

  return (
    <div className="mt-6 flex justify-center">
      <PieChart width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Pie
          data={categoryData}
          dataKey="amount"
          nameKey="name"
          cx={CX}
          cy={CY}
          innerRadius={INNER_RADIUS}
          outerRadius={OUTER_RADIUS}
          strokeWidth={2}
          isAnimationActive={false}
          label={renderLabel}
        />
      </PieChart>
    </div>
  )
}
