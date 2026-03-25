import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { ExpenseResponse, ExpenseTemplateResponse } from "../lib/types"

interface TemplateRow {
  template: ExpenseTemplateResponse
  checked: boolean
  amount: string
  recorded: boolean
}

const isRecorded = (
  t: ExpenseTemplateResponse,
  expenses: ExpenseResponse[],
): boolean =>
  expenses.some(
    (e) =>
      e.name === t.name && e.categories.some((c) => c.uuid === t.category.uuid),
  )

export const ExpenseTemplateRecordPage = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<TemplateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const now = new Date()
      const [templates, expenses] = await Promise.all([
        api.getExpenseTemplates(),
        api.getExpenses(now.getFullYear(), now.getMonth() + 1),
      ])
      setRows(
        templates.map((t) => {
          const alreadyRecorded = isRecorded(t, expenses)
          return {
            template: t,
            checked: !alreadyRecorded,
            amount: t.amount.toLocaleString(),
            recorded: alreadyRecorded,
          }
        }),
      )
    } catch (err) {
      setError(getErrorMessage(err, "データ取得に失敗"))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleCheck = (idx: number) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, checked: !r.checked } : r)),
    )
  }

  const updateAmount = (idx: number, value: string) => {
    const raw = value.replace(/[^0-9]/g, "")
    const formatted = raw ? Number(raw).toLocaleString() : ""
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, amount: formatted } : r)),
    )
  }

  const checkedCount = rows.filter((r) => r.checked).length

  const handleRecord = async () => {
    setError("")
    setSubmitting(true)
    try {
      const targets = rows.filter((r) => r.checked)
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, "0")
      const expensedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`

      await Promise.all(
        targets.map((r) =>
          api.createExpense({
            name: r.template.name,
            amount: Number(r.amount.replace(/,/g, "")),
            expensed_at: expensedAt,
            category_uuid: r.template.category.uuid,
          }),
        ),
      )
      navigate("/expense/monthly")
    } catch (err) {
      setError(getErrorMessage(err, "記帳に失敗"))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={`skeleton-${String(i)}`}
            className="h-16 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-700"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {rows.length > 0 ? (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-gray-700 dark:bg-gray-800">
          {rows.map((r, idx) => (
            <div key={r.template.uuid} className="flex flex-col px-5 py-3.5">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={r.checked}
                  onChange={() => toggleCheck(idx)}
                  className="size-4 shrink-0 accent-primary"
                />
                <div className="flex flex-1 flex-col">
                  <span
                    className={`text-sm ${r.recorded ? "text-gray-400 dark:text-gray-500" : ""}`}
                  >
                    {r.template.name}
                    {r.recorded && (
                      <span className="ml-2 text-xs text-green-500">
                        記帳済み
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {r.template.category.name}
                  </span>
                </div>
              </div>
              {r.checked && (
                <div className="mt-2 ml-7">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">¥</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={r.amount}
                      onChange={(e) => updateAmount(idx, e.target.value)}
                      className="w-28 rounded-lg bg-gray-50 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No templates
        </p>
      )}

      <button
        type="button"
        onClick={handleRecord}
        disabled={checkedCount === 0 || submitting}
        className="rounded-xl bg-primary px-5 py-4 text-white hover:bg-primary-hover disabled:opacity-50"
      >
        {submitting ? "記帳中..." : `記帳 (${String(checkedCount)})`}
      </button>
    </div>
  )
}
