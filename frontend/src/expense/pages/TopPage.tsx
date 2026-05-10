import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"

import { api } from "../../common/libs/api"
import { categoryGlyph } from "../../common/libs/category"
import { getErrorMessage } from "../../common/libs/client"
import type { ExpenseResponse } from "../../common/libs/types"

const pad = (n: number) => String(n).padStart(2, "0")

const monthLabel = (year: number, month: number): string =>
  new Date(year, month - 1, 1)
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase()

const dayShort = (iso: string): string => {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const timeLabel = (iso: string): string => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface HeatmapProps {
  year: number
  month: number
  today: number
  totals: number[]
  onSelectDay: (day: number) => void
}

const Heatmap = ({ year, month, today, totals, onSelectDay }: HeatmapProps) => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDow = new Date(year, month - 1, 1).getDay()
  const max = Math.max(...totals, 0)

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 text-center text-[9px] font-semibold tracking-wide text-gray-400 dark:text-gray-500">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`sp${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const v = totals[i] ?? 0
          const isToday = day === today
          const isFuture = day > today
          const intensity = max > 0 ? 22 + (v / max) * 72 : 0
          const cellStyle =
            !isFuture && v > 0
              ? {
                  background: `color-mix(in oklab, var(--color-primary) ${intensity}%, #edf2f7)`,
                  color: v / max > 0.5 ? "#fff" : "#4a5568",
                }
              : undefined
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDay(day)}
              disabled={isFuture}
              style={cellStyle}
              className={`flex aspect-square items-center justify-center rounded-md text-[10px] font-semibold disabled:cursor-default ${
                isFuture
                  ? "border border-dashed border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600"
                  : isToday
                    ? "border-[1.5px] border-gray-900 dark:border-gray-100"
                    : v === 0
                      ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                      : ""
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const TopPage = () => {
  const navigate = useNavigate()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const today = now.getDate()
  const daysInMonth = new Date(year, month, 0).getDate()

  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setExpenses(await api.getExpenses(year, month))
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [year, month])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totals = useMemo(() => {
    const arr: number[] = Array.from({ length: daysInMonth }, () => 0)
    for (const e of expenses) {
      const d = new Date(e.expensed_at)
      if (d.getFullYear() === year && d.getMonth() === month - 1) {
        arr[d.getDate() - 1] += e.amount
      }
    }
    return arr
  }, [expenses, year, month, daysInMonth])

  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])
  const perDay = today > 0 ? Math.round(total / today) : 0

  const monthExpenses = useMemo(
    () =>
      [...expenses].toSorted(
        (a, b) => new Date(b.expensed_at).getTime() - new Date(a.expensed_at).getTime(),
      ),
    [expenses],
  )

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden px-6">
      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="shrink-0 pt-1">
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          {monthLabel(year, month)}
        </span>
      </div>

      <div className="shrink-0 pt-4">
        <Heatmap
          year={year}
          month={month}
          today={today}
          totals={totals}
          onSelectDay={(day) => {
            const dateKey = `${year}-${pad(month)}-${pad(day)}`
            navigate(`/expense/monthly?date=${dateKey}`)
          }}
        />
      </div>

      <div className="mt-6 shrink-0 border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          Burned this month
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight tabular-nums">
            ¥{total.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            · ¥{perDay.toLocaleString()}/day
          </span>
        </div>
      </div>

      <div className="mt-5 mb-1.5 flex shrink-0 items-baseline justify-between">
        <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          Latest moments
        </span>
        <button
          type="button"
          onClick={() => navigate("/expense/monthly")}
          className="text-xs font-semibold text-primary"
        >
          All →
        </button>
      </div>

      {monthExpenses.length === 0 ? (
        <p className="shrink-0 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
          No expenses yet
        </p>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto pb-2 dark:divide-gray-700">
          {monthExpenses.map((e, i) => {
            const c = e.categories[0]
            const showDate =
              i === 0 ||
              new Date(monthExpenses[i - 1].expensed_at).toDateString() !==
                new Date(e.expensed_at).toDateString()
            return (
              <li key={e.uuid}>
                <button
                  type="button"
                  onClick={() => navigate(`/expense/${e.uuid}`)}
                  className="grid w-full grid-cols-[46px_14px_1fr_auto] items-center gap-1.5 py-2 text-left"
                >
                  <span
                    className={`text-[11px] font-semibold ${
                      showDate ? "text-gray-500 dark:text-gray-400" : "text-transparent"
                    }`}
                  >
                    {dayShort(e.expensed_at)}
                  </span>
                  <span className="text-center text-[11px] text-gray-400 dark:text-gray-500">
                    {c ? categoryGlyph(c) : "·"}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{e.name}</div>
                    <div className="truncate text-[10px] text-gray-400 dark:text-gray-500">
                      {c ? c.name : "Uncategorized"} · {timeLabel(e.expensed_at)}
                    </div>
                  </div>
                  <span className="text-sm font-medium tabular-nums">
                    ¥{e.amount.toLocaleString()}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
