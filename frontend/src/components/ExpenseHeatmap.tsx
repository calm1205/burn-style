import { useMemo } from "react"
import type { ExpenseResponse } from "../lib/types"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const getColor = (amount: number, mean: number, sd: number) => {
  if (amount === 0) return { bg: "bg-gray-100", text: "text-gray-600" }
  if (sd === 0) return { bg: "bg-blue-300", text: "text-gray-600" }
  const z = (amount - mean) / sd
  if (z > 0.75) return { bg: "bg-blue-800", text: "text-white" }
  if (z > 0.25) return { bg: "bg-blue-600", text: "text-gray-600" }
  if (z > -0.25) return { bg: "bg-blue-400", text: "text-gray-600" }
  if (z > -0.75) return { bg: "bg-blue-200", text: "text-gray-600" }
  return { bg: "bg-blue-100", text: "text-gray-600" }
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
  const { dailyTotals, daysInMonth, startOffset, mean, sd } = useMemo(() => {
    const totals = new Map<number, number>()
    for (const e of expenses) {
      const d = new Date(e.expensed_at)
      const day = d.getDate()
      totals.set(day, (totals.get(day) ?? 0) + e.amount)
    }

    const days = new Date(year, month, 0).getDate()
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    // 支出のある日のみで平均・標準偏差を算出
    const amounts = [...totals.values()]
    const avg =
      amounts.length > 0
        ? amounts.reduce((s, v) => s + v, 0) / amounts.length
        : 0
    const variance =
      amounts.length > 0
        ? amounts.reduce((s, v) => s + (v - avg) ** 2, 0) / amounts.length
        : 0

    return {
      dailyTotals: totals,
      daysInMonth: days,
      startOffset: offset,
      mean: avg,
      sd: Math.sqrt(variance),
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
          const color = day !== null ? getColor(amount, mean, sd) : null
          return (
            <div
              key={`${day ?? "empty"}-${String(i)}`}
              className={`flex aspect-square items-center justify-center rounded text-xs ${
                color ? `${color.bg} ${color.text}` : ""
              }`}
              title={
                day ? `${month}/${day}: ¥${amount.toLocaleString()}` : undefined
              }
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
