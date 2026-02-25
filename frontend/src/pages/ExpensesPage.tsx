import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { api } from "../lib/api"
import type { CategoryResponse } from "../lib/types"

export const ExpensesPage = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")

  // 作成フォーム
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedCategoryUuids, setSelectedCategoryUuids] = useState<
    Set<string>
  >(new Set())

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗")
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-8 text-2xl font-bold">記帳</h1>

      {error && <p className="mb-6 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleCreate} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="expense-name" className="text-sm text-gray-600">
            名前
          </label>
          <input
            id="expense-name"
            type="text"
            placeholder="例: ランチ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border-b border-gray-200 px-4 py-3 text-sm placeholder:text-gray-200 focus:border-gray-900 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="expense-amount" className="text-sm text-gray-600">
            金額
          </label>
          <input
            id="expense-amount"
            type="number"
            placeholder="例: 1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min={1}
            className="border-b border-gray-200 px-4 py-3 text-sm placeholder:text-gray-200 focus:border-gray-900 focus:outline-none"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-600">カテゴリ</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.uuid}
                  type="button"
                  onClick={() => toggleCategory(c.uuid)}
                  className={`rounded-sm px-4 py-2 text-sm ${
                    selectedCategoryUuids.has(c.uuid)
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
        <button
          type="submit"
          className="mt-2 rounded bg-blue-600 px-5 py-4 text-white hover:bg-blue-700"
        >
          追加
        </button>
      </form>
    </div>
  )
}
