import { type DragEndEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { useCallback, useEffect, useMemo, useState } from "react"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"

/** カテゴリ一覧のデータ取得・並び替え・統合・削除をまとめて管理。 */
export const useCategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mergingFrom, setMergingFrom] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [cats, exps] = await Promise.all([api.getCategories(), api.getExpenses()])
      setCategories(cats)
      setExpenses(exps)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const usage = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of expenses) {
      for (const c of e.categories) {
        map[c.uuid] = (map[c.uuid] ?? 0) + 1
      }
    }
    return map
  }, [expenses])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex((c) => c.uuid === active.id)
    const newIndex = categories.findIndex((c) => c.uuid === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(categories, oldIndex, newIndex)
    setCategories(reordered)
    setError("")
    try {
      await api.reorderCategories({ uuids: reordered.map((c) => c.uuid) })
    } catch (err) {
      setError(getErrorMessage(err, "Reorder failed"))
      await fetchData()
    }
  }

  const handleMerge = async (targetUuid: string) => {
    if (!mergingFrom) return
    setError("")
    setLoading(true)
    try {
      await api.mergeCategory(mergingFrom, { target_uuid: targetUuid })
      setMergingFrom(null)
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, "Merge failed"))
    } finally {
      setLoading(false)
    }
  }

  const mergingCategory = mergingFrom
    ? (categories.find((c) => c.uuid === mergingFrom) ?? null)
    : null

  return {
    categories,
    usage,
    error,
    loading,
    mergingCategory,
    mergingFrom,
    setMergingFrom,
    handleDragEnd,
    handleMerge,
  }
}
