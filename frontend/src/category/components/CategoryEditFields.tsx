import type { useCategoryEditForm } from "../hooks/useCategoryEditForm"
import { CategoryGlyphPicker } from "./CategoryGlyphPicker"

interface CategoryEditFieldsProps {
  form: ReturnType<typeof useCategoryEditForm>
}

export const CategoryEditFields = ({ form: f }: CategoryEditFieldsProps) => {
  return (
    <div className="flex-1 overflow-y-auto px-5 pt-5 pb-10">
      <div className="flex justify-center py-5">
        <div className="flex size-21 items-center justify-center rounded-3xl border border-gray-200 bg-white text-4xl font-bold dark:border-gray-700 dark:bg-gray-800">
          {f.glyph || "·"}
        </div>
      </div>
      <div className="mb-6 text-center text-sm font-semibold">{f.trimmed || "Untitled"}</div>

      <div className="mb-2 text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
        Name
      </div>
      <input
        type="text"
        value={f.name}
        onChange={(e) => f.setName(e.target.value)}
        placeholder="e.g. Coffee"
        maxLength={50}
        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-base outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />

      <CategoryGlyphPicker glyph={f.glyph} onChange={f.setGlyph} />

      {!f.isNew && (
        <button
          type="button"
          onClick={() => f.setConfirmingDelete(true)}
          disabled={f.loading}
          className="mt-8 w-full rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400"
        >
          Delete category
        </button>
      )}
    </div>
  )
}
