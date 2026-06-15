interface ExpenseDateTimeInputProps {
  value: string
  onChange: (v: string) => void
}

export const ExpenseDateTimeInput = ({ value, onChange }: ExpenseDateTimeInputProps) => (
  <input
    type="datetime-local"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onClick={(e) => e.currentTarget.showPicker?.()}
    required
    className="cursor-pointer bg-transparent text-[11px] font-medium text-gray-400 tabular-nums outline-none [&::-webkit-calendar-picker-indicator]:hidden dark:text-gray-500"
  />
)
