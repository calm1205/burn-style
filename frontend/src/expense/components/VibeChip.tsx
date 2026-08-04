interface VibeChipProps {
  active: boolean
  label: string
  onClick: () => void
}

export const VibeChip = ({ active, label, onClick }: VibeChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-h-11 rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-colors ${
      active
        ? "border-primary bg-primary text-white"
        : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }`}
  >
    {label}
  </button>
)
