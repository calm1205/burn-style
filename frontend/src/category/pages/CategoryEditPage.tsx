import { useParams } from "react-router"

import { CategoryDeleteModal } from "../components/CategoryDeleteModal"
import { CategoryEditFields } from "../components/CategoryEditFields"
import { CategoryEditHeader } from "../components/CategoryEditHeader"
import { useCategoryEditForm } from "../hooks/useCategoryEditForm"

export const CategoryEditPage = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const f = useCategoryEditForm(uuid)

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden">
      <CategoryEditHeader form={f} />

      {f.error && (
        <p className="shrink-0 px-5 pb-2 text-sm text-red-600 dark:text-red-400">{f.error}</p>
      )}

      <CategoryEditFields form={f} />

      {f.confirmingDelete && !f.isNew && (
        <CategoryDeleteModal
          name={f.trimmed}
          used={f.usage}
          loading={f.loading}
          onDelete={f.remove}
          onClose={() => f.setConfirmingDelete(false)}
        />
      )}
    </div>
  )
}
