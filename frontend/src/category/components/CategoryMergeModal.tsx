import { categoryGlyph } from "../../common/libs/category"
import type { CategoryResponse } from "../../common/libs/types"

interface CategoryMergeModalProps {
  source: CategoryResponse
  candidates: CategoryResponse[]
  usage: Record<string, number>
  loading: boolean
  onMerge: (targetUuid: string) => void
  onClose: () => void
}

export const CategoryMergeModal = ({
  source,
  candidates,
  usage,
  loading,
  onMerge,
  onClose,
}: CategoryMergeModalProps) => {
  const sourceUsed = usage[source.uuid] ?? 0
  const subtitle =
    sourceUsed > 0
      ? `${sourceUsed} ${sourceUsed === 1 ? "expense" : "expenses"} will be re-tagged. "${source.name}" will then be removed.`
      : `"${source.name}" will be removed.`

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 p-6">
      <div className="flex max-h-[70%] w-full max-w-sm flex-col rounded-2xl bg-white p-5 dark:bg-gray-800">
        <div className="text-base font-bold">Merge &quot;{source.name}&quot; into…</div>
        <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
        <div className="-mx-2 mt-3 flex-1 overflow-y-auto">
          {candidates.map((tc) => (
            <button
              key={tc.uuid}
              type="button"
              disabled={loading}
              onClick={() => onMerge(tc.uuid)}
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
          onClick={onClose}
          className="mt-3 rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
