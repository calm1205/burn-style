import { useNavigate } from "react-router"

import { categoryGlyph } from "../../common/libs/category"
import type { ExpenseResponse } from "../../common/libs/types"

const pad = (n: number) => String(n).padStart(2, "0")

const timeLabel = (iso: string): string => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface ExpenseListDayGroupProps {
  label: string
  total: number
  items: ExpenseResponse[]
}

export const ExpenseListDayGroup = ({ label, total, items }: ExpenseListDayGroupProps) => {
  const navigate = useNavigate()
  return (
    <section>
      <div className="mb-1.5 flex items-baseline justify-between px-1 text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
        <h2>{label}</h2>
        <span className="tabular-nums">¥{total.toLocaleString()}</span>
      </div>
      <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
        {items.map((e) => {
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
  )
}
