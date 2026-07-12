import { TrashIcon } from "@radix-ui/react-icons"

import type { useRecurringExpenseForm } from "../hooks/useRecurringExpenseForm"

interface RecurringExpenseFormFooterProps {
  form: ReturnType<typeof useRecurringExpenseForm>
}

export const RecurringExpenseFormFooter = ({ form: f }: RecurringExpenseFormFooterProps) => {
  return (
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
  )
}
