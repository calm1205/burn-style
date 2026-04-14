import { useMemo } from "react"

import { CHART_COLORS } from "../lib/colors"
import type { ExpenseResponse } from "../lib/types"

interface SimpleBarChartProps {
  expenses: ExpenseResponse[]
}

export const SimpleBarChart = ({ expenses }: SimpleBarChartProps) => {
  const data = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      if (e.categories.length === 0) {
        map.set("Uncategorized", (map.get("Uncategorized") ?? 0) + e.amount)
      } else {
        for (const c of e.categories) {
          map.set(c.name, (map.get(c.name) ?? 0) + e.amount)
        }
      }
    }
    return [...map.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .toSorted((a, b) => b.amount - a.amount)
  }, [expenses])

  if (data.length === 0) return null

  const maxAmount = data[0].amount

  return (
    <div className="mt-3 flex flex-col gap-2">
      {data.map((d, i) => (
        <div key={d.name} className="flex items-center gap-2">
          <span className="w-16 shrink-0 truncate text-xs text-gray-500 dark:text-gray-400">
            {d.name}
          </span>
          <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(d.amount / maxAmount) * 100}%`,
                backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
