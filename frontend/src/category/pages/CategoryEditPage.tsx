import { useNavigate, useParams } from "react-router"

import { CategoryGlyphPicker } from "../components/CategoryGlyphPicker"
import { useCategoryEditForm } from "../hooks/useCategoryEditForm"

export const CategoryEditPage = () => {
  const navigate = useNavigate()
  const { uuid } = useParams<{ uuid: string }>()
  const f = useCategoryEditForm(uuid)

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between px-4 pt-3 pb-2">
        <button
          type="button"
          onClick={() => navigate("/category")}
          className="text-sm font-medium text-primary"
        >
          Cancel
        </button>
        <h1 className="text-base font-semibold">{f.isNew ? "New category" : "Edit category"}</h1>
        <button
          type="button"
          onClick={f.save}
          disabled={!f.canSave || f.loading}
          className="text-sm font-bold text-primary disabled:text-gray-300 dark:disabled:text-gray-600"
        >
          Save
        </button>
      </div>

      {f.error && (
        <p className="shrink-0 px-5 pb-2 text-sm text-red-600 dark:text-red-400">{f.error}</p>
      )}

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
      </div>
    </div>
  )
}
