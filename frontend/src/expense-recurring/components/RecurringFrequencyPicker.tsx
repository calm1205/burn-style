import { FREQUENCY_OPTIONS } from "../libs/recurringFrequency"

interface RecurringFrequencyPickerProps {
  selectedKey: string
  onChange: (key: string) => void
}

export const RecurringFrequencyPicker = ({
  selectedKey,
  onChange,
}: RecurringFrequencyPickerProps) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
    <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">How often</div>
    <div className="flex flex-wrap gap-2">
      {FREQUENCY_OPTIONS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => onChange(f.key)}
          className={`rounded-full px-4 py-2 text-sm transition-colors ${
            selectedKey === f.key
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  </div>
)
