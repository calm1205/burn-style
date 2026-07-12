import type { CategoryResponse } from "../../common/libs/types"
import { CategoryRow } from "./CategoryRow"

interface CategoryListProps {
  categories: CategoryResponse[]
  usage: Record<string, number>
  onEdit: (uuid: string) => void
  onMerge: (uuid: string) => void
  onMove: (uuid: string, direction: "up" | "down") => void
}

export const CategoryList = ({ categories, usage, onEdit, onMerge, onMove }: CategoryListProps) => {
  return (
    <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
      {categories.map((c, i) => (
        <CategoryRow
          key={c.uuid}
          category={c}
          used={usage[c.uuid] ?? 0}
          onEdit={() => onEdit(c.uuid)}
          onMerge={() => onMerge(c.uuid)}
          mergeDisabled={categories.length < 2}
          onMoveUp={() => onMove(c.uuid, "up")}
          onMoveDown={() => onMove(c.uuid, "down")}
          moveUpDisabled={i === 0}
          moveDownDisabled={i === categories.length - 1}
        />
      ))}
    </ul>
  )
}
