import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { api } from "../lib/api"

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")

  // 作成フォーム
  const [name, setName] = useState("")

  // 編集
  const [editingUuid, setEditingUuid] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

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
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          追加
        </button>
      </form>

      {/* カテゴリ一覧 */}
      <ul className="flex flex-col gap-2">
        {categories.map((c) => (
          <li
            key={c.uuid}
            className="flex items-center gap-3 rounded border p-3"
          >
            {editingUuid === c.uuid ? (
              <div className="flex flex-1 gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 rounded border px-2 py-1"
                />
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="text-sm text-blue-600 hover:underline"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUuid(null)}
                  className="text-sm text-gray-500 hover:underline"
                >
                  取消
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1">{c.name}</span>
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.uuid)}
                  className="text-sm text-red-600 hover:underline"
                >
                  削除
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
