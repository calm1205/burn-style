import { type SubmitEvent, useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { useConfirmDialog } from "../../common/components/ConfirmDialog"
import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type {
  CategoryResponse,
  RecurringExpenseCreate,
  RecurringExpenseUpdate,
} from "../../common/libs/types"
import { FREQUENCY_OPTIONS, matchFrequency, todayJst } from "../libs/recurringFrequency"

/** 定期支払の新規/編集フォームの state とハンドラ。uuid 指定時は edit モード。 */
export const useRecurringExpenseForm = (uuid: string | undefined) => {
  const navigate = useNavigate()
  const isEdit = Boolean(uuid)

  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { dialogRef, open: openDeleteDialog } = useConfirmDialog()

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [frequencyKey, setFrequencyKey] = useState("monthly")
  const [startDate, setStartDate] = useState(todayJst)
  const [categoryUuid, setCategoryUuid] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const cats = await api.getCategories()
      setCategories(cats)
      if (uuid) {
        const r = await api.getRecurringExpense(uuid)
        setName(r.name)
        setAmount(r.amount.toLocaleString())
        setFrequencyKey(matchFrequency(r.interval_unit, r.interval_count))
        setStartDate(r.start_date)
        setCategoryUuid(r.category.uuid)
      } else if (cats.length > 0) {
        setCategoryUuid(cats[0].uuid)
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [uuid])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const freq = FREQUENCY_OPTIONS.find((f) => f.key === frequencyKey)
    if (!freq) {
      setError("Invalid frequency")
      setLoading(false)
      return
    }
    const payload = {
      name,
      amount: Number(amount.replace(/,/g, "")),
      interval_unit: freq.unit,
      interval_count: freq.count,
      start_date: startDate,
      category_uuid: categoryUuid,
    }
    try {
      if (isEdit && uuid) {
        await api.updateRecurringExpense(uuid, payload satisfies RecurringExpenseUpdate)
      } else {
        await api.createRecurringExpense(payload satisfies RecurringExpenseCreate)
      }
      navigate("/expense/recurring")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save"))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!uuid) return
    setError("")
    setLoading(true)
    try {
      await api.deleteRecurringExpense(uuid)
      dialogRef.current?.close()
      navigate("/expense/recurring")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete"))
    } finally {
      setLoading(false)
    }
  }

  return {
    isEdit,
    categories,
    error,
    loading,
    dialogRef,
    openDeleteDialog,
    name,
    setName,
    amount,
    setAmount,
    frequencyKey,
    setFrequencyKey,
    startDate,
    setStartDate,
    categoryUuid,
    setCategoryUuid,
    handleSubmit,
    handleDelete,
  }
}
