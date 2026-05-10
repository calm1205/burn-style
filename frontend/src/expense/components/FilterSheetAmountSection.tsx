interface FilterSheetAmountSectionProps {
  min: number
  max: number
  onMinChange: (v: number) => void
  onMaxChange: (v: number) => void
  onPreset: (min: number, max: number) => void
}

const PRESETS: ReadonlyArray<readonly [number, number]> = [
  [0, 1000],
  [1000, 5000],
  [5000, 20000],
  [20000, 0],
]

export const FilterSheetAmountSection = ({
  min,
  max,
  onMinChange,
  onMaxChange,
  onPreset,
}: FilterSheetAmountSectionProps) => (
  <section>
    <h3 className="mb-2 text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
      Amount
    </h3>
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800">
        <span className="text-gray-400">¥</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder="min"
          value={min || ""}
          onChange={(e) => onMinChange(Number(e.target.value) || 0)}
          className="w-full bg-transparent outline-none dark:text-gray-100"
        />
      </div>
      <span className="text-gray-400">—</span>
      <div className="flex flex-1 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800">
        <span className="text-gray-400">¥</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder="max"
          value={max || ""}
          onChange={(e) => onMaxChange(Number(e.target.value) || 0)}
          className="w-full bg-transparent outline-none dark:text-gray-100"
        />
      </div>
    </div>
    <div className="mt-2 flex gap-2">
      {PRESETS.map(([lo, hi]) => (
        <button
          key={`${lo}-${hi}`}
          type="button"
          onClick={() => onPreset(lo, hi)}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          {hi ? `¥${lo.toLocaleString()}–${hi.toLocaleString()}` : `¥${lo.toLocaleString()}+`}
        </button>
      ))}
    </div>
  </section>
)
