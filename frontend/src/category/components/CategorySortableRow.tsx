import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DragHandleDots2Icon, TrashIcon } from "@radix-ui/react-icons"

import { categoryGlyph } from "../../common/libs/category"
import type { CategoryResponse } from "../../common/libs/types"

interface CategorySortableRowProps {
  category: CategoryResponse
  used: number
  onEdit: () => void
  onMerge: () => void
  onDelete: () => void
  mergeDisabled: boolean
}

export const CategorySortableRow = ({
  category: c,
  used,
  onEdit,
  onMerge,
  onDelete,
  mergeDisabled,
}: CategorySortableRowProps) => {
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
