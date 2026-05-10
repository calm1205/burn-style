interface RecurringFormActionsProps {
  isEdit: boolean
  loading: boolean
  canSubmit: boolean
  onCancel: () => void
  onOpenDelete: () => void
}

export const RecurringFormActions = ({
  isEdit,
  loading,
  canSubmit,
  onCancel,
  onOpenDelete,
}: RecurringFormActionsProps) => (
  <div className="flex flex-col gap-3">
    <button
      type="submit"
      disabled={loading || !canSubmit}
      className="rounded-2xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
    >
      {loading ? "Saving..." : isEdit ? "Save" : "Create"}
    </button>
    <button
      type="button"
      onClick={onCancel}
      disabled={loading}
      className="rounded-2xl border border-gray-200 py-3 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      Cancel
    </button>
    {isEdit && (
      <button
        type="button"
        onClick={onOpenDelete}
        disabled={loading}
        className="mt-4 rounded-2xl py-3 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Stop this recurring
      </button>
    )}
  </div>
)
