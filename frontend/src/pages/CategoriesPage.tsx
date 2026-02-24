import {
  CheckIcon,
  Pencil1Icon,
  PlusIcon,
  ResetIcon,
  TokensIcon,
  TrashIcon,
} from "@radix-ui/react-icons"
import {
  type SubmitEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { api } from "../lib/api"
import type { CategoryResponse } from "../lib/types"

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")

  // 作成フォーム
  const [name, setName] = useState("")

  // 編集
  const [editingUuid, setEditingUuid] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const editInputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    try {
      setCategories(await api.getCategories())
    } catch (err) {
      setError(err instanceof Error ? err.message : "データ取得に失敗")
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
      setError(err instanceof Error ? err.message : "作成に失敗")
    }
  }

  const handleDelete = async (uuid: string) => {
    setError("")
    try {
      await api.deleteCategory(uuid)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗")
    }
  }

  const startEdit = (c: CategoryResponse) => {
    setEditingUuid(c.uuid)
    setEditName(c.name)
    requestAnimationFrame(() => editInputRef.current?.focus())
  }

  const handleUpdate = async () => {
    if (!editingUuid) return
    setError("")
    try {
      await api.updateCategory(editingUuid, { name: editName })
      setEditingUuid(null)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗")
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">カテゴリ</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* 作成フォーム */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="カテゴリ名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 rounded border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-200"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
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
              editingUuid === c.uuid ? "border-blue-600" : "border-gray-100"
            }`}
          >
            <TokensIcon
              className={`size-3.5 shrink-0 ${
                editingUuid === c.uuid ? "text-blue-600" : "text-gray-400"
              }`}
            />
            {editingUuid === c.uuid ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
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
                  onClick={() => setEditingUuid(null)}
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
                  onClick={() => handleDelete(c.uuid)}
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
        <p className="text-center text-gray-500">カテゴリがありません</p>
      )}
    </div>
  )
}
