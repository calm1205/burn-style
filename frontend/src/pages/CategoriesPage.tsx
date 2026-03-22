import {
  BookmarkIcon,
  CheckIcon,
  Pencil1Icon,
  PlusIcon,
  ResetIcon,
  TrashIcon,
} from "@radix-ui/react-icons"
import {
  type SubmitEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { ConfirmDialog, useConfirmDialog } from "../components/ConfirmDialog"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { CategoryResponse } from "../lib/types"

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")

  // 作成フォーム
  const [name, setName] = useState("")

  // 編集
  const [editing, setEditing] = useState<{ uuid: string; name: string } | null>(
    null,
  )
  const editInputRef = useRef<HTMLInputElement>(null)

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

  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(
    null,
  )
  const { dialogRef, open: openDialog } = useConfirmDialog()

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
    <div className="mx-auto max-w-2xl px-6" style={{ paddingTop: "20vh" }}>
      <h1 className="mb-6 text-2xl font-bold text-center">Category</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* 作成フォーム */}
      <form onSubmit={handleCreate} className="mb-6 flex items-end gap-2">
        <div className="flex-1">
          <label
            htmlFor="category-name"
            className="mb-1 block text-xs text-gray-500"
          >
            Name
          </label>
          <input
            id="category-name"
            type="text"
            placeholder="e.g. Food, Transport"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            className="w-full border-b border-gray-300 px-1 py-2 text-sm outline-none placeholder:text-gray-300 focus:border-gray-900"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-black px-3 py-2 text-white hover:bg-gray-800"
        >
          <PlusIcon className="size-4" />
        </button>
      </form>

      {/* カテゴリ一覧 */}
      <ul className="flex flex-col">
        {categories.map((c) => (
          <li
            key={c.uuid}
            className={`flex items-center gap-3 border-b py-3 ${
              editing?.uuid === c.uuid ? "border-blue-600" : "border-gray-100"
            }`}
          >
            <BookmarkIcon
              className={`size-3.5 shrink-0 ${
                editing?.uuid === c.uuid ? "text-blue-600" : "text-gray-400"
              }`}
            />
            {editing?.uuid === c.uuid ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editing?.name ?? ""}
                  onChange={(e) =>
                    setEditing((prev) =>
                      prev ? { ...prev, name: e.target.value } : null,
                    )
                  }
                  maxLength={50}
                  className="flex-1 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <CheckIcon className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ResetIcon className="size-3.5" />
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-sm">{c.name}</span>
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="text-gray-400 hover:text-gray-600"
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
          </li>
        ))}
      </ul>

      {categories.length === 0 && (
        <p className="text-center text-gray-500">No categories</p>
      )}

      <ConfirmDialog
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        dialogRef={dialogRef}
      />
    </div>
  )
}
