import { useMemo } from "react"

import type { ExpenseResponse } from "../lib/types"

const BAR_COLOR = "var(--chart-bar)"

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
    <div className="mt-3 flex flex-col gap-1">
      <div className="flex h-[100px] items-end gap-1.5">
        {data.map((d) => (
          <div
            key={d.name}
            className="max-w-3.5 flex-1 rounded-t-md"
            style={{
              height: `${(d.amount / maxAmount) * 100}%`,
              backgroundColor: BAR_COLOR,
            }}
          />
        ))}
      </div>
      <div className="flex gap-1.5">
        {data.map((d) => (
          <span
            key={d.name}
            className="max-w-3.5 flex-1 truncate text-center text-[9px] text-gray-400 dark:text-gray-500"
          >
            {d.name}
          </span>
        ))}
      </div>
    </div>
  )
}
