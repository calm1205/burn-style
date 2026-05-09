import { ArrowLeftIcon, TrashIcon } from "@radix-ui/react-icons"
import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"

import { ConfirmDialog, useConfirmDialog } from "../../common/components/ConfirmDialog"
import { api } from "../../common/libs/api"
import { categoryGlyph } from "../../common/libs/category"
import { getErrorMessage } from "../../common/libs/client"
import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"

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
      })
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load"))
    }
  }, [uuid])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const selectCategory = (catUuid: string) => {
    setForm((prev) => ({
      ...prev,
      categoryUuid: prev.categoryUuid === catUuid ? null : catUuid,
    }))
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
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 pb-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex size-9 items-center justify-center rounded-xl bg-white shadow-sm hover:shadow-md dark:bg-gray-800"
      >
        <ArrowLeftIcon className="size-4 text-gray-600 dark:text-gray-400" />
      </button>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <form
        id="expense-detail-form"
        onSubmit={handleUpdate}
        className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="detail-name" className="text-xs text-gray-500 dark:text-gray-400">
            Name
          </label>
          <input
            id="detail-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
            maxLength={100}
            className="rounded-xl bg-gray-50 px-4 py-3 text-base outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="detail-amount" className="text-xs text-gray-500 dark:text-gray-400">
            Amount
          </label>
          <input
            id="detail-amount"
            type="text"
            inputMode="numeric"
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
          <label htmlFor="detail-date" className="text-xs text-gray-500 dark:text-gray-400">
            Date
          </label>
          <input
            id="detail-date"
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
      </form>

      <button
        type="submit"
        form="expense-detail-form"
        disabled={loading}
        className="rounded-xl bg-primary px-5 py-4 text-white hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update"}
      </button>

      <button
        type="button"
        onClick={openDeleteDialog}
        disabled={loading}
        className="flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
      >
        <TrashIcon className="size-3.5" />
        Delete
      </button>

      <ConfirmDialog
        message="Delete this expense?"
        onConfirm={handleDelete}
        loading={loading}
        dialogRef={dialogRef}
      />
    </div>
  )
}
