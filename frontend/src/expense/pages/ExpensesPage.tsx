import { type SubmitEvent, useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"

import { api } from "../../common/libs/api"
import { categoryGlyph } from "../../common/libs/category"
import { getErrorMessage } from "../../common/libs/client"
import type {
  CategoryResponse,
  VibeNecessity,
  VibePlanning,
  VibeSocial,
} from "../../common/libs/types"
import { VibePicker } from "../components/VibePicker"

const pad = (n: number) => String(n).padStart(2, "0")

const toLocalDatetime = (d: Date) => {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const ExpensesPage = () => {
  const navigate = useNavigate()
  const nameRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Create form
  const now = new Date()
  const today = toLocalDatetime(now)
  const [form, setForm] = useState({
    name: "",
    amount: "",
    expensedAt: today,
    categoryUuid: null as string | null,
    vibeSocial: null as VibeSocial | null,
    vibePlanning: null as VibePlanning | null,
    vibeNecessity: null as VibeNecessity | null,
  })

  const fetchData = useCallback(async () => {
    try {
      setCategories(await api.getCategories())
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
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
    setLoading(true)
    try {
      await api.createExpense({
        name: form.name,
        amount: Number(form.amount.replace(/,/g, "")),
        expensed_at: form.expensedAt,
        category_uuid: form.categoryUuid,
        vibe_social: form.vibeSocial,
        vibe_planning: form.vibePlanning,
        vibe_necessity: form.vibeNecessity,
      })
      navigate("/expense/monthly")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 pb-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <form
        id="expense-form"
        onSubmit={handleCreate}
        className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense-name" className="text-xs text-gray-500 dark:text-gray-400">
            Name
          </label>
          <input
            ref={nameRef}
            id="expense-name"
            type="text"
            placeholder="Lunch"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
            maxLength={100}
            className="rounded-xl bg-gray-50 px-4 py-3 text-base outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense-amount" className="text-xs text-gray-500 dark:text-gray-400">
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
            className="rounded-xl bg-gray-50 px-4 py-3 text-base outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="expense-date" className="text-xs text-gray-500 dark:text-gray-400">
            Date
          </label>
          <input
            id="expense-date"
            type="datetime-local"
            value={form.expensedAt}
            onChange={(e) => setForm((prev) => ({ ...prev, expensedAt: e.target.value }))}
            required
            className="rounded-xl bg-gray-50 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">Category</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.uuid}
                  type="button"
                  onClick={() => selectCategory(c.uuid)}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    form.categoryUuid === c.uuid
                      ? "bg-primary text-white"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                  }`}
                >
                  <span className="mr-1">{categoryGlyph(c)}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <VibePicker
          social={form.vibeSocial}
          planning={form.vibePlanning}
          necessity={form.vibeNecessity}
          onSocialChange={(v) => setForm((prev) => ({ ...prev, vibeSocial: v }))}
          onPlanningChange={(v) => setForm((prev) => ({ ...prev, vibePlanning: v }))}
          onNecessityChange={(v) => setForm((prev) => ({ ...prev, vibeNecessity: v }))}
        />
      </form>

      <button
        type="submit"
        form="expense-form"
        disabled={loading}
        className="rounded-xl bg-primary px-5 py-4 text-white hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add"}
      </button>

      <button
        type="button"
        onClick={() => navigate("/expense/template/new")}
        disabled={loading}
        className="rounded-xl border border-gray-200 px-5 py-4 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        Template
      </button>
    </div>
  )
}
