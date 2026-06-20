import { ArrowLeftIcon, TrashIcon } from "@radix-ui/react-icons"
import { useNavigate, useParams } from "react-router"

import { ConfirmDialog } from "../../common/components/ConfirmDialog"
import { ExpenseCategoryChips } from "../../expense/components/ExpenseCategoryChips"
import { RecurringFrequencyPicker } from "../components/RecurringFrequencyPicker"
import { useRecurringExpenseForm } from "../hooks/useRecurringExpenseForm"

export const RecurringExpenseEditPage = () => {
  const navigate = useNavigate()
  const { uuid } = useParams<{ uuid: string }>()
  const f = useRecurringExpenseForm(uuid)

  return (
    <form
      onSubmit={f.handleSubmit}
      className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden"
    >
      <div className="flex shrink-0 items-center px-5 pt-2">
        <button
          type="button"
          onClick={() => navigate("/expense/recurring")}
          aria-label="Back"
          className="-ml-1 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeftIcon className="size-4" />
        </button>
      </div>

      {f.error && (
        <p className="mx-5 shrink-0 pb-1 text-sm text-red-600 dark:text-red-400">{f.error}</p>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col py-6">
          <div className="px-5">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
              Recurring title
            </span>
            <input
              type="text"
              value={f.name}
              onChange={(e) => f.setName(e.target.value)}
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
                value={f.amount}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^0-9]/g, "")
                  f.setAmount(digits ? Number(digits).toLocaleString() : "")
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
              value={f.startDate}
              onChange={(e) => f.setStartDate(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              required
              className="mt-1 w-full cursor-pointer bg-transparent text-base font-medium tabular-nums outline-none dark:text-gray-100"
            />
            <div className="mt-2 h-px bg-gray-200 dark:bg-gray-700" />
          </div>
          <ExpenseCategoryChips
            categories={f.categories}
            selectedUuid={f.categoryUuid || null}
            onSelect={(v) => f.setCategoryUuid(v ?? "")}
            label="Category"
          />
          <RecurringFrequencyPicker selectedKey={f.frequencyKey} onChange={f.setFrequencyKey} />
        </div>
      </div>

      <div className="shrink-0 px-5 pt-2 pb-3">
        <button
          type="submit"
          disabled={f.loading || !f.name || !f.amount || !f.categoryUuid}
          className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(47,116,208,0.32)] hover:bg-primary-hover disabled:opacity-50 disabled:shadow-none"
        >
          {f.loading ? "Saving…" : f.isEdit ? "Update" : "Save"}
        </button>
        {f.isEdit && (
          <button
            type="button"
            onClick={f.openDeleteDialog}
            disabled={f.loading}
            className="mt-2 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
          >
            <TrashIcon className="size-3.5" />
            Delete
          </button>
        )}
      </div>

      <ConfirmDialog
        message={`Stop "${f.name}"? Past records remain unchanged.`}
        onConfirm={f.handleDelete}
        confirmText="Stop"
        loading={f.loading}
        dialogRef={f.dialogRef}
      />
    </form>
  )
}
