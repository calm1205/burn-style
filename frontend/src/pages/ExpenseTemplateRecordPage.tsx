import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { ExpenseResponse, ExpenseTemplateResponse } from "../lib/types"

interface TemplateRow {
  template: ExpenseTemplateResponse
  selected: boolean
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

const toLocalDatetime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const ExpenseTemplateRecordPage = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<TemplateRow[]>([])
  const [expensedAt, setExpensedAt] = useState(toLocalDatetime(new Date()))
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
            selected: !alreadyRecorded,
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

  const toggleSelect = (idx: number) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r)),
    )
  }

  const updateAmount = (idx: number, value: string) => {
    const raw = value.replace(/[^0-9]/g, "")
    const formatted = raw ? Number(raw).toLocaleString() : ""
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, amount: formatted } : r)),
    )
  }

  const selectedCount = rows.filter((r) => r.selected).length

  const handleRecord = async () => {
    setError("")
    setSubmitting(true)
    try {
      const targets = rows.filter((r) => r.selected)
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
      <div className="mx-auto flex max-w-2xl flex-col gap-3 px-6">
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

      <div className="flex flex-col gap-1.5 rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <label
          htmlFor="record-date"
          className="text-xs text-gray-500 dark:text-gray-400"
        >
          Date
        </label>
        <input
          id="record-date"
          type="datetime-local"
          value={expensedAt}
          onChange={(e) => setExpensedAt(e.target.value)}
          required
          className="rounded-xl bg-gray-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      {rows.length > 0 ? (
        <div className="flex flex-col gap-3">
          {rows.map((r, idx) => (
            <button
              key={r.template.uuid}
              type="button"
              onClick={() => toggleSelect(idx)}
              className={`rounded-2xl px-5 py-3.5 text-left shadow-sm transition-all ${
                r.selected
                  ? "ring-2 ring-primary bg-white dark:bg-gray-800"
                  : "bg-gray-100 opacity-50 dark:bg-gray-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-1 flex-col">
                  <span className="text-sm">
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
                {r.selected ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">¥</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={r.amount}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateAmount(idx, e.target.value)}
                      className="w-24 rounded-lg bg-gray-50 px-3 py-1.5 text-right text-sm tabular-nums outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                ) : (
                  <span className="text-sm tabular-nums text-gray-400">
                    ¥{r.amount}
                  </span>
                )}
              </div>
            </button>
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
        disabled={selectedCount === 0 || submitting}
        className="rounded-xl bg-primary px-5 py-4 text-white hover:bg-primary-hover disabled:opacity-50"
      >
        {submitting ? "記帳中..." : `記帳 (${String(selectedCount)})`}
      </button>
    </div>
  )
}
