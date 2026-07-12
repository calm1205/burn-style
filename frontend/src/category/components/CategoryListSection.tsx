import { PlusIcon } from "@radix-ui/react-icons"
import { useNavigate } from "react-router"

import type { useCategoriesPage } from "../hooks/useCategoriesPage"
import { CategoryList } from "./CategoryList"

interface CategoryListSectionProps {
  page: ReturnType<typeof useCategoriesPage>
}

export const CategoryListSection = ({ page: p }: CategoryListSectionProps) => {
  const navigate = useNavigate()

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6">
      {p.categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No categories yet
        </p>
      ) : (
        <CategoryList
          categories={p.categories}
          usage={p.usage}
          onEdit={(uuid) => navigate(`/category/${uuid}`)}
          onMerge={p.setMergingFrom}
          onMove={p.moveCategory}
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
  )
}
