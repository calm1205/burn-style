import { useMemo } from "react"

import type { ExpenseResponse } from "../lib/types"

const BAR_COLOR = "var(--chart-bar)"
const formatAmount = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)

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
  const midAmount = Math.round(maxAmount / 2)

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="flex items-end gap-1">
        <div className="flex h-[100px] flex-col justify-between pb-0.5 text-right">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {formatAmount(maxAmount)}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {formatAmount(midAmount)}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">0</span>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex h-[100px] items-end gap-1">
            {data.map((d) => (
              <div
                key={d.name}
                className="flex-1 rounded-t-md"
                style={{
                  height: `${(d.amount / maxAmount) * 100}%`,
                  backgroundColor: BAR_COLOR,
                }}
              />
            ))}
          </div>
          <div className="flex gap-1">
            {data.map((d, i) => (
              <span
                key={d.name}
                className="flex-1 text-center text-[10px] text-gray-400 dark:text-gray-500"
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{i + 1}</span>
            <span className="truncate text-xs text-gray-500 dark:text-gray-400">{d.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
