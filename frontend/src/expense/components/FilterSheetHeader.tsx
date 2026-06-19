interface FilterSheetHeaderProps {
  onCancel: () => void
  onReset: () => void
}

export const FilterSheetHeader = ({ onCancel, onReset }: FilterSheetHeaderProps) => (
  <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
    <button type="button" onClick={onCancel} className="text-sm font-medium text-primary">
      Cancel
    </button>
    <h2 className="text-sm font-semibold">Filter expenses</h2>
    <button type="button" onClick={onReset} className="text-sm font-medium text-gray-500">
      Reset
    </button>
  </div>
)
