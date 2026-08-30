import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { useConfirmDialog } from "../../common/components/ConfirmDialog"
import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"
import { toLocalDatetime } from "../libs/datetime"
import { emptyExpenseFormDraft, type ExpenseFormDraft } from "../libs/expenseFormDraft"

/** 既存 expense の編集フォーム state とハンドラ。 */
export const useExpenseEditForm = (uuid: string | undefined) => {
  const navigate = useNavigate()
  const [expense, setExpense] = useState<ExpenseResponse | null>(null)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ExpenseFormDraft>(emptyExpenseFormDraft)
  const { dialogRef, open: openDeleteDialog } = useConfirmDialog()

  const fetchExpenseEditInitialState = useCallback(async () => {
    if (!uuid) return
    try {
      const [loadedExpense, loadedCategories] = await Promise.all([
        api.getExpense(uuid),
        api.getCategories(),
      ])
      setExpense(loadedExpense)
      setCategories(loadedCategories)
      setForm({
        name: loadedExpense.name,
        amount: loadedExpense.amount.toLocaleString(),
        expensedAt: toLocalDatetime(loadedExpense.expensed_at),
        categoryUuid: loadedExpense.categories[0]?.uuid ?? null,
        vibeSocial: loadedExpense.vibe_social,
        vibePlanning: loadedExpense.vibe_planning,
        vibeNecessity: loadedExpense.vibe_necessity,
      })
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load"))
    }
  }, [uuid])

  useEffect(() => {
    fetchExpenseEditInitialState()
  }, [fetchExpenseEditInitialState])

  const updateDraftField = <K extends keyof ExpenseFormDraft>(
    key: K,
    value: ExpenseFormDraft[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateExpense = async (e: SubmitEvent<HTMLFormElement>) => {
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

  const deleteExpense = async () => {
    if (!uuid) return
    setLoading(true)
    try {
      await api.deleteExpense(uuid)
      dialogRef.current?.close()
      navigate("/")
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
    updateDraftField,
    dialogRef,
    openDeleteDialog,
    updateExpense,
    deleteExpense,
  }
}
