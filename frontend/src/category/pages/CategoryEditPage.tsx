import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"

const CAT_GLYPHS = [
  "🍴",
  "🚇",
  "🏠",
  "🎬",
  "🛍️",
  "💼",
  "💊",
  "✨",
  "☕",
  "🍷",
  "🛒",
  "✈️",
  "📚",
  "🎵",
  "🎮",
  "🐾",
  "💡",
  "💳",
]

export const CategoryEditPage = () => {
  const navigate = useNavigate()
  const { uuid } = useParams<{ uuid: string }>()
  const isNew = !uuid

  const [name, setName] = useState("")
  const [glyph, setGlyph] = useState(CAT_GLYPHS[0])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchExisting = useCallback(async () => {
    if (!uuid) return
    try {
      const cats = await api.getCategories()
      const c = cats.find((x) => x.uuid === uuid)
      if (c) {
        setName(c.name)
        setGlyph(c.symbol ?? CAT_GLYPHS[0])
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load"))
    }
  }, [uuid])

  useEffect(() => {
    fetchExisting()
  }, [fetchExisting])

  const trimmed = name.trim()
  const canSave = trimmed.length > 0 && glyph.length > 0

  const save = async () => {
    if (!canSave) return
    setError("")
    setLoading(true)
    try {
      if (isNew) {
        await api.createCategory({ name: trimmed, symbol: glyph })
      } else if (uuid) {
        await api.updateCategory(uuid, { name: trimmed, symbol: glyph })
      }
      navigate("/category")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save"))
    } finally {
      setLoading(false)
    }
  }

  const onGlyphInput = (v: string) => {
    const arr = [...v]
    setGlyph(arr.length > 0 ? arr[arr.length - 1] : "")
  }

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
        <h1 className="text-base font-semibold">{isNew ? "New category" : "Edit category"}</h1>
        <button
          type="button"
          onClick={save}
          disabled={!canSave || loading}
          className="text-sm font-bold text-primary disabled:text-gray-300 dark:disabled:text-gray-600"
        >
          Save
        </button>
      </div>

      {error && (
        <p className="shrink-0 px-5 pb-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-10">
        <div className="flex justify-center py-5">
          <div className="flex size-21 items-center justify-center rounded-3xl border border-gray-200 bg-white text-4xl font-bold dark:border-gray-700 dark:bg-gray-800">
            {glyph || "·"}
          </div>
        </div>
        <div className="mb-6 text-center text-sm font-semibold">{trimmed || "Untitled"}</div>

        <div className="mb-2 text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          Name
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Coffee"
          maxLength={50}
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-base outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />

        <div className="mt-6 mb-2 text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          Symbol
        </div>
        <input
          type="text"
          value={glyph}
          onChange={(e) => onGlyphInput(e.target.value)}
          placeholder="Type any emoji or character"
          maxLength={8}
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-center text-lg outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        <div className="mt-3 mb-2.5 text-[11px] text-gray-400 dark:text-gray-500">Suggestions</div>
        <div className="grid grid-cols-8 gap-1.5">
          {CAT_GLYPHS.map((g, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setGlyph(g)}
              className={`flex aspect-square items-center justify-center rounded-lg border text-base ${
                glyph === g
                  ? "border-gray-900 bg-gray-100 dark:border-gray-100 dark:bg-gray-700"
                  : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
