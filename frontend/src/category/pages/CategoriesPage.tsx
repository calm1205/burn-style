import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DragHandleDots2Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"

import { api } from "../../common/libs/api"
import { categoryGlyph } from "../../common/libs/category"
import { getErrorMessage } from "../../common/libs/client"
import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"

interface SortableRowProps {
  category: CategoryResponse
  used: number
  onEdit: () => void
  onMerge: () => void
  onDelete: () => void
  mergeDisabled: boolean
}

const SortableRow = ({
  category: c,
  used,
  onEdit,
  onMerge,
  onDelete,
  mergeDisabled,
}: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: c.uuid,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-white px-3.5 py-3 dark:bg-gray-800"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Reorder"
        className="cursor-grab touch-none p-1 text-gray-400 dark:text-gray-500"
      >
        <DragHandleDots2Icon className="size-4" />
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-base font-bold dark:bg-gray-700">
          {categoryGlyph(c)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{c.name}</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            {used} {used === 1 ? "expense" : "expenses"}
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={onMerge}
        disabled={mergeDisabled}
        aria-label="Merge into another"
        className="p-1 text-base text-gray-400 disabled:text-gray-200 dark:text-gray-500 dark:disabled:text-gray-700"
      >
        ⇄
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete"
        className="p-1 text-red-400 hover:text-red-600"
      >
        <TrashIcon className="size-4" />
      </button>
    </li>
  )
}

export const CategoriesPage = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [mergingFrom, setMergingFrom] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

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

  const handleDelete = async () => {
    if (!confirmDel) return
    setError("")
    setLoading(true)
    try {
      await api.deleteCategory(confirmDel)
      setConfirmDel(null)
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed"))
    } finally {
      setLoading(false)
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
  const confirmCategory = confirmDel
    ? (categories.find((c) => c.uuid === confirmDel) ?? null)
    : null

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between px-4 pt-3 pb-2">
        <div className="w-10" />
        <h1 className="text-base font-semibold">Categories</h1>
        <button
          type="button"
          aria-label="New category"
          onClick={() => navigate("/category/new")}
          className="flex w-10 items-center justify-end text-2xl leading-none text-primary"
        >
          +
        </button>
      </div>
      <p className="shrink-0 px-5 pb-3 text-xs text-gray-500 dark:text-gray-400">
        {categories.length} categories · drag to reorder, tap to edit
      </p>

      {error && (
        <p className="mx-5 shrink-0 pb-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {categories.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            No categories yet
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.uuid)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
                {categories.map((c) => (
                  <SortableRow
                    key={c.uuid}
                    category={c}
                    used={usage[c.uuid] ?? 0}
                    onEdit={() => navigate(`/category/${c.uuid}`)}
                    onMerge={() => setMergingFrom(c.uuid)}
                    onDelete={() => setConfirmDel(c.uuid)}
                    mergeDisabled={categories.length < 2}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}

        <button
          type="button"
          onClick={() => navigate("/category/new")}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-gray-300 bg-white py-3.5 text-sm font-semibold text-primary dark:border-gray-700 dark:bg-gray-800"
        >
          <PlusIcon className="size-4" />
          New category
        </button>
      </div>

      {mergingCategory && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 p-6">
          <div className="flex max-h-[70%] w-full max-w-sm flex-col rounded-2xl bg-white p-5 dark:bg-gray-800">
            <div className="text-base font-bold">
              Merge &quot;{mergingCategory.name}&quot; into…
            </div>
            <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {(usage[mergingCategory.uuid] ?? 0) > 0
                ? `${usage[mergingCategory.uuid]} ${usage[mergingCategory.uuid] === 1 ? "expense" : "expenses"} will be re-tagged. "${mergingCategory.name}" will then be removed.`
                : `"${mergingCategory.name}" will be removed.`}
            </div>
            <div className="-mx-2 mt-3 flex-1 overflow-y-auto">
              {categories
                .filter((c) => c.uuid !== mergingFrom)
                .map((tc) => (
                  <button
                    key={tc.uuid}
                    type="button"
                    disabled={loading}
                    onClick={() => handleMerge(tc.uuid)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm dark:bg-gray-700">
                      {categoryGlyph(tc)}
                    </span>
                    <span className="flex-1 text-sm font-semibold">{tc.name}</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {usage[tc.uuid] ?? 0}
                    </span>
                  </button>
                ))}
            </div>
            <button
              type="button"
              onClick={() => setMergingFrom(null)}
              className="mt-3 rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {confirmCategory && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 p-6">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 dark:bg-gray-800">
            <div className="text-base font-bold">Delete &quot;{confirmCategory.name}&quot;?</div>
            <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {(usage[confirmCategory.uuid] ?? 0) > 0
                ? `${usage[confirmCategory.uuid]} ${usage[confirmCategory.uuid] === 1 ? "expense is" : "expenses are"} tagged with this — they'll become uncategorized.`
                : "No expenses use this category yet."}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDel(null)}
                className="flex-1 rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
