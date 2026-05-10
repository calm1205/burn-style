import type { CategoryResponse } from "../../common/libs/types"

interface CategoryDeleteModalProps {
  category: CategoryResponse
  used: number
  loading: boolean
  onDelete: () => void
  onClose: () => void
}

export const CategoryDeleteModal = ({
  category,
  used,
  loading,
  onDelete,
  onClose,
}: CategoryDeleteModalProps) => {
  const subtitle =
    used > 0
      ? `${used} ${used === 1 ? "expense is" : "expenses are"} tagged with this — they'll become uncategorized.`
      : "No expenses use this category yet."

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 p-6">
      <div className="w-full max-w-xs rounded-2xl bg-white p-5 dark:bg-gray-800">
        <div className="text-base font-bold">Delete &quot;{category.name}&quot;?</div>
        <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
