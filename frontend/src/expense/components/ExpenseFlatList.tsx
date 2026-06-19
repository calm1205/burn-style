import { useNavigate } from "react-router"

import { categoryGlyph } from "../../common/libs/category"
import type { ExpenseResponse } from "../../common/libs/types"

const pad = (n: number) => String(n).padStart(2, "0")

const dateTimeLabel = (iso: string): string => {
  const d = new Date(iso)
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface ExpenseFlatListProps {
  expenses: ExpenseResponse[]
  emptyLabel?: string
}

export const ExpenseFlatList = ({
  expenses,
  emptyLabel = "No expenses yet",
}: ExpenseFlatListProps) => {
  const navigate = useNavigate()
  if (expenses.length === 0) {
    return (
      <p className="shrink-0 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        {emptyLabel}
      </p>
    )
  }

  return (
    <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto pb-2 dark:divide-gray-700">
      {expenses.map((e) => {
        const c = e.categories[0]
        const hasSymbol = !!c?.symbol?.trim()
        return (
          <li key={e.uuid}>
            <button
              type="button"
              onClick={() => navigate(`/expense/${e.uuid}`)}
              className="grid w-full grid-cols-[14px_1fr_auto] items-center gap-1.5 py-2 text-left"
            >
              <span className="text-center text-[11px] text-gray-400 dark:text-gray-500">
                {c ? categoryGlyph(c) : "·"}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{e.name}</div>
                <div className="truncate text-[10px] text-gray-400 dark:text-gray-500">
                  {hasSymbol
                    ? dateTimeLabel(e.expensed_at)
                    : `${c ? c.name : "Uncategorized"} · ${dateTimeLabel(e.expensed_at)}`}
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
