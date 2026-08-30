import { useNavigate } from "react-router"

import type { useCategoryEditForm } from "../hooks/useCategoryEditForm"

interface CategoryEditHeaderProps {
  form: ReturnType<typeof useCategoryEditForm>
}

export const CategoryEditHeader = ({ form }: CategoryEditHeaderProps) => {
  const navigate = useNavigate()

  return (
    <div className="flex shrink-0 items-center justify-between px-4 pt-3 pb-2">
      <button
        type="button"
        onClick={() => navigate("/category")}
        className="text-sm font-medium text-primary"
      >
        Cancel
      </button>
      <h1 className="text-base font-semibold">{form.isNew ? "New category" : "Edit category"}</h1>
      <button
        type="button"
        onClick={form.saveCategory}
        disabled={!form.canSave || form.loading}
        className="text-sm font-bold text-primary disabled:text-gray-300 dark:disabled:text-gray-600"
      >
        Save
      </button>
    </div>
  )
}
