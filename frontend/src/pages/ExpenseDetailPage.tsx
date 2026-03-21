import { ArrowLeftIcon } from "@radix-ui/react-icons"
import {
  type SubmitEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { useNavigate, useParams } from "react-router"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import type { CategoryResponse, ExpenseResponse } from "../lib/types"

const toLocalDatetime = (isoStr: string) => {
  const d = new Date(isoStr)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const ExpenseDetailPage = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()

  const [expense, setExpense] = useState<ExpenseResponse | null>(null)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    amount: "",
    expensedAt: "",
    categoryUuids: new Set<string>(),
  })

  const fetchData = useCallback(async () => {
    if (!uuid) return
    try {
      const [exp, cats] = await Promise.all([
        api.getExpense(uuid),
        api.getCategories(),
      ])
      setExpense(exp)
      setCategories(cats)
      setForm({
        name: exp.name,
        amount: String(exp.amount),
        expensedAt: toLocalDatetime(exp.expensed_at),
        categoryUuids: new Set(exp.categories.map((c) => c.uuid)),
      })
    } catch (err) {
      setError(getErrorMessage(err, "データ取得に失敗"))
    }
  }, [uuid])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleCategory = (catUuid: string) => {
    setForm((prev) => {
      const next = new Set(prev.categoryUuids)
      if (next.has(catUuid)) {
        next.delete(catUuid)
      } else {
        next.add(catUuid)
      }
      return { ...prev, categoryUuids: next }
    })
  }

  const handleUpdate = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!uuid) return
    setError("")
    try {
      await api.updateExpense(uuid, {
        name: form.name,
        amount: Number(form.amount),
        expensed_at: new Date(form.expensedAt).toISOString(),
        category_uuids: [...form.categoryUuids],
      })
      navigate(-1)
    } catch (err) {
      setError(getErrorMessage(err, "更新に失敗"))
    }
  }

  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleDelete = async () => {
    if (!uuid) return
    try {
      await api.deleteExpense(uuid)
      dialogRef.current?.close()
      navigate("/dashboard")
    } catch (err) {
      setError(getErrorMessage(err, "削除に失敗"))
    }
  }

  if (!expense && !error) {
    return null
  }

  return (
    <div
      className="mx-auto flex max-w-2xl flex-col items-stretch gap-12 px-6"
      style={{ paddingTop: "10vh" }}
    >
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-600"
        >
          <ArrowLeftIcon className="size-5" />
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <form
        id="expense-detail-form"
        onSubmit={handleUpdate}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="detail-name" className="text-xs text-gray-500">
            名前
          </label>
          <input
            id="detail-name"
            type="text"
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
          <label htmlFor="detail-amount" className="text-xs text-gray-500">
            金額
          </label>
          <input
            id="detail-amount"
            type="number"
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
        <div className="flex flex-col gap-2">
          <label htmlFor="detail-date" className="text-xs text-gray-500">
            日時
          </label>
          <input
            id="detail-date"
            type="datetime-local"
            value={form.expensedAt}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, expensedAt: e.target.value }))
            }
            required
            className="border-b border-gray-200 px-4 py-3 text-sm focus:border-gray-900 focus:outline-none"
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
      <div className="flex flex-col gap-5">
        <button
          type="submit"
          form="expense-detail-form"
          className="rounded bg-black px-5 py-4 text-white hover:bg-gray-800"
        >
          更新
        </button>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="rounded border border-red-600 px-5 py-4 text-red-600 hover:bg-red-50"
        >
          削除
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 backdrop:bg-black/50"
      >
        <p className="mb-6 text-sm">この支出を削除しますか?</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            削除
          </button>
        </div>
      </dialog>
    </div>
  )
}
