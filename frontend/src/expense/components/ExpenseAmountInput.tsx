interface ExpenseAmountInputProps {
  value: string
  onChange: (v: string) => void
}

export const ExpenseAmountInput = ({ value, onChange }: ExpenseAmountInputProps) => {
  const handle = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "")
    onChange(digits ? Number(digits).toLocaleString() : "")
  }

  return (
    <div className="px-5 pt-5 text-center">
      <div className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
        What did this cost you
      </div>
      <div className="mt-2 flex items-baseline justify-center gap-1">
        <span className="text-2xl font-medium text-gray-500 dark:text-gray-400">¥</span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => handle(e.target.value)}
          required
          placeholder="0"
          className="w-44 bg-transparent text-center text-5xl font-bold tracking-tighter tabular-nums outline-none placeholder:text-gray-300 dark:text-gray-100 dark:placeholder:text-gray-600"
        />
      </div>
    </div>
  )
}
