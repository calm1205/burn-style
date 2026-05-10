import { PlusIcon } from "@radix-ui/react-icons"
import { useNavigate } from "react-router"

import { CategoryDeleteModal } from "../components/CategoryDeleteModal"
import { CategoryList } from "../components/CategoryList"
import { CategoryMergeModal } from "../components/CategoryMergeModal"
import { useCategoriesPage } from "../hooks/useCategoriesPage"

export const CategoriesPage = () => {
  const navigate = useNavigate()
  const {
    categories,
    usage,
    error,
    loading,
    mergingCategory,
    confirmCategory,
    mergingFrom,
    setMergingFrom,
    setConfirmDel,
    handleDragEnd,
    handleDelete,
    handleMerge,
  } = useCategoriesPage()

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between px-4 pt-3 pb-2">
        <div className="w-10" />
        <h1 className="text-base font-semibold">Categories</h1>
        <button
          type="button"
          aria-label="New category"
          onClick={() => navigate("/category/new")}
          className="flex w-10 items-center justify-end text-2xl leading-none text-primary"
        >
          +
        </button>
      </div>
      <p className="shrink-0 px-5 pb-3 text-xs text-gray-500 dark:text-gray-400">
        {categories.length} categories · drag to reorder, tap to edit
      </p>

      {error && (
        <p className="mx-5 shrink-0 pb-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {categories.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            No categories yet
          </p>
        ) : (
          <CategoryList
            categories={categories}
            usage={usage}
            onEdit={(uuid) => navigate(`/category/${uuid}`)}
            onMerge={setMergingFrom}
            onDelete={setConfirmDel}
            onDragEnd={handleDragEnd}
          />
        )}

        <button
          type="button"
          onClick={() => navigate("/category/new")}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed border-gray-300 bg-white py-3.5 text-sm font-semibold text-primary dark:border-gray-700 dark:bg-gray-800"
        >
          <PlusIcon className="size-4" />
          New category
        </button>
      </div>

      {mergingCategory && (
        <CategoryMergeModal
          source={mergingCategory}
          candidates={categories.filter((c) => c.uuid !== mergingFrom)}
          usage={usage}
          loading={loading}
          onMerge={handleMerge}
          onClose={() => setMergingFrom(null)}
        />
      )}

      {confirmCategory && (
        <CategoryDeleteModal
          category={confirmCategory}
          used={usage[confirmCategory.uuid] ?? 0}
          loading={loading}
          onDelete={handleDelete}
          onClose={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}
