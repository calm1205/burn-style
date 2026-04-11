import { useMemo } from "react"
import { useNavigate } from "react-router"

import type { ExpenseResponse } from "../lib/types"

const pad = (n: number) => String(n).padStart(2, "0")

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface ExpenseListProps {
  expenses: ExpenseResponse[]
}

export const ExpenseList = ({ expenses }: ExpenseListProps) => {
  const navigate = useNavigate()
  const sorted = useMemo(
    () =>
      [...expenses].toSorted(
        (a, b) => new Date(b.expensed_at).getTime() - new Date(a.expensed_at).getTime(),
      ),
    [expenses],
  )

  return (
    <div className="min-h-0 flex-1 overflow-y-auto flex flex-col gap-3 pt-4">
      {sorted.map((e) => (
        <button
          key={e.uuid}
          type="button"
          className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-left shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
          onClick={() => navigate(`/expense/${e.uuid}`)}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-sm">{e.name}</span>
            {e.categories.length > 0 && (
              <div className="flex gap-2">
                {e.categories.map((c) => (
                  <span key={c.uuid} className="text-xs text-gray-400 dark:text-gray-500">
                    {c.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-sm font-mono">¥{e.amount.toLocaleString()}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatDateTime(e.expensed_at)}
            </span>
          </div>
        </button>
      ))}

      {expenses.length === 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">
          No expenses this month
        </p>
      )}
    </div>
  )
}
