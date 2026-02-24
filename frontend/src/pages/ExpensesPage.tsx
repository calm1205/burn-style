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
      <h1 className="mb-6 text-2xl font-bold">記帳</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleCreate} className="space-y-3">
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
    </div>
  )
}
