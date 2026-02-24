import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { api } from "../lib/api"
import type { CategoryResponse, ExpenseResponse } from "../lib/types"

export const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")

  // 作成フォーム
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedCategoryUuids, setSelectedCategoryUuids] = useState<
    Set<string>
  >(new Set())

  // 編集
  const [editingUuid, setEditingUuid] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editCategoryUuids, setEditCategoryUuids] = useState<Set<string>>(
    new Set(),
  )

  const fetchData = useCallback(async () => {
    try {
      const [e, c] = await Promise.all([api.getExpenses(), api.getCategories()])
      setExpenses(e)
      setCategories(c)
    } catch (err) {
      setError(err instanceof Error ? err.message : "データ取得に失敗")
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleCategory = (uuid: string) => {
    setSelectedCategoryUuids((prev) => {
      const next = new Set(prev)
      if (next.has(uuid)) {
        next.delete(uuid)
      } else {
        next.add(uuid)
      }
      return next
    })
  }

  const toggleEditCategory = (uuid: string) => {
    setEditCategoryUuids((prev) => {
      const next = new Set(prev)
      if (next.has(uuid)) {
        next.delete(uuid)
      } else {
        next.add(uuid)
      }
      return next
    })
  }

  const handleCreate = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    try {
      await api.createExpense({
        name,
        amount: Number(amount),
        category_uuids: [...selectedCategoryUuids],
      })
      setName("")
      setAmount("")
      setSelectedCategoryUuids(new Set())
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗")
    }
  }

  const handleDelete = async (uuid: string) => {
    setError("")
    try {
      await api.deleteExpense(uuid)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗")
    }
  }

  const startEdit = (expense: ExpenseResponse) => {
    setEditingUuid(expense.uuid)
    setEditName(expense.name)
    setEditAmount(String(expense.amount))
    setEditCategoryUuids(new Set(expense.categories.map((c) => c.uuid)))
  }

  const handleUpdate = async () => {
    if (!editingUuid) return
    setError("")
    try {
      await api.updateExpense(editingUuid, {
        name: editName,
        amount: Number(editAmount),
        category_uuids: [...editCategoryUuids],
      })
      setEditingUuid(null)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗")
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">記帳</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* 作成フォーム */}
      <form onSubmit={handleCreate} className="mb-6 space-y-3">
        <div className="flex gap-2">
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
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            追加
          </button>
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <label key={c.uuid} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategoryUuids.has(c.uuid)}
                  onChange={() => toggleCategory(c.uuid)}
                />
                {c.name}
              </label>
            ))}
          </div>
        )}
      </form>

      {/* 支出一覧 */}
      <ul className="flex flex-col gap-2">
        {expenses.map((expense) => (
          <li
            key={expense.uuid}
            className="flex items-center gap-3 rounded border p-3"
          >
            {editingUuid === expense.uuid ? (
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
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
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <label
                      key={c.uuid}
                      className="flex items-center gap-1 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={editCategoryUuids.has(c.uuid)}
                        onChange={() => toggleEditCategory(c.uuid)}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <span className="flex-1">
                  {expense.name}
                  {expense.categories.length > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      {expense.categories.map((c) => c.name).join(", ")}
                    </span>
                  )}
                </span>
                <span className="font-mono">
                  {expense.amount.toLocaleString()}円
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(expense)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(expense.uuid)}
                  className="text-sm text-red-600 hover:underline"
                >
                  削除
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {expenses.length === 0 && (
        <p className="text-center text-gray-500">支出がありません</p>
      )}
    </div>
  )
}
