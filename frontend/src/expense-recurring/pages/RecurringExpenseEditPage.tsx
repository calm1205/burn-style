import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"

import { ConfirmDialog, useConfirmDialog } from "../../common/components/ConfirmDialog"
import { api } from "../../common/libs/api"
import { categoryGlyph } from "../../common/libs/category"
import { getErrorMessage } from "../../common/libs/client"
import type {
  CategoryResponse,
  IntervalUnit,
  RecurringExpenseCreate,
  RecurringExpenseUpdate,
} from "../../common/libs/types"

interface FrequencyOption {
  key: string
  label: string
  unit: IntervalUnit
  count: number
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { key: "weekly", label: "Weekly", unit: "WEEK", count: 1 },
  { key: "biweekly", label: "Every 2 wk", unit: "WEEK", count: 2 },
  { key: "monthly", label: "Monthly", unit: "MONTH", count: 1 },
  { key: "quarterly", label: "Quarterly", unit: "MONTH", count: 3 },
  { key: "yearly", label: "Yearly", unit: "MONTH", count: 12 },
]

const matchFrequency = (unit: IntervalUnit, count: number): string =>
  FREQUENCY_OPTIONS.find((f) => f.unit === unit && f.count === count)?.key ?? "monthly"

const todayJst = (): string => {
  const now = new Date()
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return jst.toISOString().slice(0, 10)
}

export const RecurringExpenseEditPage = () => {
  const navigate = useNavigate()
  const { uuid } = useParams<{ uuid: string }>()
  const isEdit = Boolean(uuid)

  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { dialogRef, open: openDialog } = useConfirmDialog()

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [frequencyKey, setFrequencyKey] = useState("monthly")
  const [startDate, setStartDate] = useState(todayJst)
  const [categoryUuid, setCategoryUuid] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const cats = await api.getCategories()
      setCategories(cats)
      if (uuid) {
        const r = await api.getRecurringExpense(uuid)
        setName(r.name)
        setAmount(r.amount.toLocaleString())
        setFrequencyKey(matchFrequency(r.interval_unit, r.interval_count))
        setStartDate(r.start_date)
        setCategoryUuid(r.category.uuid)
      } else if (cats.length > 0) {
        setCategoryUuid(cats[0].uuid)
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [uuid])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const freq = FREQUENCY_OPTIONS.find((f) => f.key === frequencyKey)
    if (!freq) {
      setError("Invalid frequency")
      setLoading(false)
      return
    }
    try {
      if (isEdit && uuid) {
        const data: RecurringExpenseUpdate = {
          name,
          amount: Number(amount.replace(/,/g, "")),
          interval_unit: freq.unit,
          interval_count: freq.count,
          start_date: startDate,
          category_uuid: categoryUuid,
        }
        await api.updateRecurringExpense(uuid, data)
      } else {
        const data: RecurringExpenseCreate = {
          name,
          amount: Number(amount.replace(/,/g, "")),
          interval_unit: freq.unit,
          interval_count: freq.count,
          start_date: startDate,
          category_uuid: categoryUuid,
        }
        await api.createRecurringExpense(data)
      }
      navigate("/expense/recurring")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save"))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!uuid) return
    setError("")
    setLoading(true)
    try {
      await api.deleteRecurringExpense(uuid)
      dialogRef.current?.close()
      navigate("/expense/recurring")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-6 px-6 pb-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {/* Name + amount card */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <label className="text-xs text-gray-500 dark:text-gray-400" htmlFor="recurring-name">
          Name this recurring
        </label>
        <input
          id="recurring-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={50}
          placeholder="House cleaner"
          className="mt-1 w-full border-x-0 border-t-0 border-b border-gray-200 bg-transparent py-2 text-lg outline-none focus:border-primary dark:border-gray-700 dark:text-gray-100"
        />
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-2xl text-gray-400">¥</span>
          <input
            id="recurring-amount"
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "")
              setAmount(raw ? Number(raw).toLocaleString() : "")
            }}
            required
            placeholder="0"
            className="flex-1 border-x-0 border-t-0 border-b border-gray-200 bg-transparent py-2 text-2xl outline-none focus:border-primary dark:border-gray-700 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Frequency */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">How often</div>
        <div className="flex flex-wrap gap-2">
          {FREQUENCY_OPTIONS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFrequencyKey(f.key)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                frequencyKey === f.key
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start date */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <label className="text-xs text-gray-500 dark:text-gray-400" htmlFor="recurring-start">
          Start date
        </label>
        <input
          id="recurring-start"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="mt-1 w-full border-x-0 border-t-0 border-b border-gray-200 bg-transparent py-2 outline-none focus:border-primary dark:border-gray-700 dark:text-gray-100"
        />
      </div>

      {/* Category */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">Category</div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.uuid}
              type="button"
              onClick={() => setCategoryUuid(c.uuid)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                categoryUuid === c.uuid
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <span className="mr-1">{categoryGlyph(c)}</span>
              {c.name}
            </button>
          ))}
        </div>
        {categories.length === 0 && (
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Create a category first from /category
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={loading || !categoryUuid}
          className="rounded-2xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Save" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/expense/recurring")}
          disabled={loading}
          className="rounded-2xl border border-gray-200 py-3 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={openDialog}
            disabled={loading}
            className="mt-4 rounded-2xl py-3 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Stop this recurring
          </button>
        )}
      </div>

      <ConfirmDialog
        message={`Stop "${name}"? Past records remain unchanged.`}
        onConfirm={handleDelete}
        confirmText="Stop"
        loading={loading}
        dialogRef={dialogRef}
      />
    </form>
  )
}
