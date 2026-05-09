import { useMemo } from "react"
import { useNavigate } from "react-router"

import { categoryGlyph } from "../../common/libs/category"
import type { ExpenseResponse } from "../../common/libs/types"

const pad = (n: number) => String(n).padStart(2, "0")

const dateKey = (iso: string): string => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const dateLabel = (key: string): string => {
  const [y, m, day] = key.split("-").map(Number)
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const timeLabel = (iso: string): string => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface ExpenseListProps {
  expenses: ExpenseResponse[]
}

interface DayGroup {
  key: string
  label: string
  items: ExpenseResponse[]
}

export const ExpenseList = ({ expenses }: ExpenseListProps) => {
  const navigate = useNavigate()

  const groups = useMemo<DayGroup[]>(() => {
    const sorted = [...expenses].toSorted(
      (a, b) => new Date(b.expensed_at).getTime() - new Date(a.expensed_at).getTime(),
    )
    const map = new Map<string, ExpenseResponse[]>()
    for (const e of sorted) {
      const k = dateKey(e.expensed_at)
      const list = map.get(k)
      if (list) {
        list.push(e)
      } else {
        map.set(k, [e])
      }
    }
    return [...map.entries()].map(([key, items]) => ({
      key,
      label: dateLabel(key),
      items,
    }))
  }, [expenses])

  if (expenses.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        No expenses this month
      </p>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pt-2">
      {groups.map((g) => (
        <section key={g.key}>
          <h2 className="mb-1.5 px-1 text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            {g.label}
          </h2>
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
            {g.items.map((e) => {
              const c = e.categories[0]
              return (
                <li key={e.uuid}>
                  <button
                    type="button"
                    onClick={() => navigate(`/expense/${e.uuid}`)}
                    className="flex w-full items-center gap-3 px-3.5 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-base dark:bg-gray-700">
                      {c ? categoryGlyph(c) : "·"}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{e.name}</span>
                      <span className="truncate text-[11px] text-gray-400 dark:text-gray-500">
                        {c ? c.name : "Uncategorized"} · {timeLabel(e.expensed_at)}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      ¥{e.amount.toLocaleString()}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
