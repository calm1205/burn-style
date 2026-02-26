import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
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
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  const groups: { date: string; items: ExpenseResponse[] }[] = []
  for (const e of sorted) {
    const key = toDateKey(e.created_at)
    const last = groups[groups.length - 1]
    if (last?.date === key) {
      last.items.push(e)
    } else {
      groups.push({ date: key, items: [e] })
    }
  }
  return groups
}

export const DashboardPage = () => {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setExpenses(await api.getExpenses(year, month))
    } catch (err) {
      setError(getErrorMessage(err, "データ取得に失敗"))
    }
  }, [year, month])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const goPrev = () => {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const goNext = () => {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])
  const groups = useMemo(() => groupByDate(expenses), [expenses])

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col px-6" style={{ paddingTop: "10vh" }}>
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      <div className="flex shrink-0 items-center justify-between bg-white py-8">
        <button type="button" className="text-gray-400 hover:text-gray-600" onClick={goPrev}>
          <DoubleArrowLeftIcon className="size-4" />
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {year}/{month}の支出
          </p>
          <p className="text-3xl font-bold">{total.toLocaleString()}円</p>
        </div>
        <button type="button" className="text-gray-400 hover:text-gray-600" onClick={goNext}>
          <DoubleArrowRightIcon className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.date}>
            <p className="border-b border-gray-200 pb-2 text-xs font-medium text-gray-400">{group.date}</p>
            <ul className="flex flex-col">
              {group.items.map((e) => (
                <li key={e.uuid} className="flex flex-col gap-1 py-3">
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 text-xs text-transparent" aria-hidden="true">
                      {formatTime(e.created_at)}
                    </span>
                    {e.categories.length > 0 && (
                      <div className="flex gap-2">
                        {e.categories.map((c) => (
                          <span key={c.uuid} className="text-xs text-gray-400">{c.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 text-xs text-gray-300">
                      {formatTime(e.created_at)}
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
    </div>
  )
}
