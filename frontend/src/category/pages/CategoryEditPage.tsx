import { useParams } from "react-router"

import { CategoryDeleteModal } from "../components/CategoryDeleteModal"
import { CategoryEditFields } from "../components/CategoryEditFields"
import { CategoryEditHeader } from "../components/CategoryEditHeader"
import { useCategoryEditForm } from "../hooks/useCategoryEditForm"

export const CategoryEditPage = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const categoryForm = useCategoryEditForm(uuid)

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden">
      <CategoryEditHeader form={categoryForm} />

      {categoryForm.error && (
        <p className="shrink-0 px-5 pb-2 text-sm text-red-600 dark:text-red-400">
          {categoryForm.error}
        </p>
      )}

      <CategoryEditFields form={categoryForm} />

      {categoryForm.confirmingDelete && !categoryForm.isNew && (
        <CategoryDeleteModal
          name={categoryForm.trimmed}
          used={categoryForm.usage}
          loading={categoryForm.loading}
          onDelete={categoryForm.deleteCategory}
          onClose={() => categoryForm.setConfirmingDelete(false)}
        />
      )}
    </div>
  )
}
