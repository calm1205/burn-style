interface FilterSheetAmountSectionProps {
  amountMin: number
  amountMax: number
  onAmountMinChange: (v: number) => void
  onAmountMaxChange: (v: number) => void
  onClear: () => void
}

export const FilterSheetAmountSection = ({
  amountMin,
  amountMax,
  onAmountMinChange,
  onAmountMaxChange,
  onClear,
}: FilterSheetAmountSectionProps) => (
  <section>
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
        Amount
      </h3>
      {(amountMin > 0 || amountMax > 0) && (
        <button type="button" onClick={onClear} className="text-[11px] text-gray-400">
          clear
        </button>
      )}
    </div>
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800">
        <span className="text-gray-400">¥</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder="min"
          value={amountMin || ""}
          onChange={(e) => onAmountMinChange(Number(e.target.value) || 0)}
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
          value={amountMax || ""}
          onChange={(e) => onAmountMaxChange(Number(e.target.value) || 0)}
          className="w-full bg-transparent outline-none dark:text-gray-100"
        />
      </div>
    </div>
  </section>
)
