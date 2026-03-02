import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { CategoryResponse } from "../lib/types"

export const ExpensesPage = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")

  // 作成フォーム
  const [form, setForm] = useState({
    name: "",
    amount: "",
    categoryUuids: new Set<string>(),
  })

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

  const toggleCategory = (uuid: string) => {
    setForm((prev) => {
      const next = new Set(prev.categoryUuids)
      if (next.has(uuid)) {
        next.delete(uuid)
      } else {
        next.add(uuid)
      }
      return { ...prev, categoryUuids: next }
    })
  }

  const handleCreate = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    try {
      await api.createExpense({
        name: form.name,
        amount: Number(form.amount),
        category_uuids: [...form.categoryUuids],
      })
      setForm({ name: "", amount: "", categoryUuids: new Set() })
    } catch (err) {
      setError(getErrorMessage(err, "作成に失敗"))
    }
  }

  return (
    <div
      className="mx-auto flex max-w-2xl flex-col items-stretch gap-12 px-6"
      style={{ paddingTop: "20vh" }}
    >
      <h1 className="text-center text-2xl font-bold">記帳</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <form
        id="expense-form"
        onSubmit={handleCreate}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="expense-name" className="text-xs text-gray-500">
            名前
          </label>
          <input
            id="expense-name"
            type="text"
            placeholder="例: ランチ"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            maxLength={100}
            className="border-b border-gray-200 px-4 py-3 text-sm placeholder:text-gray-200 focus:border-gray-900 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="expense-amount" className="text-xs text-gray-500">
            金額
          </label>
          <input
            id="expense-amount"
            type="number"
            placeholder="例: 1000"
            value={form.amount}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, amount: e.target.value }))
            }
            required
            min={1}
            max={99999999}
            className="border-b border-gray-200 px-4 py-3 text-sm placeholder:text-gray-200 focus:border-gray-900 focus:outline-none"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-500">カテゴリ</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.uuid}
                  type="button"
                  onClick={() => toggleCategory(c.uuid)}
                  className={`rounded-sm px-4 py-2 text-sm ${
                    form.categoryUuids.has(c.uuid)
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
      <button
        type="submit"
        form="expense-form"
        className="rounded bg-black px-5 py-4 text-white hover:bg-gray-800"
      >
        追加
      </button>
    </div>
  )
}
