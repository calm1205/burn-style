import { CategoryListSection } from "../components/CategoryListSection"
import { CategoryMergeModal } from "../components/CategoryMergeModal"
import { useCategoriesPage } from "../hooks/useCategoriesPage"

export const CategoriesPage = () => {
  const categoryPage = useCategoriesPage()

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-3 pb-2">
        <h1 className="text-base font-semibold">Categories</h1>
      </div>
      {categoryPage.error && (
        <p className="mx-5 shrink-0 pb-2 text-sm text-red-600 dark:text-red-400">
          {categoryPage.error}
        </p>
      )}

      <CategoryListSection page={categoryPage} />

      {categoryPage.mergingCategory && (
        <CategoryMergeModal
          source={categoryPage.mergingCategory}
          candidates={categoryPage.categories.filter((c) => c.uuid !== categoryPage.mergingFrom)}
          usage={categoryPage.usage}
          loading={categoryPage.loading}
          onMerge={categoryPage.handleMerge}
          onClose={() => categoryPage.setMergingFrom(null)}
        />
      )}
    </div>
  )
}
