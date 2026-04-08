import { CheckIcon, Pencil1Icon, PlusIcon, ResetIcon, TrashIcon } from "@radix-ui/react-icons"
import { type SubmitEvent, useCallback, useEffect, useRef, useState } from "react"

import { ConfirmDialog, useConfirmDialog } from "../components/ConfirmDialog"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { CategoryResponse } from "../lib/types"

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [editing, setEditing] = useState<{ uuid: string; name: string } | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null)
  const { dialogRef, open: openDialog } = useConfirmDialog()

  const fetchData = useCallback(async () => {
    try {
      setCategories(await api.getCategories())
    } catch (err) {
      setError(getErrorMessage(err, "データ取得に失敗"))
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreate = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    try {
      await api.createCategory({ name })
      setName("")
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, "作成に失敗"))
    }
  }

  const confirmDelete = (c: CategoryResponse) => {
    setDeleteTarget(c)
    openDialog()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setError("")
    try {
      await api.deleteCategory(deleteTarget.uuid)
      setDeleteTarget(null)
      dialogRef.current?.close()
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed"))
    }
  }

  const startEdit = (c: CategoryResponse) => {
    setEditing({ uuid: c.uuid, name: c.name })
    requestAnimationFrame(() => editInputRef.current?.focus())
  }

  const handleUpdate = async () => {
    if (!editing) return
    setError("")
    try {
      await api.updateCategory(editing.uuid, { name: editing.name })
      setEditing(null)
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, "更新に失敗"))
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {/* 作成フォーム */}
      <form
        onSubmit={handleCreate}
        className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800"
      >
        <input
          id="category-name"
          type="text"
          placeholder="Food, Transport"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={50}
          className="flex-1 rounded-xl bg-gray-50 px-4 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
        />
        <button
          type="submit"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover"
        >
          <PlusIcon className="size-4" />
        </button>
      </form>

      {/* カテゴリ一覧 */}
      {categories.length > 0 ? (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-gray-700 dark:bg-gray-800">
          {categories.map((c) => (
            <div key={c.uuid} className="flex items-center gap-3 px-5 py-3.5">
              {editing?.uuid === c.uuid ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editing?.name ?? ""}
                    onChange={(e) =>
                      setEditing((prev) => (prev ? { ...prev, name: e.target.value } : null))
                    }
                    maxLength={50}
                    className="flex-1 rounded-lg bg-gray-50 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="text-primary hover:text-primary-hover"
                  >
                    <CheckIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <ResetIcon className="size-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <Pencil1Icon className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(c)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <TrashIcon className="size-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No categories</p>
      )}

      <ConfirmDialog
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        dialogRef={dialogRef}
      />
    </div>
  )
}
