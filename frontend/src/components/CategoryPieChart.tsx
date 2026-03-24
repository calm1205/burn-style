import { useMemo, useState } from "react"
import { Pie, PieChart, Tooltip } from "recharts"
import { assignChartColors, CHART_COLORS } from "../lib/colors"
import type { ExpenseResponse } from "../lib/types"

interface CategoryTotal {
  name: string
  amount: number
  fill: string
}

interface CategoryPieChartProps {
  expenses: ExpenseResponse[]
}

export const CategoryPieChart = ({ expenses }: CategoryPieChartProps) => {
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const { allCategories, colorMap } = useMemo(() => {
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
    return {
      allCategories: sorted.map((s) => s.name),
      colorMap: assignChartColors(sorted),
    }
  }, [expenses])

  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      if (e.categories.length === 0) {
        if (!hidden.has("未分類")) {
          map.set("未分類", (map.get("未分類") ?? 0) + e.amount)
        }
      } else {
        for (const c of e.categories) {
          if (!hidden.has(c.name)) {
            map.set(c.name, (map.get(c.name) ?? 0) + e.amount)
          }
        }
      }
    }
    return [...map.entries()]
      .map(
        ([name, amount]): CategoryTotal => ({
          name,
          amount,
          fill: colorMap.get(name) ?? CHART_COLORS[0],
        }),
      )
      .sort((a, b) => b.amount - a.amount)
  }, [expenses, hidden, colorMap])

  const total = categoryData.reduce((sum, c) => sum + c.amount, 0)

  const toggle = (cat: string) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  if (allCategories.length === 0) return null

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
                fill="var(--chart-label)"
              >
                {name}
              </text>
            )}
            labelLine
          />
          <Tooltip
            trigger="hover"
            formatter={(value) => `¥${Number(value).toLocaleString()}`}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              fontSize: "12px",
              backgroundColor: "var(--chart-tooltip-bg)",
              color: "var(--chart-tooltip-text)",
            }}
          />
        </PieChart>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {allCategories.map((cat) => {
          const isHidden = hidden.has(cat)
          const matched = categoryData.find((c) => c.name === cat)
          return (
            <li key={cat}>
              <button
                type="button"
                onClick={() => toggle(cat)}
                className={`flex w-full items-center justify-between px-2 ${
                  isHidden ? "opacity-30" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block size-3 rounded-full"
                    style={{ backgroundColor: colorMap.get(cat) }}
                  />
                  <span className="text-sm">{cat}</span>
                </div>
                {matched && !isHidden && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {Math.round((matched.amount / total) * 100)}%
                    </span>
                    <span className="font-mono text-sm">
                      ¥{matched.amount.toLocaleString()}
                    </span>
                  </div>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
