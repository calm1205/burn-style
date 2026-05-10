import { type Ref } from "react"

interface ExpenseNameInputProps {
  value: string
  onChange: (v: string) => void
  inputRef?: Ref<HTMLInputElement>
}

export const ExpenseNameInput = ({ value, onChange, inputRef }: ExpenseNameInputProps) => (
  <div className="px-5 pt-3">
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      maxLength={100}
      placeholder="What was this?"
      className="w-full bg-transparent text-2xl font-bold tracking-tight outline-none placeholder:text-gray-300 dark:text-gray-100 dark:placeholder:text-gray-600"
    />
    <div className="mt-2 h-px bg-gray-200 dark:bg-gray-700" />
  </div>
)
