import { useMemo } from "react"
import { useNavigate } from "react-router"
import type { ExpenseResponse } from "../lib/types"

const toDateKey = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const groupByDate = (expenses: ExpenseResponse[]) => {
  const sorted = [...expenses].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  const groups: { date: string; items: ExpenseResponse[] }[] = []
  for (const e of sorted) {
    const key = toDateKey(e.expensed_at)
    const last = groups[groups.length - 1]
    if (last?.date === key) {
      last.items.push(e)
    } else {
      groups.push({ date: key, items: [e] })
    }
  }
  return groups
}

interface ExpenseListProps {
  expenses: ExpenseResponse[]
}

export const ExpenseList = ({ expenses }: ExpenseListProps) => {
  const navigate = useNavigate()
  const groups = useMemo(() => groupByDate(expenses), [expenses])

  return (
    <div className="min-h-0 flex-1 overflow-y-auto flex flex-col gap-6 pt-4">
      {groups.map((group) => (
        <div key={group.date}>
          <p className="border-b border-gray-200 pb-2 text-xs font-medium text-gray-400">
            {group.date}
          </p>
          <ul className="flex flex-col">
            {group.items.map((e) => (
              <li
                key={e.uuid}
                className="flex cursor-pointer flex-col gap-1 py-3 hover:bg-gray-50"
                onClick={() => navigate(`/expense/${e.uuid}`)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter") navigate(`/expense/${e.uuid}`)
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="shrink-0 text-xs text-transparent"
                    aria-hidden="true"
                  >
                    {formatTime(e.expensed_at)}
                  </span>
                  {e.categories.length > 0 && (
                    <div className="flex gap-2">
                      {e.categories.map((c) => (
                        <span key={c.uuid} className="text-xs text-gray-400">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="shrink-0 text-xs text-gray-300">
                    {formatTime(e.expensed_at)}
                  </span>
                  <span className="flex-1 text-sm">{e.name}</span>
                  <span className="shrink-0 text-sm font-mono">
                    {e.amount.toLocaleString()}円
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {expenses.length === 0 && (
        <p className="text-center text-sm text-gray-400">
          この月の支出はありません
        </p>
      )}
    </div>
  )
}
