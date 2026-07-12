import { CategoryListSection } from "../components/CategoryListSection"
import { CategoryMergeModal } from "../components/CategoryMergeModal"
import { useCategoriesPage } from "../hooks/useCategoriesPage"

export const CategoriesPage = () => {
  const p = useCategoriesPage()

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-3 pb-2">
        <h1 className="text-base font-semibold">Categories</h1>
      </div>
      {p.error && (
        <p className="mx-5 shrink-0 pb-2 text-sm text-red-600 dark:text-red-400">{p.error}</p>
      )}

      <CategoryListSection page={p} />

      {p.mergingCategory && (
        <CategoryMergeModal
          source={p.mergingCategory}
          candidates={p.categories.filter((c) => c.uuid !== p.mergingFrom)}
          usage={p.usage}
          loading={p.loading}
          onMerge={p.handleMerge}
          onClose={() => p.setMergingFrom(null)}
        />
      )}
    </div>
  )
}
