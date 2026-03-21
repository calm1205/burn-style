import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
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
      </div>
    </div>
  )
}
