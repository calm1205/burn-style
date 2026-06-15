interface ExpenseDateTimeInputProps {
  value: string
  onChange: (v: string) => void
}

export const ExpenseDateTimeInput = ({ value, onChange }: ExpenseDateTimeInputProps) => (
  <div className="px-5 pt-3 text-center">
    <input
      type="datetime-local"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="bg-transparent text-center text-sm font-medium text-gray-500 tabular-nums outline-none dark:text-gray-400"
    />
  </div>
)
