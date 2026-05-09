import {
  CheckIcon,
  ChevronDownIcon,
  Pencil1Icon,
  PlusIcon,
  ResetIcon,
  TrashIcon,
} from "@radix-ui/react-icons"
import { type SubmitEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router"

import { ConfirmDialog, useConfirmDialog } from "../../common/components/ConfirmDialog"
import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { CategoryResponse, ExpenseTemplateResponse } from "../../common/libs/types"

export const ExpenseTemplatePage = () => {
  const [templates, setTemplates] = useState<ExpenseTemplateResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    amount: "",
    categoryUuid: "",
  })

  const totalAmount = useMemo(() => templates.reduce((sum, t) => sum + t.amount, 0), [templates])

  const [editing, setEditing] = useState<{
    uuid: string
    name: string
    amount: string
    categoryUuid: string
  } | null>(null)
  const editNameRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    try {
      const [t, c] = await Promise.all([api.getExpenseTemplates(), api.getCategories()])
      setTemplates(t)
      setCategories(c)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreate = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.createExpenseTemplate({
        name: form.name,
        amount: Number(form.amount.replace(/,/g, "")),
        category_uuid: form.categoryUuid,
      })
      setForm({ name: "", amount: "", categoryUuid: "" })
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create"))
    } finally {
      setLoading(false)
    }
  }

  const [deleteTarget, setDeleteTarget] = useState<ExpenseTemplateResponse | null>(null)
  const { dialogRef, open: openDialog } = useConfirmDialog()

  const confirmDelete = (t: ExpenseTemplateResponse) => {
    setDeleteTarget(t)
    openDialog()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setError("")
    setLoading(true)
    try {
      await api.deleteExpenseTemplate(deleteTarget.uuid)
      setDeleteTarget(null)
      dialogRef.current?.close()
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete"))
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (t: ExpenseTemplateResponse) => {
    setEditing({
      uuid: t.uuid,
      name: t.name,
      amount: t.amount.toLocaleString(),
      categoryUuid: t.category.uuid,
    })
    requestAnimationFrame(() => editNameRef.current?.focus())
  }

  const handleUpdate = async () => {
    if (!editing) return
    setError("")
    setLoading(true)
    try {
      await api.updateExpenseTemplate(editing.uuid, {
        name: editing.name,
        amount: Number(editing.amount.replace(/,/g, "")),
        category_uuid: editing.categoryUuid,
      })
      setEditing(null)
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col gap-6 px-6 pb-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {/* Create form */}
      {categories.length > 0 ? (
        <form
          onSubmit={handleCreate}
          className="flex shrink-0 flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800"
        >
          <input
            type="text"
            placeholder="Netflix"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
            maxLength={100}
            className="w-full rounded-xl bg-gray-50 px-4 py-2.5 text-base outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="1,490"
            value={form.amount}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "")
              const formatted = raw ? Number(raw).toLocaleString() : ""
              setForm((prev) => ({ ...prev, amount: formatted }))
            }}
            required
            className="w-full rounded-xl bg-gray-50 px-4 py-2.5 text-base outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
          />
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={form.categoryUuid}
                onChange={(e) => setForm((prev) => ({ ...prev, categoryUuid: e.target.value }))}
                required
                className="w-full appearance-none rounded-xl bg-gray-50 py-2.5 pr-8 pl-4 text-base outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="" disabled>
                  Category
                </option>
                {categories.map((c) => (
                  <option key={c.uuid} value={c.uuid}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="flex shrink-0 flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please register a category first.
          </p>
          <Link
            to="/category"
            className="rounded-xl bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover"
          >
            Manage Categories
          </Link>
        </div>
      )}

      {/* Total amount */}
      {templates.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-3.5 shadow-sm dark:bg-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
          <span className="min-w-0 truncate text-sm font-semibold tabular-nums">
            ¥{totalAmount.toLocaleString()}
          </span>
        </div>
      )}

      {/* Template list */}
      {templates.length > 0 ? (
        <div className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto rounded-2xl bg-white shadow-sm dark:divide-gray-700 dark:bg-gray-800">
          {templates.map((t) => (
            <div key={t.uuid} className="flex items-center gap-3 px-5 py-3.5">
              {editing?.uuid === t.uuid ? (
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={editNameRef}
                      type="text"
                      value={editing.name}
                      onChange={(e) =>
                        setEditing((prev) => (prev ? { ...prev, name: e.target.value } : null))
                      }
                      maxLength={100}
                      className="flex-1 rounded-lg bg-gray-50 px-3 py-1.5 text-base outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editing.amount}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "")
                        const formatted = raw ? Number(raw).toLocaleString() : ""
                        setEditing((prev) => (prev ? { ...prev, amount: formatted } : null))
                      }}
                      className="w-24 rounded-lg bg-gray-50 px-3 py-1.5 text-base outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={editing.categoryUuid}
                        onChange={(e) =>
                          setEditing((prev) =>
                            prev ? { ...prev, categoryUuid: e.target.value } : null,
                          )
                        }
                        className="w-full appearance-none rounded-lg bg-gray-50 py-1.5 pr-8 pl-3 text-base outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
                      >
                        {categories.map((c) => (
                          <option key={c.uuid} value={c.uuid}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={loading}
                      className="text-primary hover:text-primary-hover disabled:opacity-50"
                    >
                      <CheckIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      disabled={loading}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <ResetIcon className="size-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm">{t.name}</span>
                    <span className="truncate text-xs text-gray-400 dark:text-gray-500">
                      {t.category.name}
                    </span>
                  </div>
                  <span className="min-w-0 shrink-0 truncate text-sm tabular-nums">
                    ¥{t.amount.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEdit(t)}
                    disabled={loading}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <Pencil1Icon className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(t)}
                    disabled={loading}
                    className="text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <TrashIcon className="size-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No templates</p>
      )}

      <ConfirmDialog
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        loading={loading}
        dialogRef={dialogRef}
      />
    </div>
  )
}
