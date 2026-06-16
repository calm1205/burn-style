import type { RefObject } from "react"

interface ExpenseAmountInputProps {
  value: string
  onChange: (v: string) => void
  inputRef?: RefObject<HTMLInputElement | null>
}

export const ExpenseAmountInput = ({ value, onChange, inputRef }: ExpenseAmountInputProps) => {
  const handle = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "")
    onChange(digits ? Number(digits).toLocaleString() : "")
  }

  return (
    <div className="px-5 pt-6 text-center">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => handle(e.target.value)}
        required
        placeholder="0"
        className="w-full bg-transparent text-center text-8xl font-bold tracking-tighter tabular-nums outline-none placeholder:text-gray-300 dark:text-gray-100 dark:placeholder:text-gray-600"
      />
    </div>
  )
}
