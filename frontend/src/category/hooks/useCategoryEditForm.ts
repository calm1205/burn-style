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

  const fetchExisting = useCallback(async () => {
    if (!uuid) return
    try {
      const cats = await api.getCategories()
      const c = cats.find((x) => x.uuid === uuid)
      if (c) {
        setName(c.name)
        setGlyph(c.symbol ?? DEFAULT_GLYPH)
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load"))
    }
  }, [uuid])

  useEffect(() => {
    fetchExisting()
  }, [fetchExisting])

  const trimmed = name.trim()
  const canSave = trimmed.length > 0 && glyph.length > 0

  const save = async () => {
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
    save,
  }
}
