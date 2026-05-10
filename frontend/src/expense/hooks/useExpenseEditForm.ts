import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { useConfirmDialog } from "../../common/components/ConfirmDialog"
import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type {
  CategoryResponse,
  ExpenseResponse,
  VibeNecessity,
  VibePlanning,
  VibeSocial,
} from "../../common/libs/types"

const pad = (n: number) => String(n).padStart(2, "0")

const toLocalDatetime = (isoStr: string) => {
  const d = new Date(isoStr)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface FormState {
  name: string
  amount: string
  expensedAt: string
  categoryUuid: string | null
  vibeSocial: VibeSocial | null
  vibePlanning: VibePlanning | null
  vibeNecessity: VibeNecessity | null
}

const initialForm: FormState = {
  name: "",
  amount: "",
  expensedAt: "",
  categoryUuid: null,
  vibeSocial: null,
  vibePlanning: null,
  vibeNecessity: null,
}

/** 既存 expense の編集フォーム state とハンドラ。 */
export const useExpenseEditForm = (uuid: string | undefined) => {
  const navigate = useNavigate()
  const [expense, setExpense] = useState<ExpenseResponse | null>(null)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)
  const { dialogRef, open: openDeleteDialog } = useConfirmDialog()

  const fetchData = useCallback(async () => {
    if (!uuid) return
    try {
      const [exp, cats] = await Promise.all([api.getExpense(uuid), api.getCategories()])
      setExpense(exp)
      setCategories(cats)
      setForm({
        name: exp.name,
        amount: exp.amount.toLocaleString(),
        expensedAt: toLocalDatetime(exp.expensed_at),
        categoryUuid: exp.categories[0]?.uuid ?? null,
        vibeSocial: exp.vibe_social,
        vibePlanning: exp.vibe_planning,
        vibeNecessity: exp.vibe_necessity,
      })
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load"))
    }
  }, [uuid])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleUpdate = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!uuid) return
    setError("")
    setLoading(true)
    try {
      await api.updateExpense(uuid, {
        name: form.name,
        amount: Number(form.amount.replace(/,/g, "")),
        expensed_at: new Date(form.expensedAt).toISOString(),
        category_uuid: form.categoryUuid,
        vibe_social: form.vibeSocial,
        vibe_planning: form.vibePlanning,
        vibe_necessity: form.vibeNecessity,
      })
      navigate(-1)
    } catch (err) {
      setError(getErrorMessage(err, "Update failed"))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!uuid) return
    setLoading(true)
    try {
      await api.deleteExpense(uuid)
      dialogRef.current?.close()
      navigate("/expense/monthly")
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed"))
    } finally {
      setLoading(false)
    }
  }

  return {
    expense,
    categories,
    error,
    loading,
    form,
    update,
    dialogRef,
    openDeleteDialog,
    handleUpdate,
    handleDelete,
  }
}
