import { useMemo } from "react"
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"
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

interface BubbleData {
  name: string
  frequency: number
  average: number
  total: number
  fill: string
}

interface CategoryBubbleChartProps {
  expenses: ExpenseResponse[]
}

export const CategoryBubbleChart = ({ expenses }: CategoryBubbleChartProps) => {
  const data = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>()
    for (const e of expenses) {
      const cats = e.categories.length > 0 ? e.categories : [{ name: "未分類" }]
      for (const c of cats) {
        const prev = map.get(c.name) ?? { count: 0, total: 0 }
        map.set(c.name, { count: prev.count + 1, total: prev.total + e.amount })
      }
    }
    const result: BubbleData[] = []
    let i = 0
    for (const [name, { count, total }] of map) {
      result.push({
        name,
        frequency: count,
        average: Math.round(total / count),
        total,
        fill: COLORS[i % COLORS.length],
      })
      i++
    }
    return result
  }, [expenses])

  if (data.length === 0) return null

  const maxTotal = Math.max(...data.map((d) => d.total))

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="frequency"
            name="頻度"
            type="number"
            tick={{ fontSize: 11 }}
            label={{ value: "frequency", position: "bottom", fontSize: 11 }}
          />
          <YAxis
            dataKey="average"
            name="平均単価"
            type="number"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
            }
            label={{
              value: "avg price",
              angle: -90,
              position: "insideLeft",
              fontSize: 11,
            }}
            width={50}
          />
          <ZAxis dataKey="total" range={[40, 400]} name="合計" type="number" />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null
              const d = payload[0].payload as BubbleData
              return (
                <div className="rounded border border-gray-200 bg-white px-3 py-2 text-xs shadow">
                  <p className="font-medium">{d.name}</p>
                  <p>frequency: {d.frequency}</p>
                  <p>avg: ¥{d.average.toLocaleString()}</p>
                  <p>total: ¥{d.total.toLocaleString()}</p>
                </div>
              )
            }}
          />
          {data.map((d) => (
            <Scatter key={d.name} data={[d]} fill={d.fill} fillOpacity={0.7} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 px-2">
        {data
          .sort((a, b) => b.total - a.total)
          .map((d) => (
            <li key={d.name} className="flex items-center gap-1.5">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{
                  backgroundColor: d.fill,
                  opacity: 0.7 + 0.3 * (d.total / maxTotal),
                }}
              />
              <span className="text-[10px] text-gray-600">{d.name}</span>
            </li>
          ))}
      </ul>
    </div>
  )
}
