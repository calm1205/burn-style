import { useEffect, useRef, useState } from "react"

import type { CategoryResponse } from "../../common/libs/types"
import { defaultFilter, type ExpenseFilter } from "../libs/expenseFilter"
import { FilterSheetAmountSection } from "./FilterSheetAmountSection"
import { FilterSheetCategorySection } from "./FilterSheetCategorySection"
import { FilterSheetHeader } from "./FilterSheetHeader"
import { FilterSheetSearchSection } from "./FilterSheetSearchSection"

interface ExpenseFilterSheetProps {
  open: boolean
  onClose: () => void
  filter: ExpenseFilter
  onApply: (f: ExpenseFilter) => void
  categories: CategoryResponse[]
}

export const ExpenseFilterSheet = ({
  open,
  onClose,
  filter,
  onApply,
  categories,
}: ExpenseFilterSheetProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState<ExpenseFilter>(filter)

  useEffect(() => {
    if (open) {
      setDraft(filter)
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [open, filter])

  const toggleCategory = (uuid: string) => {
    setDraft((d) =>
      d.categoryUuids.includes(uuid)
        ? { ...d, categoryUuids: d.categoryUuids.filter((u) => u !== uuid) }
        : { ...d, categoryUuids: [...d.categoryUuids, uuid] },
    )
  }

  const apply = () => {
    onApply(draft)
    onClose()
  }

  const reset = () => {
    onApply(defaultFilter())
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-0 h-full max-h-none w-full max-w-none bg-gray-50 text-gray-900 backdrop:bg-black/30 dark:bg-gray-900 dark:text-gray-100"
    >
      <div className="flex h-full flex-col">
        <FilterSheetHeader onCancel={onClose} onApply={apply} />

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5 pb-24">
          <FilterSheetSearchSection
            value={draft.q}
            onChange={(v) => setDraft({ ...draft, q: v })}
          />
          <FilterSheetCategorySection
            categories={categories}
            selectedUuids={draft.categoryUuids}
            onToggle={toggleCategory}
            onClear={() => setDraft({ ...draft, categoryUuids: [] })}
          />
          <FilterSheetAmountSection
            min={draft.min}
            max={draft.max}
            onMinChange={(v) => setDraft({ ...draft, min: v })}
            onMaxChange={(v) => setDraft({ ...draft, max: v })}
            onPreset={(min, max) => setDraft({ ...draft, min, max })}
          />

          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-500 dark:border-gray-700 dark:text-gray-400"
          >
            Reset all filters
          </button>
        </div>
      </div>
    </dialog>
  )
}
