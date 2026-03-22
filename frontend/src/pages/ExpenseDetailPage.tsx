import { ArrowLeftIcon } from "@radix-ui/react-icons"
import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { ConfirmDialog, useConfirmDialog } from "../components/ConfirmDialog"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { CategoryResponse, ExpenseResponse } from "../lib/types"

const toLocalDatetime = (isoStr: string) => {
  const d = new Date(isoStr)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const ExpenseDetailPage = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()

  const [expense, setExpense] = useState<ExpenseResponse | null>(null)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    amount: "",
    expensedAt: "",
    categoryUuid: null as string | null,
  })

  const fetchData = useCallback(async () => {
    if (!uuid) return
    try {
      const [exp, cats] = await Promise.all([
        api.getExpense(uuid),
        api.getCategories(),
      ])
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
    }
  }

  const { dialogRef, open: openDeleteDialog } = useConfirmDialog()

  const handleDelete = async () => {
    if (!uuid) return
    try {
      await api.deleteExpense(uuid)
      dialogRef.current?.close()
      navigate("/expense/monthly")
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed"))
    }
  }

  if (!expense && !error) {
    return null
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-stretch gap-12 px-6">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-600"
        >
          <ArrowLeftIcon className="size-5" />
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <form
        id="expense-detail-form"
        onSubmit={handleUpdate}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="detail-name" className="text-xs text-gray-500">
            Name
          </label>
          <input
            id="detail-name"
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            maxLength={100}
            className="border-b border-gray-200 px-4 py-3 text-base placeholder:text-gray-200 focus:border-gray-900 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="detail-amount" className="text-xs text-gray-500">
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
            className="border-b border-gray-200 px-4 py-3 text-base placeholder:text-gray-200 focus:border-gray-900 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="detail-date" className="text-xs text-gray-500">
            Date
          </label>
          <input
            id="detail-date"
            type="datetime-local"
            value={form.expensedAt}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, expensedAt: e.target.value }))
            }
            required
            className="border-b border-gray-200 px-4 py-3 text-base focus:border-gray-900 focus:outline-none"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-500">Category</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.uuid}
                  type="button"
                  onClick={() => selectCategory(c.uuid)}
                  className={`rounded-sm px-4 py-2 text-sm ${
                    form.categoryUuid === c.uuid
                      ? "border border-blue-600 bg-blue-600 text-white"
                      : "border border-gray-200 text-gray-500"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
      <div className="flex flex-col gap-5">
        <button
          type="submit"
          form="expense-detail-form"
          className="rounded bg-primary px-5 py-4 text-white hover:bg-primary-hover"
        >
          Update
        </button>
        <button
          type="button"
          onClick={openDeleteDialog}
          className="rounded border border-red-600 px-5 py-4 text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        message="Delete this expense?"
        onConfirm={handleDelete}
        dialogRef={dialogRef}
      />
    </div>
  )
}
