import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import type { CategoryResponse } from "../../common/libs/types"
import { CategorySortableRow } from "./CategorySortableRow"

interface CategoryListProps {
  categories: CategoryResponse[]
  usage: Record<string, number>
  onEdit: (uuid: string) => void
  onMerge: (uuid: string) => void
  onDelete: (uuid: string) => void
  onDragEnd: (event: DragEndEvent) => void
}

export const CategoryList = ({
  categories,
  usage,
  onEdit,
  onMerge,
  onDelete,
  onDragEnd,
}: CategoryListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={categories.map((c) => c.uuid)} strategy={verticalListSortingStrategy}>
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
          {categories.map((c) => (
            <CategorySortableRow
              key={c.uuid}
              category={c}
              used={usage[c.uuid] ?? 0}
              onEdit={() => onEdit(c.uuid)}
              onMerge={() => onMerge(c.uuid)}
              onDelete={() => onDelete(c.uuid)}
              mergeDisabled={categories.length < 2}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
