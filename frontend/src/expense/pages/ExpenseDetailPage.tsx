import { TrashIcon } from "@radix-ui/react-icons"
import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"

import { ConfirmDialog, useConfirmDialog } from "../../common/components/ConfirmDialog"
import { api } from "../../common/libs/api"
import { categoryGlyph } from "../../common/libs/category"
import { getErrorMessage } from "../../common/libs/client"
import type {
  CategoryResponse,
  ExpenseResponse,
  VibeNecessity,
  VibePlanning,
  VibeSocial,
} from "../../common/libs/types"
import { VibePicker } from "../components/VibePicker"

const pad = (n: number) => String(n).padStart(2, "0")

const toLocalDatetime = (isoStr: string) => {
  const d = new Date(isoStr)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const ExpenseDetailPage = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()

  const [expense, setExpense] = useState<ExpenseResponse | null>(null)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    amount: "",
    expensedAt: "",
    categoryUuid: null as string | null,
    vibeSocial: null as VibeSocial | null,
    vibePlanning: null as VibePlanning | null,
    vibeNecessity: null as VibeNecessity | null,
  })

  const fetchData = useCallback(async () => {
    if (!uuid) return
    try {
      const [exp, cats] = await Promise.all([api.getExpense(uuid), api.getCategories()])
      setExpense(exp)
      setCategories(cats)
      setForm({
        name: exp.name,
        amount: exp.amount.toLocaleString(),
        expensedAt: toLocalDatetime(exp.expensed_at),
        categoryUuid: exp.categories[0]?.uuid ?? null,
        vibeSocial: exp.vibe_social,
        vibePlanning: exp.vibe_planning,
        vibeNecessity: exp.vibe_necessity,
      })
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load"))
    }
  }, [uuid])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAmountChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "")
    setForm((prev) => ({ ...prev, amount: digits ? Number(digits).toLocaleString() : "" }))
  }

  const handleUpdate = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!uuid) return
    setError("")
    setLoading(true)
    try {
      await api.updateExpense(uuid, {
        name: form.name,
        amount: Number(form.amount.replace(/,/g, "")),
        expensed_at: new Date(form.expensedAt).toISOString(),
        category_uuid: form.categoryUuid,
        vibe_social: form.vibeSocial,
        vibe_planning: form.vibePlanning,
        vibe_necessity: form.vibeNecessity,
      })
      navigate(-1)
    } catch (err) {
      setError(getErrorMessage(err, "Update failed"))
    } finally {
      setLoading(false)
    }
  }

  const { dialogRef, open: openDeleteDialog } = useConfirmDialog()

  const handleDelete = async () => {
    if (!uuid) return
    setLoading(true)
    try {
      await api.deleteExpense(uuid)
      dialogRef.current?.close()
      navigate("/expense/monthly")
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed"))
    } finally {
      setLoading(false)
    }
  }

  if (!expense && !error) {
    return null
  }

  return (
    <form
      onSubmit={handleUpdate}
      className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden"
    >
      <div className="flex shrink-0 justify-center px-4 pt-8 pb-2">
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          Edit expense
        </span>
      </div>

      {error && (
        <p className="mx-5 shrink-0 pb-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
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
              value={form.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              required
              placeholder="0"
              className="w-44 bg-transparent text-center text-5xl font-bold tracking-tighter tabular-nums outline-none placeholder:text-gray-300 dark:text-gray-100 dark:placeholder:text-gray-600"
            />
          </div>
        </div>

        <div className="px-5 pt-5 text-center">
          <div className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
            When
          </div>
          <input
            type="datetime-local"
            value={form.expensedAt}
            onChange={(e) => setForm((prev) => ({ ...prev, expensedAt: e.target.value }))}
            required
            className="mt-1 bg-transparent text-center text-sm font-medium tabular-nums outline-none dark:text-gray-100"
          />
        </div>

        {categories.length > 0 && (
          <div className="px-4 pt-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = form.categoryUuid === c.uuid
                return (
                  <button
                    key={c.uuid}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        categoryUuid: prev.categoryUuid === c.uuid ? null : c.uuid,
                      }))
                    }
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
            {!form.categoryUuid && (
              <p className="px-1 pt-2 text-[11px] text-gray-400 dark:text-gray-500">
                No category — saved without one.
              </p>
            )}
          </div>
        )}

        <div className="px-4 pt-5 pb-4">
          <VibePicker
            social={form.vibeSocial}
            planning={form.vibePlanning}
            necessity={form.vibeNecessity}
            onSocialChange={(v) => setForm((prev) => ({ ...prev, vibeSocial: v }))}
            onPlanningChange={(v) => setForm((prev) => ({ ...prev, vibePlanning: v }))}
            onNecessityChange={(v) => setForm((prev) => ({ ...prev, vibeNecessity: v }))}
          />
        </div>
      </div>

      <div className="shrink-0 px-4 pt-2 pb-3">
        <button
          type="submit"
          disabled={loading || !form.name || !form.amount}
          className="w-full rounded-2xl bg-primary px-4 py-4 text-sm font-bold text-white shadow-[0_6px_18px_rgba(47,116,208,0.32)] hover:bg-primary-hover disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={openDeleteDialog}
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
        >
          <TrashIcon className="size-3.5" />
          Delete
        </button>
      </div>

      <ConfirmDialog
        message="Delete this expense?"
        onConfirm={handleDelete}
        loading={loading}
        dialogRef={dialogRef}
      />
    </form>
  )
}
