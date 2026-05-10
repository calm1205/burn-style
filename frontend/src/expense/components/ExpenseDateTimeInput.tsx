interface ExpenseDateTimeInputProps {
  value: string
  onChange: (v: string) => void
}

export const ExpenseDateTimeInput = ({ value, onChange }: ExpenseDateTimeInputProps) => (
  <div className="px-5 pt-5 text-center">
    <div className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
      When
    </div>
    <input
      type="datetime-local"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="mt-1 bg-transparent text-center text-sm font-medium tabular-nums outline-none dark:text-gray-100"
    />
  </div>
)
