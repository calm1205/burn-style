interface FilterSheetHeaderProps {
  onCancel: () => void
  onApply: () => void
}

export const FilterSheetHeader = ({ onCancel, onApply }: FilterSheetHeaderProps) => (
  <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
    <button type="button" onClick={onCancel} className="text-sm font-medium text-primary">
      Cancel
    </button>
    <h2 className="text-sm font-semibold">Filter expenses</h2>
    <button type="button" onClick={onApply} className="text-sm font-bold text-primary">
      Apply
    </button>
  </div>
)
