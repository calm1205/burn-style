import { useNavigate } from "react-router"

import { categoryGlyph } from "../../common/libs/category"
import type { CategoryResponse } from "../../common/libs/types"

interface ExpenseCategoryChipsProps {
  categories: CategoryResponse[]
  selectedUuid: string | null
  onSelect: (uuid: string | null) => void
  label?: string
}

export const ExpenseCategoryChips = ({
  categories,
  selectedUuid,
  onSelect,
  label,
}: ExpenseCategoryChipsProps) => {
  const navigate = useNavigate()
  if (categories.length === 0) return null

  return (
    <div className="px-5 pt-5">
      {label && (
        <div className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          {label}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = selectedUuid === c.uuid
          return (
            <button
              key={c.uuid}
              type="button"
              onClick={() => onSelect(active ? null : c.uuid)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              <span>{categoryGlyph(c)}</span>
              <span>{c.name}</span>
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => navigate("/category/new")}
          className="flex items-center rounded-xl border border-dashed border-gray-300 bg-transparent px-3 py-2 text-xs font-semibold text-gray-500 dark:border-gray-700 dark:text-gray-400"
        >
          + Category
        </button>
      </div>
    </div>
  )
}
