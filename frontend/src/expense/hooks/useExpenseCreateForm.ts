import { type SubmitEvent, useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type {
  CategoryResponse,
  VibeNecessity,
  VibePlanning,
  VibeSocial,
} from "../../common/libs/types"
import { toLocalDatetime } from "../libs/datetime"

interface FormState {
  name: string
  amount: string
  expensedAt: string
  categoryUuid: string | null
  vibeSocial: VibeSocial | null
  vibePlanning: VibePlanning | null
  vibeNecessity: VibeNecessity | null
}

/** 新規 expense 作成フォームの state とハンドラ。 */
export const useExpenseCreateForm = () => {
  const navigate = useNavigate()
  const amountRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormState>(() => ({
    name: "",
    amount: "",
    expensedAt: toLocalDatetime(new Date().toISOString()),
    categoryUuid: null,
    vibeSocial: "SOLO",
    vibePlanning: "ROUTINE",
    vibeNecessity: "NEEDED",
  }))

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const fetchData = useCallback(async () => {
    try {
      setCategories(await api.getCategories())
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [])

  useEffect(() => {
    fetchData()
    amountRef.current?.focus()
  }, [fetchData])

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.createExpense({
        name: form.name,
        amount: Number(form.amount.replace(/,/g, "")),
        expensed_at: new Date(form.expensedAt).toISOString(),
        category_uuid: form.categoryUuid,
        vibe_social: form.vibeSocial,
        vibe_planning: form.vibePlanning,
        vibe_necessity: form.vibeNecessity,
      })
      navigate("/")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create"))
    } finally {
      setLoading(false)
    }
  }

  return { amountRef, categories, error, loading, form, update, handleSubmit }
}
