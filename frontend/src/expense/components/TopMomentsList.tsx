import { useNavigate } from "react-router"

import { categoryGlyph } from "../../common/libs/category"
import type { ExpenseResponse } from "../../common/libs/types"

const pad = (n: number) => String(n).padStart(2, "0")

const dayShort = (iso: string): string => {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const timeLabel = (iso: string): string => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface TopMomentsListProps {
  expenses: ExpenseResponse[]
}

export const TopMomentsList = ({ expenses }: TopMomentsListProps) => {
  const navigate = useNavigate()
  if (expenses.length === 0) {
    return (
      <p className="shrink-0 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        No expenses yet
      </p>
    )
  }

  return (
    <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto pb-2 dark:divide-gray-700">
      {expenses.map((e, i) => {
        const c = e.categories[0]
        const showDate =
          i === 0 ||
          new Date(expenses[i - 1].expensed_at).toDateString() !==
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
              <span className="text-sm font-medium tabular-nums">¥{e.amount.toLocaleString()}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
