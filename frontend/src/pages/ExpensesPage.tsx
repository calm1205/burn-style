import {
  type SubmitEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { useNavigate } from "react-router"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { CategoryResponse } from "../lib/types"

export const ExpensesPage = () => {
  const navigate = useNavigate()
  const nameRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")

  // 作成フォーム
  const now = new Date()
  const toLocalDatetime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const today = toLocalDatetime(now)
  const [form, setForm] = useState({
    name: "",
    amount: "",
    expensedAt: today,
    categoryUuid: null as string | null,
  })

  const fetchData = useCallback(async () => {
    try {
      setCategories(await api.getCategories())
    } catch (err) {
      setError(getErrorMessage(err, "データ取得に失敗"))
    }
  }, [])

  useEffect(() => {
    fetchData()
    nameRef.current?.focus()
  }, [fetchData])

  const selectCategory = (uuid: string) => {
    setForm((prev) => ({
      ...prev,
      categoryUuid: prev.categoryUuid === uuid ? null : uuid,
    }))
  }

  const handleCreate = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    try {
      await api.createExpense({
        name: form.name,
        amount: Number(form.amount.replace(/,/g, "")),
        expensed_at: form.expensedAt,
        category_uuid: form.categoryUuid,
      })
      navigate("/expense/monthly")
    } catch (err) {
      setError(getErrorMessage(err, "作成に失敗"))
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form
        id="expense-form"
        onSubmit={handleCreate}
        className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense-name" className="text-xs text-gray-500">
            Name
          </label>
          <input
            ref={nameRef}
            id="expense-name"
            type="text"
            placeholder="Lunch"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            maxLength={100}
            className="rounded-xl bg-gray-50 px-4 py-3 text-base outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense-amount" className="text-xs text-gray-500">
            Amount
          </label>
          <input
            id="expense-amount"
            type="text"
            inputMode="numeric"
            placeholder="1,000"
            value={form.amount}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "")
              const formatted = raw ? Number(raw).toLocaleString() : ""
              setForm((prev) => ({ ...prev, amount: formatted }))
            }}
            required
            className="rounded-xl bg-gray-50 px-4 py-3 text-base outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense-date" className="text-xs text-gray-500">
            Date
          </label>
          <input
            id="expense-date"
            type="datetime-local"
            value={form.expensedAt}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, expensedAt: e.target.value }))
            }
            required
            className="rounded-xl bg-gray-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-500">Category</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.uuid}
                  type="button"
                  onClick={() => selectCategory(c.uuid)}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    form.categoryUuid === c.uuid
                      ? "bg-primary text-white"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      <button
        type="submit"
        form="expense-form"
        className="rounded-xl bg-primary px-5 py-4 text-white hover:bg-primary-hover"
      >
        Add
      </button>
    </div>
  )
}
