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
import {
  ArrowRightIcon,
  CheckIcon,
  DragHandleDots2Icon,
  Pencil1Icon,
  PlusIcon,
  ResetIcon,
  TrashIcon,
} from "@radix-ui/react-icons"
import { type SubmitEvent, useCallback, useEffect, useRef, useState } from "react"

import { ConfirmDialog, useConfirmDialog } from "../../common/components/ConfirmDialog"
import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { CategoryResponse } from "../../common/libs/types"

interface SortableRowProps {
  category: CategoryResponse
  loading: boolean
  editing: { uuid: string; name: string } | null
  setEditing: (e: { uuid: string; name: string } | null) => void
  editInputRef: React.RefObject<HTMLInputElement | null>
  onUpdate: () => void
  onStartEdit: (c: CategoryResponse) => void
  merging: { source: CategoryResponse; targetUuid: string } | null
  setMerging: (m: { source: CategoryResponse; targetUuid: string } | null) => void
  onConfirmMerge: () => void
  onStartMerge: (c: CategoryResponse) => void
  onConfirmDelete: (c: CategoryResponse) => void
  categories: CategoryResponse[]
  reorderDisabled: boolean
}

const SortableRow = ({
  category: c,
  loading,
  editing,
  setEditing,
  editInputRef,
  onUpdate,
  onStartEdit,
  merging,
  setMerging,
  onConfirmMerge,
  onStartMerge,
  onConfirmDelete,
  categories,
  reorderDisabled,
}: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: c.uuid,
    disabled: reorderDisabled,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-gray-800"
    >
      {editing?.uuid === c.uuid ? (
        <div className="flex flex-1 items-center gap-2">
          <input
            ref={editInputRef}
            type="text"
            value={editing?.name ?? ""}
            onChange={(e) => setEditing(editing ? { ...editing, name: e.target.value } : null)}
            maxLength={50}
            className="flex-1 rounded-lg bg-gray-50 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
          />
          <button
            type="button"
            onClick={onUpdate}
            disabled={loading}
            className="text-primary hover:text-primary-hover disabled:opacity-50"
          >
            <CheckIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setEditing(null)}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <ResetIcon className="size-4" />
          </button>
        </div>
      ) : merging?.source.uuid === c.uuid ? (
        <div className="flex flex-1 items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">{c.name}</span>
          <ArrowRightIcon className="size-3.5 text-gray-400" />
          <select
            value={merging.targetUuid}
            onChange={(e) => setMerging({ ...merging, targetUuid: e.target.value })}
            className="flex-1 rounded-lg bg-gray-50 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
          >
            {categories
              .filter((x) => x.uuid !== c.uuid)
              .map((x) => (
                <option key={x.uuid} value={x.uuid}>
                  {x.name}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={onConfirmMerge}
            disabled={loading}
            className="text-primary hover:text-primary-hover disabled:opacity-50"
          >
            <CheckIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setMerging(null)}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <ResetIcon className="size-4" />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            {...attributes}
            {...listeners}
            disabled={reorderDisabled}
            aria-label="Reorder"
            className="cursor-grab touch-none text-gray-300 hover:text-gray-500 disabled:opacity-30 dark:text-gray-600 dark:hover:text-gray-400"
          >
            <DragHandleDots2Icon className="size-4" />
          </button>
          <span className="flex-1 text-sm">{c.name}</span>
          <button
            type="button"
            onClick={() => onStartEdit(c)}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <Pencil1Icon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onStartMerge(c)}
            disabled={loading || categories.length < 2}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <ArrowRightIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onConfirmDelete(c)}
            disabled={loading}
            className="text-red-400 hover:text-red-600 disabled:opacity-50"
          >
            <TrashIcon className="size-3.5" />
          </button>
        </>
      )}
    </div>
  )
}

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [editing, setEditing] = useState<{ uuid: string; name: string } | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null)
  const [merging, setMerging] = useState<{ source: CategoryResponse; targetUuid: string } | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const { dialogRef, open: openDialog } = useConfirmDialog()
  const { dialogRef: mergeDialogRef, open: openMergeDialog } = useConfirmDialog()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const fetchData = useCallback(async () => {
    try {
      setCategories(await api.getCategories())
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreate = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.createCategory({ name })
      setName("")
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create"))
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (c: CategoryResponse) => {
    setDeleteTarget(c)
    openDialog()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setError("")
    setLoading(true)
    try {
      await api.deleteCategory(deleteTarget.uuid)
      setDeleteTarget(null)
      dialogRef.current?.close()
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed"))
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (c: CategoryResponse) => {
    setEditing({ uuid: c.uuid, name: c.name })
    requestAnimationFrame(() => editInputRef.current?.focus())
  }

  const handleUpdate = async () => {
    if (!editing) return
    setError("")
    setLoading(true)
    try {
      await api.updateCategory(editing.uuid, { name: editing.name })
      setEditing(null)
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update"))
    } finally {
      setLoading(false)
    }
  }

  const startMerge = (c: CategoryResponse) => {
    const others = categories.filter((x) => x.uuid !== c.uuid)
    if (others.length === 0) {
      setError("Need at least one other category to merge into")
      return
    }
    setError("")
    setMerging({ source: c, targetUuid: others[0].uuid })
  }

  const confirmMerge = () => {
    if (!merging) return
    openMergeDialog()
  }

  const handleMerge = async () => {
    if (!merging) return
    setError("")
    setLoading(true)
    try {
      await api.mergeCategory(merging.source.uuid, { target_uuid: merging.targetUuid })
      mergeDialogRef.current?.close()
      setMerging(null)
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, "Merge failed"))
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex((c) => c.uuid === active.id)
    const newIndex = categories.findIndex((c) => c.uuid === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(categories, oldIndex, newIndex)
    // optimistic UI
    setCategories(reordered)
    setError("")
    try {
      await api.reorderCategories({ uuids: reordered.map((c) => c.uuid) })
    } catch (err) {
      setError(getErrorMessage(err, "Reorder failed"))
      await fetchData()
    }
  }

  const mergeTarget = merging
    ? (categories.find((c) => c.uuid === merging.targetUuid) ?? null)
    : null

  const reorderDisabled = loading || editing !== null || merging !== null

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 pb-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800"
      >
        <input
          id="category-name"
          type="text"
          placeholder="Food, Transport"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={50}
          className="flex-1 rounded-xl bg-gray-50 px-4 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
        >
          <PlusIcon className="size-4" />
        </button>
      </form>

      {/* Category list */}
      {categories.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={categories.map((c) => c.uuid)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-gray-700 dark:bg-gray-800">
              {categories.map((c) => (
                <SortableRow
                  key={c.uuid}
                  category={c}
                  loading={loading}
                  editing={editing}
                  setEditing={setEditing}
                  editInputRef={editInputRef}
                  onUpdate={handleUpdate}
                  onStartEdit={startEdit}
                  merging={merging}
                  setMerging={setMerging}
                  onConfirmMerge={confirmMerge}
                  onStartMerge={startMerge}
                  onConfirmDelete={confirmDelete}
                  categories={categories}
                  reorderDisabled={reorderDisabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">No categories</p>
      )}

      <ConfirmDialog
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        loading={loading}
        dialogRef={dialogRef}
      />

      <ConfirmDialog
        message={`Merge "${merging?.source.name}" into "${mergeTarget?.name}"? "${merging?.source.name}" will be deleted.`}
        onConfirm={handleMerge}
        confirmText="Merge"
        loading={loading}
        dialogRef={mergeDialogRef}
      />
    </div>
  )
}
