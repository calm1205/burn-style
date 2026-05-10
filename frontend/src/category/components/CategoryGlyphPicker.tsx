const SUGGESTED_GLYPHS = [
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

export const DEFAULT_GLYPH = SUGGESTED_GLYPHS[0]

interface CategoryGlyphPickerProps {
  glyph: string
  onChange: (g: string) => void
}

export const CategoryGlyphPicker = ({ glyph, onChange }: CategoryGlyphPickerProps) => {
  const handleInput = (v: string) => {
    const arr = [...v]
    onChange(arr.length > 0 ? arr[arr.length - 1] : "")
  }

  return (
    <>
      <div className="mt-6 mb-2 text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
        Symbol
      </div>
      <input
        type="text"
        value={glyph}
        onChange={(e) => handleInput(e.target.value)}
        placeholder="Type any emoji or character"
        maxLength={8}
        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-center text-lg outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />
      <div className="mt-3 mb-2.5 text-[11px] text-gray-400 dark:text-gray-500">Suggestions</div>
      <div className="grid grid-cols-8 gap-1.5">
        {SUGGESTED_GLYPHS.map((g, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(g)}
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
    </>
  )
}
