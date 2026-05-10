interface RecurringNameAmountFieldsProps {
  name: string
  amount: string
  onNameChange: (v: string) => void
  onAmountChange: (v: string) => void
}

export const RecurringNameAmountFields = ({
  name,
  amount,
  onNameChange,
  onAmountChange,
}: RecurringNameAmountFieldsProps) => {
  const handleAmount = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "")
    onAmountChange(digits ? Number(digits).toLocaleString() : "")
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <label className="text-xs text-gray-500 dark:text-gray-400" htmlFor="recurring-name">
        Name this recurring
      </label>
      <input
        id="recurring-name"
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        required
        maxLength={50}
        placeholder="House cleaner"
        className="mt-1 w-full border-x-0 border-t-0 border-b border-gray-200 bg-transparent py-2 text-lg outline-none focus:border-primary dark:border-gray-700 dark:text-gray-100"
      />
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-2xl text-gray-400">¥</span>
        <input
          id="recurring-amount"
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => handleAmount(e.target.value)}
          required
          placeholder="0"
          className="flex-1 border-x-0 border-t-0 border-b border-gray-200 bg-transparent py-2 text-2xl outline-none focus:border-primary dark:border-gray-700 dark:text-gray-100"
        />
      </div>
    </div>
  )
}
