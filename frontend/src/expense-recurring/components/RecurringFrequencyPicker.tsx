import { FREQUENCY_OPTIONS } from "../libs/recurringFrequency"

interface RecurringFrequencyPickerProps {
  selectedKey: string
  onChange: (key: string) => void
}

export const RecurringFrequencyPicker = ({
  selectedKey,
  onChange,
}: RecurringFrequencyPickerProps) => (
  <div className="px-5 pt-5">
    <div className="flex flex-wrap gap-2">
      {FREQUENCY_OPTIONS.map((f) => {
        const active = selectedKey === f.key
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onChange(f.key)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${
              active
                ? "border-primary bg-primary text-white"
                : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  </div>
)
