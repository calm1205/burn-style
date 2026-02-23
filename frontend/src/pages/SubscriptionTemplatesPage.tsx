import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { api } from "../lib/api"

export const SubscriptionTemplatesPage = () => {
  const [templates, setTemplates] = useState<SubscriptionTemplate[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  // 作成フォーム
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [categoryUuid, setCategoryUuid] = useState("")

  // 編集
  const [editingUuid, setEditingUuid] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editCategoryUuid, setEditCategoryUuid] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const [t, c] = await Promise.all([
        api.getSubscriptionTemplates(),
        api.getCategories(),
      ])
      setTemplates(t)
      setCategories(c)
      setCategoryUuid((prev) => prev || (c.length > 0 ? c[0].uuid : ""))
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
      await api.createSubscriptionTemplate({
        name,
        amount: Number(amount),
        category_uuid: categoryUuid,
      })
      setName("")
      setAmount("")
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗")
    }
  }

  const handleDelete = async (uuid: string) => {
    setError("")
    try {
      await api.deleteSubscriptionTemplate(uuid)
      setSelectedUuids((prev) => {
        const next = new Set(prev)
        next.delete(uuid)
        return next
      })
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗")
    }
  }

  const startEdit = (t: SubscriptionTemplate) => {
    setEditingUuid(t.uuid)
    setEditName(t.name)
    setEditAmount(String(t.amount))
    setEditCategoryUuid(t.category.uuid)
  }

  const handleUpdate = async () => {
    if (!editingUuid) return
    setError("")
    try {
      await api.updateSubscriptionTemplate(editingUuid, {
        name: editName,
        amount: Number(editAmount),
        category_uuid: editCategoryUuid,
      })
      setEditingUuid(null)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗")
    }
  }

  const toggleSelect = (uuid: string) => {
    setSelectedUuids((prev) => {
      const next = new Set(prev)
      if (next.has(uuid)) {
        next.delete(uuid)
      } else {
        next.add(uuid)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedUuids.size === templates.length) {
      setSelectedUuids(new Set())
    } else {
      setSelectedUuids(new Set(templates.map((t) => t.uuid)))
    }
  }

  const handleBulkRecord = async () => {
    if (selectedUuids.size === 0) return
    setError("")
    setMessage("")
    setLoading(true)
    try {
      const result = await api.bulkRecord([...selectedUuids])
      setMessage(result.message)
      setSelectedUuids(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : "記帳に失敗")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">サブスクリプション</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

      {/* 作成フォーム */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 rounded border px-3 py-2"
        />
        <input
          type="number"
          placeholder="金額"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min={1}
          className="w-28 rounded border px-3 py-2"
        />
        <select
          value={categoryUuid}
          onChange={(e) => setCategoryUuid(e.target.value)}
          className="rounded border px-3 py-2"
        >
          {categories.map((c) => (
            <option key={c.uuid} value={c.uuid}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          追加
        </button>
      </form>

      {/* 一括記帳 */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBulkRecord}
          disabled={selectedUuids.size === 0 || loading}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "記帳中..." : `今月分を記帳 (${selectedUuids.size}件)`}
        </button>
        {templates.length > 0 && (
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={selectedUuids.size === templates.length}
              onChange={toggleSelectAll}
            />
            すべて選択
          </label>
        )}
      </div>

      {/* テンプレート一覧 */}
      <ul className="flex flex-col gap-2">
        {templates.map((t) => (
          <li
            key={t.uuid}
            className="flex items-center gap-3 rounded border p-3"
          >
            <input
              type="checkbox"
              checked={selectedUuids.has(t.uuid)}
              onChange={() => toggleSelect(t.uuid)}
            />

            {editingUuid === t.uuid ? (
              <div className="flex flex-1 gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 rounded border px-2 py-1"
                />
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  min={1}
                  className="w-24 rounded border px-2 py-1"
                />
                <select
                  value={editCategoryUuid}
                  onChange={(e) => setEditCategoryUuid(e.target.value)}
                  className="rounded border px-2 py-1"
                >
                  {categories.map((c) => (
                    <option key={c.uuid} value={c.uuid}>
                      {c.name}
                    </option>
                  ))}
                </select>
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
                <span className="flex-1">
                  {t.name}
                  <span className="ml-2 text-sm text-gray-500">
                    {t.category.name}
                  </span>
                </span>
                <span className="font-mono">{t.amount.toLocaleString()}円</span>
                <button
                  type="button"
                  onClick={() => startEdit(t)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t.uuid)}
                  className="text-sm text-red-600 hover:underline"
                >
                  削除
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {templates.length === 0 && (
        <p className="text-center text-gray-500">テンプレートがありません</p>
      )}
    </div>
  )
}
