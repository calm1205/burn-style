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

export const ExpensesPage = () => {
  const navigate = useNavigate()
  const nameRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [categoryUuid, setCategoryUuid] = useState<string | null>(null)
  const [vibeSocial, setVibeSocial] = useState<VibeSocial | null>(null)
  const [vibePlanning, setVibePlanning] = useState<VibePlanning | null>(null)
  const [vibeNecessity, setVibeNecessity] = useState<VibeNecessity | null>(null)

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

  const handleAmountChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "")
    setAmount(digits ? Number(digits).toLocaleString() : "")
  }

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.createExpense({
        name,
        amount: Number(amount.replace(/,/g, "")),
        expensed_at: new Date().toISOString(),
        category_uuid: categoryUuid,
        vibe_social: vibeSocial,
        vibe_planning: vibePlanning,
        vibe_necessity: vibeNecessity,
      })
      navigate("/expense/monthly")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden"
    >
      <div className="flex shrink-0 justify-center px-4 pt-8 pb-2">
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          New expense
        </span>
      </div>

      {error && (
        <p className="mx-5 shrink-0 pb-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-3">
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            placeholder="What was this?"
            className="w-full bg-transparent text-2xl font-bold tracking-tight outline-none placeholder:text-gray-300 dark:text-gray-100 dark:placeholder:text-gray-600"
          />
          <div className="mt-2 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="px-5 pt-5 text-center">
          <div className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            What did this cost you
          </div>
          <div className="mt-2 flex items-baseline justify-center gap-1">
            <span className="text-2xl font-medium text-gray-500 dark:text-gray-400">¥</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              required
              placeholder="0"
              className="w-44 bg-transparent text-center text-5xl font-bold tracking-tighter tabular-nums outline-none placeholder:text-gray-300 dark:text-gray-100 dark:placeholder:text-gray-600"
            />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="px-4 pt-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = categoryUuid === c.uuid
                return (
                  <button
                    key={c.uuid}
                    type="button"
                    onClick={() => setCategoryUuid(active ? null : c.uuid)}
                    className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-semibold ${
                      active
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <span>{categoryGlyph(c)}</span>
                    <span>{c.name}</span>
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => navigate("/category/new")}
                className="flex items-center rounded-2xl border border-dashed border-gray-300 bg-transparent px-3 py-2 text-xs font-semibold text-gray-500 dark:border-gray-700 dark:text-gray-400"
              >
                + Category
              </button>
            </div>
            {!categoryUuid && (
              <p className="px-1 pt-2 text-[11px] text-gray-400 dark:text-gray-500">
                No category — saved without one.
              </p>
            )}
          </div>
        )}

        <div className="px-4 pt-5 pb-4">
          <VibePicker
            social={vibeSocial}
            planning={vibePlanning}
            necessity={vibeNecessity}
            onSocialChange={setVibeSocial}
            onPlanningChange={setVibePlanning}
            onNecessityChange={setVibeNecessity}
          />
        </div>
      </div>

      <div className="shrink-0 px-4 pt-2 pb-3">
        <button
          type="submit"
          disabled={loading || !name || !amount}
          className="w-full rounded-2xl bg-primary px-4 py-4 text-sm font-bold text-white shadow-[0_6px_18px_rgba(47,116,208,0.32)] hover:bg-primary-hover disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? "Saving…" : "Save expense"}
        </button>
      </div>
    </form>
  )
}
