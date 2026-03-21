import { useMemo } from "react"
import type { ExpenseResponse } from "../lib/types"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const getColor = (amount: number, max: number) => {
  if (amount === 0 || max === 0) return "bg-gray-100"
  const ratio = amount / max
  if (ratio > 0.75) return "bg-blue-700"
  if (ratio > 0.5) return "bg-blue-500"
  if (ratio > 0.25) return "bg-blue-300"
  return "bg-blue-100"
}

interface ExpenseHeatmapProps {
  year: number
  month: number
  expenses: ExpenseResponse[]
}

export const ExpenseHeatmap = ({
  year,
  month,
  expenses,
}: ExpenseHeatmapProps) => {
  const { dailyTotals, daysInMonth, startOffset, maxAmount } = useMemo(() => {
    const totals = new Map<number, number>()
    for (const e of expenses) {
      const d = new Date(e.expensed_at)
      const day = d.getDate()
      totals.set(day, (totals.get(day) ?? 0) + e.amount)
    }

    const days = new Date(year, month, 0).getDate()
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
    // Convert Sunday=0 to Monday-based offset (Mon=0, Sun=6)
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    const max = Math.max(0, ...totals.values())

    return {
      dailyTotals: totals,
      daysInMonth: days,
      startOffset: offset,
      maxAmount: max,
    }
  }, [year, month, expenses])

  const cells: (number | null)[] = [
    ...Array.from<null>({ length: startOffset }).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to fill last row
  const remainder = cells.length % 7
  if (remainder > 0) {
    cells.push(...Array.from<null>({ length: 7 - remainder }).fill(null))
  }

  return (
    <div className="flex flex-col gap-2 px-5">
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="flex items-center justify-center text-xs text-gray-400"
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const amount = day ? (dailyTotals.get(day) ?? 0) : 0
          return (
            <div
              key={`${day ?? "empty"}-${String(i)}`}
              className={`flex aspect-square items-center justify-center rounded text-xs ${
                day === null ? "" : getColor(amount, maxAmount)
              }`}
              title={
                day
                  ? `${month}/${day}: ${amount.toLocaleString()}円`
                  : undefined
              }
            >
              {day && <span className="text-gray-600">{day}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
