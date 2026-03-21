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

const AMOUNT_RANGES = [
  { label: "~¥500", min: 1, max: 500 },
  { label: "¥501~1,500", min: 501, max: 1500 },
  { label: "¥1,501~5,000", min: 1501, max: 5000 },
  { label: "¥5,001~10,000", min: 5001, max: 10000 },
  { label: "¥10,001~30,000", min: 10001, max: 30000 },
  { label: "¥30,001~", min: 30001, max: Infinity },
]

const COLORS = [
  "#bfdbfe",
  "#93c5fd",
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
  "#1e3a5f",
]

interface BubbleData {
  label: string
  rangeIndex: number
  frequency: number
  total: number
  fill: string
}

interface CategoryBubbleChartProps {
  expenses: ExpenseResponse[]
}

export const CategoryBubbleChart = ({ expenses }: CategoryBubbleChartProps) => {
  const data = useMemo(() => {
    const buckets = AMOUNT_RANGES.map((range, i) => ({
      ...range,
      index: i,
      count: 0,
      total: 0,
    }))

    for (const e of expenses) {
      const bucket = buckets.find((b) => e.amount >= b.min && e.amount <= b.max)
      if (bucket) {
        bucket.count++
        bucket.total += e.amount
      }
    }

    return buckets
      .filter((b) => b.count > 0)
      .map(
        (b): BubbleData => ({
          label: b.label,
          rangeIndex: b.index,
          frequency: b.count,
          total: b.total,
          fill: COLORS[b.index % COLORS.length],
        }),
      )
  }, [expenses])

  if (data.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ left: 10, right: 20, top: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="frequency"
            name="頻度"
            type="number"
            tick={{ fontSize: 11 }}
            label={{ value: "頻度（回）", position: "bottom", fontSize: 11 }}
            allowDecimals={false}
          />
          <YAxis
            dataKey="rangeIndex"
            name="金額帯"
            type="number"
            domain={[-0.5, AMOUNT_RANGES.length - 0.5]}
            ticks={AMOUNT_RANGES.map((_, i) => i)}
            tickFormatter={(v: number) => AMOUNT_RANGES[v]?.label ?? ""}
            tick={{ fontSize: 10 }}
            width={80}
          />
          <ZAxis dataKey="total" range={[60, 500]} name="合計" type="number" />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null
              const d = payload[0].payload as BubbleData
              return (
                <div className="rounded border border-gray-200 bg-white px-3 py-2 text-xs shadow">
                  <p className="font-medium">{d.label}</p>
                  <p>回数: {d.frequency}</p>
                  <p>合計: ¥{d.total.toLocaleString()}</p>
                </div>
              )
            }}
          />
          {data.map((d) => (
            <Scatter key={d.label} data={[d]} fill={d.fill} fillOpacity={0.7} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 px-2">
        {AMOUNT_RANGES.map((range, i) => (
          <li key={range.label} className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i], opacity: 0.8 }}
            />
            <span className="text-[10px] text-gray-600">{range.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
