import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Cell, Pie, PieChart } from "recharts"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { ExpenseResponse } from "../lib/types"

const COLORS = [
  "#94a3b8",
  "#a1a1aa",
  "#9ca3af",
  "#a3a3a3",
  "#b4bcd0",
  "#c4b5a0",
  "#a8b8b0",
  "#b0a8b8",
]

interface CategoryTotal {
  name: string
  amount: number
}

const aggregateByCategory = (expenses: ExpenseResponse[]): CategoryTotal[] => {
  const map = new Map<string, number>()
  for (const e of expenses) {
    if (e.categories.length === 0) {
      map.set("未分類", (map.get("未分類") ?? 0) + e.amount)
    } else {
      for (const c of e.categories) {
        map.set(c.name, (map.get(c.name) ?? 0) + e.amount)
      }
    }
  }
  return [...map.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export const TopPage = () => {
  const navigate = useNavigate()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
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

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  )

  const categoryData = useMemo(() => aggregateByCategory(expenses), [expenses])

  return (
    <div className="flex h-full items-center justify-center px-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          {year}/{month}の支出
        </p>
        <p
          className="cursor-pointer text-4xl font-bold hover:text-gray-600"
          onClick={() => navigate("/dashboard")}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/dashboard")
          }}
        >
          {total.toLocaleString()}円
        </p>

        {categoryData.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-6">
            <PieChart width={160} height={160}>
              <Pie
                data={categoryData}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                strokeWidth={2}
              >
                {categoryData.map((_, i) => (
                  <Cell
                    key={categoryData[i].name}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
            <div className="flex flex-col gap-2">
              {categoryData.map((d, i) => (
                <span
                  key={d.name}
                  className="flex items-center gap-2 text-xs text-gray-600"
                >
                  <span
                    className="inline-block size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {d.name} {d.amount.toLocaleString()}円
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            onClick={() => navigate("/category")}
          >
            カテゴリ
          </button>
          <button
            type="button"
            className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            onClick={() => navigate("/analysis")}
          >
            年次の分析
          </button>
          <button
            type="button"
            className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
            onClick={() => navigate("/template")}
          >
            テンプレート
          </button>
        </div>
      </div>
    </div>
  )
}
