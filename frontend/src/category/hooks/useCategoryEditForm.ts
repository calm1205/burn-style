import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import { DEFAULT_GLYPH } from "../components/CategoryGlyphPicker"

/** カテゴリの新規/編集フォーム state とハンドラ。 */
export const useCategoryEditForm = (uuid: string | undefined) => {
  const navigate = useNavigate()
  const isNew = !uuid

  const [name, setName] = useState("")
  const [glyph, setGlyph] = useState(DEFAULT_GLYPH)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [usage, setUsage] = useState(0)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const fetchCategoryEditInitialState = useCallback(async () => {
    if (!uuid) return
    try {
      const [loadedCategories, loadedExpenses] = await Promise.all([
        api.getCategories(),
        api.getExpenses(),
      ])
      const category = loadedCategories.find((x) => x.uuid === uuid)
      if (category) {
        setName(category.name)
        setGlyph(category.symbol ?? DEFAULT_GLYPH)
      }
      setUsage(loadedExpenses.filter((e) => e.category?.uuid === uuid).length)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load"))
    }
  }, [uuid])

  useEffect(() => {
    fetchCategoryEditInitialState()
  }, [fetchCategoryEditInitialState])

  const trimmed = name.trim()
  const canSave = trimmed.length > 0 && glyph.length > 0

  const saveCategory = async () => {
    if (!canSave) return
    setError("")
    setLoading(true)
    try {
      if (isNew) {
        await api.createCategory({ name: trimmed, symbol: glyph })
      } else if (uuid) {
        await api.updateCategory(uuid, { name: trimmed, symbol: glyph })
      }
      navigate("/category")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save"))
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async () => {
    if (!uuid) return
    setError("")
    setLoading(true)
    try {
      await api.deleteCategory(uuid)
      navigate("/category")
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed"))
      setLoading(false)
    }
  }

  return {
    isNew,
    name,
    setName,
    glyph,
    setGlyph,
    error,
    loading,
    trimmed,
    canSave,
    usage,
    confirmingDelete,
    setConfirmingDelete,
    saveCategory,
    deleteCategory,
  }
}
