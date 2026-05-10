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

/** 新規 expense 作成フォームの state とハンドラ。 */
export const useExpenseCreateForm = () => {
  const navigate = useNavigate()
  const nameRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [categoryUuid, setCategoryUuid] = useState<string | null>(null)
  const [vibeSocial, setVibeSocial] = useState<VibeSocial | null>(null)
  const [vibePlanning, setVibePlanning] = useState<VibePlanning | null>(null)
  const [vibeNecessity, setVibeNecessity] = useState<VibeNecessity | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setCategories(await api.getCategories())
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [])

  useEffect(() => {
    fetchData()
    nameRef.current?.focus()
  }, [fetchData])

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.createExpense({
        name,
        amount: Number(amount.replace(/,/g, "")),
        expensed_at: new Date().toISOString(),
        category_uuid: categoryUuid,
        vibe_social: vibeSocial,
        vibe_planning: vibePlanning,
        vibe_necessity: vibeNecessity,
      })
      navigate("/expense/monthly")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create"))
    } finally {
      setLoading(false)
    }
  }

  return {
    nameRef,
    categories,
    error,
    loading,
    name,
    setName,
    amount,
    setAmount,
    categoryUuid,
    setCategoryUuid,
    vibeSocial,
    setVibeSocial,
    vibePlanning,
    setVibePlanning,
    vibeNecessity,
    setVibeNecessity,
    handleSubmit,
  }
}
