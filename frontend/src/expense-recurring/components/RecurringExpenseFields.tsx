import { ExpenseCategoryChips } from "../../expense/components/ExpenseCategoryChips"
import type { useRecurringExpenseForm } from "../hooks/useRecurringExpenseForm"
import { RecurringFrequencyPicker } from "./RecurringFrequencyPicker"

interface RecurringExpenseFieldsProps {
  form: ReturnType<typeof useRecurringExpenseForm>
}

export const RecurringExpenseFields = ({ form }: RecurringExpenseFieldsProps) => {
  return (
    <div className="flex flex-col py-6">
      <div className="px-5">
        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          Recurring title
        </span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => form.setName(e.target.value)}
          required
          maxLength={100}
          placeholder="House cleaner"
          className="mt-1 w-full bg-transparent text-2xl font-bold tracking-tight outline-none placeholder:text-gray-300 dark:text-gray-100 dark:placeholder:text-gray-600"
        />
        <div className="mt-2 h-px bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="px-5 pt-5">
        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          Recurring amount
        </span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-lg font-medium text-gray-500 dark:text-gray-400">¥</span>
          <input
            type="text"
            inputMode="numeric"
            value={form.amount}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^0-9]/g, "")
              form.setAmount(digits ? Number(digits).toLocaleString() : "")
            }}
            required
            placeholder="0"
            className="flex-1 bg-transparent text-2xl font-bold tracking-tighter tabular-nums outline-none placeholder:text-gray-300 dark:text-gray-100 dark:placeholder:text-gray-600"
          />
        </div>
        <div className="mt-2 h-px bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="px-5 pt-5">
        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          Start date
        </span>
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => form.setStartDate(e.target.value)}
          onClick={(e) => e.currentTarget.showPicker?.()}
          required
          className="mt-1 w-full cursor-pointer bg-transparent text-base font-medium tabular-nums outline-none dark:text-gray-100"
        />
        <div className="mt-2 h-px bg-gray-200 dark:bg-gray-700" />
      </div>
      <ExpenseCategoryChips
        categories={form.categories}
        selectedUuid={form.categoryUuid || null}
        onSelect={(v) => form.setCategoryUuid(v ?? "")}
        label="Category"
      />
      <RecurringFrequencyPicker selectedKey={form.frequencyKey} onChange={form.setFrequencyKey} />
    </div>
  )
}
