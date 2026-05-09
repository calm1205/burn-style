import { Cross2Icon } from "@radix-ui/react-icons"
import { useEffect, useRef, useState } from "react"

import { categoryGlyph } from "../../common/libs/category"
import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"

export type FilterScope = "week" | "month" | "all"

export interface ExpenseFilter {
  q: string
  scope: FilterScope
  categoryUuids: string[]
  min: number
  max: number
}

const SCOPE_OPTIONS: { k: FilterScope; label: string }[] = [
  { k: "week", label: "This week" },
  { k: "month", label: "This month" },
  { k: "all", label: "All time" },
]

export const defaultFilter = (): ExpenseFilter => ({
  q: "",
  scope: "month",
  categoryUuids: [],
  min: 0,
  max: 0,
})

export const filterCount = (f: ExpenseFilter): number => {
  let n = 0
  if (f.q) n++
  if (f.scope !== "month") n++
  if (f.categoryUuids.length > 0) n++
  if (f.min > 0 || f.max > 0) n++
  return n
}

const sameLocalDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export const applyFilter = (expenses: ExpenseResponse[], f: ExpenseFilter): ExpenseResponse[] => {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)

  return expenses.filter((e) => {
    const d = new Date(e.expensed_at)

    if (f.scope === "week") {
      if (d < weekStart) return false
      if (d > now && !sameLocalDay(d, now)) return false
    } else if (f.scope === "month") {
      if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) return false
    }

    if (f.q && !e.name.toLowerCase().includes(f.q.toLowerCase())) return false
    if (f.categoryUuids.length > 0) {
      const hit = e.categories.some((c) => f.categoryUuids.includes(c.uuid))
      if (!hit) return false
    }
    if (f.min > 0 && e.amount < f.min) return false
    if (f.max > 0 && e.amount > f.max) return false
    return true
  })
}

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
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <button type="button" onClick={onClose} className="text-sm font-medium text-primary">
            Cancel
          </button>
          <h2 className="text-sm font-semibold">Filter expenses</h2>
          <button type="button" onClick={apply} className="text-sm font-bold text-primary">
            Apply
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5 pb-24">
          <section>
            <h3 className="mb-2 text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
              Search
            </h3>
            <div className="relative">
              <input
                type="text"
                value={draft.q}
                onChange={(e) => setDraft({ ...draft, q: e.target.value })}
                placeholder="Name…"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
              {draft.q && (
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, q: "" })}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
                  aria-label="Clear"
                >
                  <Cross2Icon className="size-3.5" />
                </button>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
              Range
            </h3>
            <div className="flex gap-1.5 rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
              {SCOPE_OPTIONS.map((s) => {
                const on = draft.scope === s.k
                return (
                  <button
                    key={s.k}
                    type="button"
                    onClick={() => setDraft({ ...draft, scope: s.k })}
                    className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold ${
                      on ? "bg-primary text-white" : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </section>

          {categories.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                  Categories
                </h3>
                {draft.categoryUuids.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, categoryUuids: [] })}
                    className="text-[11px] text-gray-400"
                  >
                    clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const on = draft.categoryUuids.includes(c.uuid)
                  return (
                    <button
                      key={c.uuid}
                      type="button"
                      onClick={() => toggleCategory(c.uuid)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        on
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      <span>{categoryGlyph(c)}</span>
                      <span>{c.name}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-2 text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
              Amount
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800">
                <span className="text-gray-400">¥</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="min"
                  value={draft.min || ""}
                  onChange={(e) => setDraft({ ...draft, min: Number(e.target.value) || 0 })}
                  className="w-full bg-transparent outline-none dark:text-gray-100"
                />
              </div>
              <span className="text-gray-400">—</span>
              <div className="flex flex-1 items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800">
                <span className="text-gray-400">¥</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="max"
                  value={draft.max || ""}
                  onChange={(e) => setDraft({ ...draft, max: Number(e.target.value) || 0 })}
                  className="w-full bg-transparent outline-none dark:text-gray-100"
                />
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              {(
                [
                  [0, 1000],
                  [1000, 5000],
                  [5000, 20000],
                  [20000, 0],
                ] as const
              ).map(([lo, hi]) => (
                <button
                  key={`${lo}-${hi}`}
                  type="button"
                  onClick={() => setDraft({ ...draft, min: lo, max: hi })}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {hi
                    ? `¥${lo.toLocaleString()}–${hi.toLocaleString()}`
                    : `¥${lo.toLocaleString()}+`}
                </button>
              ))}
            </div>
          </section>

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

interface ExpenseFilterChipsProps {
  filter: ExpenseFilter
  categories: CategoryResponse[]
  onOpen: () => void
  onClear: () => void
}

export const ExpenseFilterChips = ({
  filter,
  categories,
  onOpen,
  onClear,
}: ExpenseFilterChipsProps) => {
  const labels: string[] = []
  if (filter.q) labels.push(`"${filter.q}"`)
  if (filter.scope !== "month") {
    const s = SCOPE_OPTIONS.find((x) => x.k === filter.scope)
    if (s) labels.push(s.label)
  }
  for (const uuid of filter.categoryUuids) {
    const c = categories.find((x) => x.uuid === uuid)
    if (c) labels.push(c.name)
  }
  if (filter.min > 0 || filter.max > 0) {
    labels.push(
      filter.max
        ? `¥${filter.min.toLocaleString()}–${filter.max.toLocaleString()}`
        : `¥${filter.min.toLocaleString()}+`,
    )
  }

  if (labels.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-2">
      {labels.map((l, i) => (
        <button
          key={i}
          type="button"
          onClick={onOpen}
          className="rounded-xl bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary"
        >
          {l}
        </button>
      ))}
      <button type="button" onClick={onClear} className="px-1.5 py-1 text-[11px] text-gray-400">
        clear all
      </button>
    </div>
  )
}
