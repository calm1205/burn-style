import { categoryGlyph } from "../../common/libs/category"
import type { CategoryResponse } from "../../common/libs/types"

interface RecurringCategoryPickerProps {
  categories: CategoryResponse[]
  selectedUuid: string
  onChange: (uuid: string) => void
}

export const RecurringCategoryPicker = ({
  categories,
  selectedUuid,
  onChange,
}: RecurringCategoryPickerProps) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
    <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">Category</div>
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <button
          key={c.uuid}
          type="button"
          onClick={() => onChange(c.uuid)}
          className={`rounded-full px-4 py-2 text-sm transition-colors ${
            selectedUuid === c.uuid
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <span className="mr-1">{categoryGlyph(c)}</span>
          {c.name}
        </button>
      ))}
    </div>
    {categories.length === 0 && (
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        Create a category first from /category
      </p>
    )}
  </div>
)
