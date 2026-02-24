import { useCallback, useEffect, useState } from "react"
import { api } from "../lib/api"
import type { ExpenseResponse } from "../lib/types"

const isCurrentMonth = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  )
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const DashboardPage = () => {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setExpenses(await api.getExpenses())
    } catch (err) {
      setError(err instanceof Error ? err.message : "データ取得に失敗")
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const monthlyExpenses = expenses.filter((e) => isCurrentMonth(e.created_at))
  const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col px-6">
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      <div className="shrink-0 py-8 text-center">
        <p className="text-sm text-gray-500">
          {new Date().getMonth() + 1}月の支出
        </p>
        <p className="text-3xl font-bold">{total.toLocaleString()}円</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <ul className="flex flex-col">
          {monthlyExpenses.map((e) => (
            <li
              key={e.uuid}
              className="flex items-center justify-between border-b border-gray-100 py-3"
            >
              <div className="flex flex-col">
                <div>
                  <span className="text-sm">{e.name}</span>
                  {e.categories.length > 0 && (
                    <span className="ml-2 text-xs text-gray-400">
                      {e.categories.map((c) => c.name).join(", ")}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-300">
                  {formatDate(e.created_at)}
                </span>
              </div>
              <span className="shrink-0 text-sm font-mono">
                {e.amount.toLocaleString()}円
              </span>
            </li>
          ))}
        </ul>

        {monthlyExpenses.length === 0 && (
          <p className="text-center text-sm text-gray-400">
            今月の支出はありません
          </p>
        )}
      </div>
    </div>
  )
}
