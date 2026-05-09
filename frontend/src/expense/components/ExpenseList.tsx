import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router"

import type { ExpenseResponse } from "../../common/libs/types"

type SortKey = "date" | "amount"
type SortOrder = "desc" | "asc"

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
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
    } else {
      setSortKey(key)
      setSortOrder("desc")
    }
  }

  const sorted = useMemo(() => {
    const factor = sortOrder === "desc" ? -1 : 1
    return [...expenses].toSorted((a, b) => {
      if (sortKey === "amount") {
        return (a.amount - b.amount) * factor
      }
      return (new Date(a.expensed_at).getTime() - new Date(b.expensed_at).getTime()) * factor
    })
  }, [expenses, sortKey, sortOrder])

  return (
    <>
      <div className="flex shrink-0 gap-2 pt-2 pb-1">
        {(["date", "amount"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => toggleSort(k)}
            className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors ${
              sortKey === k
                ? "border-primary bg-primary text-white"
                : "border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
            }`}
          >
            <span>{k === "date" ? "Date" : "Amount"}</span>
            {sortKey === k &&
              (sortOrder === "desc" ? (
                <ArrowDownIcon className="size-3" />
              ) : (
                <ArrowUpIcon className="size-3" />
              ))}
          </button>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pt-2">
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
              <span className="font-mono text-sm">¥{e.amount.toLocaleString()}</span>
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
    </>
  )
}
