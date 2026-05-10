import { categoryGlyph } from "../../common/libs/category"
import type { CategoryResponse } from "../../common/libs/types"

interface FilterSheetCategorySectionProps {
  categories: CategoryResponse[]
  selectedUuids: string[]
  onToggle: (uuid: string) => void
  onClear: () => void
}

export const FilterSheetCategorySection = ({
  categories,
  selectedUuids,
  onToggle,
  onClear,
}: FilterSheetCategorySectionProps) => {
  if (categories.length === 0) return null

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          Categories
        </h3>
        {selectedUuids.length > 0 && (
          <button type="button" onClick={onClear} className="text-[11px] text-gray-400">
            clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const on = selectedUuids.includes(c.uuid)
          return (
            <button
              key={c.uuid}
              type="button"
              onClick={() => onToggle(c.uuid)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                on
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              <span>{categoryGlyph(c)}</span>
              <span>{c.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
