import { useMemo } from "react"

import type { ExpenseResponse } from "../../common/libs/types"

const BAR_COLOR = "var(--chart-bar)"
const formatAmount = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)

interface CategoryBarChartProps {
  expenses: ExpenseResponse[]
}

export const CategoryBarChart = ({ expenses }: CategoryBarChartProps) => {
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

  if (data.length === 0) {
    return <p className="mt-8 text-center text-sm text-gray-400">No data</p>
  }

  const maxAmount = data[0].amount
  const midAmount = Math.round(maxAmount / 2)
  const total = data.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex shrink-0 items-end gap-2">
        <div className="flex h-[240px] flex-col justify-between pb-1 text-right">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            ¥{formatAmount(maxAmount)}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            ¥{formatAmount(midAmount)}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">0</span>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex h-[240px] items-end gap-1.5">
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
          <div className="flex gap-1.5">
            {data.map((d, i) => (
              <span
                key={d.name}
                className="flex-1 text-center text-xs text-gray-400 dark:text-gray-500"
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      </div>
      <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.amount / total) * 100) : 0
          return (
            <li key={d.name} className="flex items-center gap-3 px-2 py-2.5">
              <span className="w-5 text-right text-xs text-gray-400 dark:text-gray-500">
                {i + 1}
              </span>
              <span className="flex-1 truncate text-sm">{d.name}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{pct}%</span>
              <span className="w-20 text-right font-mono text-sm">
                ¥{d.amount.toLocaleString()}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
