import { DeleteButton } from "../../common/components/DeleteButton"
import { PrimaryButton } from "../../common/components/PrimaryButton"
import type { useRecurringExpenseForm } from "../hooks/useRecurringExpenseForm"

interface RecurringExpenseFormFooterProps {
  form: ReturnType<typeof useRecurringExpenseForm>
}

export const RecurringExpenseFormFooter = ({ form: f }: RecurringExpenseFormFooterProps) => {
  return (
    <div className="shrink-0 px-5 pt-2 pb-3">
      <PrimaryButton type="submit" disabled={f.loading || !f.name || !f.amount || !f.categoryUuid}>
        {f.loading ? "Saving…" : f.isEdit ? "Update" : "Save"}
      </PrimaryButton>
      {f.isEdit && <DeleteButton onClick={f.openDeleteDialog} disabled={f.loading} />}
    </div>
  )
}
