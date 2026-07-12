import { ChevronDownIcon, ChevronUpIcon } from "../../common/icons"
import { categoryGlyph } from "../../common/libs/category"
import type { CategoryResponse } from "../../common/libs/types"

interface CategoryRowProps {
  category: CategoryResponse
  used: number
  onEdit: () => void
  onMerge: () => void
  mergeDisabled: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  moveUpDisabled: boolean
  moveDownDisabled: boolean
}

export const CategoryRow = ({
  category: c,
  used,
  onEdit,
  onMerge,
  mergeDisabled,
  onMoveUp,
  onMoveDown,
  moveUpDisabled,
  moveDownDisabled,
}: CategoryRowProps) => {
  return (
    <li className="flex items-center gap-3 bg-white px-3.5 py-3 dark:bg-gray-800">
      <div className="flex flex-col">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={moveUpDisabled}
          aria-label="Move up"
          className="p-0.5 text-gray-400 disabled:text-gray-200 dark:text-gray-500 dark:disabled:text-gray-700"
        >
          <ChevronUpIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={moveDownDisabled}
          aria-label="Move down"
          className="p-0.5 text-gray-400 disabled:text-gray-200 dark:text-gray-500 dark:disabled:text-gray-700"
        >
          <ChevronDownIcon className="size-4" />
        </button>
      </div>
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
    </li>
  )
}
