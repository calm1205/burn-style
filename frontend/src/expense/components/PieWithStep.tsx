import { useMemo, useState } from "react"
import type { PieSectorShapeProps } from "recharts"
import { Pie, PieChart, Sector } from "recharts"

import type { ExpenseResponse } from "../../common/libs/types"

const PIE_FILL = "var(--chart-bar)"
const MIN_OUTER = 55
const MAX_OUTER = 100

interface CategoryTotal {
  name: string
  amount: number
}

interface PieWithStepProps {
  expenses: ExpenseResponse[]
}

export const PieWithStep = ({ expenses }: PieWithStepProps) => {
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const allCategories = useMemo(() => {
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

  const visibleData = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      if (e.categories.length === 0) {
        if (!hidden.has("Uncategorized")) {
          map.set("Uncategorized", (map.get("Uncategorized") ?? 0) + e.amount)
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
      .map(([name, amount]): CategoryTotal => ({ name, amount }))
      .toSorted((a, b) => b.amount - a.amount)
  }, [expenses, hidden])

  const total = visibleData.reduce((sum, c) => sum + c.amount, 0)
  const maxAmount = visibleData.length > 0 ? visibleData[0].amount : 0

  const renderStepSector = (props: PieSectorShapeProps) => {
    const amount = (props as PieSectorShapeProps & { payload: { amount: number } }).payload.amount
    const ratio = maxAmount > 0 ? amount / maxAmount : 1
    const outerRadius = MIN_OUTER + (MAX_OUTER - MIN_OUTER) * ratio
    return <Sector {...props} outerRadius={outerRadius} />
  }

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

  const pieData = visibleData.map((c) => ({ ...c, fill: PIE_FILL }))

  return (
    <div className="mt-6">
      <div className="flex justify-center">
        <PieChart width={260} height={260}>
          <Pie
            data={pieData}
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
      </div>
      <ul className="mt-4 flex flex-col">
        {allCategories.map((cat, i) => {
          const isHidden = hidden.has(cat.name)
          const matched = visibleData.find((c) => c.name === cat.name)
          const pct = matched && total > 0 ? Math.round((matched.amount / total) * 100) : 0
          return (
            <li key={cat.name}>
              <button
                type="button"
                onClick={() => toggle(cat.name)}
                className={`flex w-full items-center gap-3 px-2 py-2.5 ${
                  isHidden ? "opacity-30" : ""
                }`}
              >
                <span className="w-5 text-right text-xs text-gray-400 dark:text-gray-500">
                  {i + 1}
                </span>
                <span className="flex-1 text-left text-sm">{cat.name}</span>
                {matched && !isHidden && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 dark:text-gray-500">{pct}%</span>
                    <span className="w-20 text-right font-mono text-sm">
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
