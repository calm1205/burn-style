import { useEffect, useRef, useState } from "react"

import type { CategoryResponse } from "../../common/libs/types"
import { defaultFilter, type ExpenseFilter } from "../libs/expenseFilter"
import { FilterSheetAmountSection } from "./FilterSheetAmountSection"
import { FilterSheetCategorySection } from "./FilterSheetCategorySection"
import { FilterSheetHeader } from "./FilterSheetHeader"
import { FilterSheetScopeSection } from "./FilterSheetScopeSection"
import { FilterSheetSearchSection } from "./FilterSheetSearchSection"
import { FilterSheetVibeSection } from "./FilterSheetVibeSection"

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

  const reset = () => setDraft(defaultFilter())

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-0 h-full max-h-none w-full max-w-none bg-gray-50 text-gray-900 backdrop:bg-black/30 dark:bg-gray-900 dark:text-gray-100"
    >
      <div className="flex h-full flex-col">
        <FilterSheetHeader onCancel={onClose} onReset={reset} />

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5 pb-24">
          <FilterSheetSearchSection
            value={draft.q}
            onChange={(v) => setDraft({ ...draft, q: v })}
          />
          <FilterSheetScopeSection
            scope={draft.scope}
            onChange={(v) => setDraft({ ...draft, scope: v })}
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
          <FilterSheetVibeSection
            social={draft.vibeSocial}
            planning={draft.vibePlanning}
            necessity={draft.vibeNecessity}
            onSocialChange={(v) => setDraft({ ...draft, vibeSocial: v })}
            onPlanningChange={(v) => setDraft({ ...draft, vibePlanning: v })}
            onNecessityChange={(v) => setDraft({ ...draft, vibeNecessity: v })}
          />
        </div>

        <div className="shrink-0 px-5 pt-2 pb-8">
          <button
            type="button"
            onClick={apply}
            className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(47,116,208,0.32)] hover:bg-primary-hover"
          >
            Apply
          </button>
        </div>
      </div>
    </dialog>
  )
}
