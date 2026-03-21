import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { CategoryPieChart } from "../components/CategoryPieChart"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { ExpenseResponse } from "../lib/types"

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

  return (
    <div className="flex h-full flex-col px-6">
      <h1 className="shrink-0 pt-6 text-center text-lg font-bold">BurnStyle</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-sm text-gray-500">
          {year}/{month}の支出
        </p>
        <p
          className="cursor-pointer text-4xl font-bold hover:text-gray-600"
          onClick={() => navigate("/expense/monthly")}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate("/expense/monthly")
          }}
        >
          {total.toLocaleString()}円
        </p>

        <CategoryPieChart expenses={expenses} />

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
