import { Cross2Icon, MagnifyingGlassIcon, MixerHorizontalIcon } from "@radix-ui/react-icons"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router"

import { categoryGlyph } from "../../common/libs/category"
import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"
import {
  applyFilter,
  defaultFilter,
  type ExpenseFilter,
  ExpenseFilterChips,
  ExpenseFilterSheet,
  filterCount,
  SCOPE_OPTIONS,
} from "./ExpenseFilterSheet"

const pad = (n: number) => String(n).padStart(2, "0")

const dateKey = (iso: string): string => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const dateLabel = (key: string): string => {
  const [y, m, day] = key.split("-").map(Number)
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const timeLabel = (iso: string): string => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface ExpenseListProps {
  expenses: ExpenseResponse[]
  initialFilter?: ExpenseFilter
}

interface DayGroup {
  key: string
  label: string
  items: ExpenseResponse[]
  total: number
}

export const ExpenseList = ({ expenses, initialFilter }: ExpenseListProps) => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<ExpenseFilter>(initialFilter ?? defaultFilter())
  const [sheetOpen, setSheetOpen] = useState(false)

  const usedCategories = useMemo<CategoryResponse[]>(() => {
    const map = new Map<string, CategoryResponse>()
    for (const e of expenses) {
      for (const c of e.categories) {
        if (!map.has(c.uuid)) map.set(c.uuid, c)
      }
    }
    return [...map.values()].toSorted((a, b) => a.position - b.position)
  }, [expenses])

  const filtered = useMemo(() => applyFilter(expenses, filter), [expenses, filter])

  const groups = useMemo<DayGroup[]>(() => {
    const sorted = [...filtered].toSorted(
      (a, b) => new Date(b.expensed_at).getTime() - new Date(a.expensed_at).getTime(),
    )
    const map = new Map<string, ExpenseResponse[]>()
    for (const e of sorted) {
      const k = dateKey(e.expensed_at)
      const list = map.get(k)
      if (list) {
        list.push(e)
      } else {
        map.set(k, [e])
      }
    }
    return [...map.entries()].map(([key, items]) => ({
      key,
      label: dateLabel(key),
      items,
      total: items.reduce((sum, e) => sum + e.amount, 0),
    }))
  }, [filtered])

  const fcount = filterCount(filter)
  const total = useMemo(() => filtered.reduce((sum, e) => sum + e.amount, 0), [filtered])

  return (
    <>
      <div className="flex shrink-0 items-baseline justify-between pt-2">
        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          Total
        </span>
        <span className="text-2xl font-bold tabular-nums">¥{total.toLocaleString()}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2 pt-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
          <MagnifyingGlassIcon className="size-4 shrink-0 text-gray-400" />
          <input
            type="text"
            value={filter.q}
            onChange={(e) => setFilter({ ...filter, q: e.target.value })}
            placeholder="Search expenses…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-gray-100"
          />
          {filter.q && (
            <button
              type="button"
              onClick={() => setFilter({ ...filter, q: "" })}
              aria-label="Clear search"
              className="shrink-0 text-gray-400"
            >
              <Cross2Icon className="size-3.5" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label="Filter"
          className={`relative flex size-10 shrink-0 items-center justify-center rounded-xl border ${
            fcount > 0
              ? "border-primary bg-primary text-white"
              : "border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          <MixerHorizontalIcon className="size-4" />
          {fcount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-gray-50 dark:ring-gray-900">
              {fcount}
            </span>
          )}
        </button>
      </div>

      <div className="flex shrink-0 gap-1.5 pt-2">
        {SCOPE_OPTIONS.map((s) => {
          const on = filter.scope === s.k
          return (
            <button
              key={s.k}
              type="button"
              onClick={() => setFilter({ ...filter, scope: s.k })}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                on
                  ? "bg-primary text-white"
                  : "border border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400"
              }`}
            >
              {s.short}
            </button>
          )
        })}
      </div>

      <ExpenseFilterChips
        filter={filter}
        categories={usedCategories}
        onOpen={() => setSheetOpen(true)}
        onClear={() => setFilter(defaultFilter())}
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          {expenses.length === 0 ? "No expenses yet" : "No matches for this filter"}
        </p>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pt-2">
          {groups.map((g) => (
            <section key={g.key}>
              <div className="mb-1.5 flex items-baseline justify-between px-1 text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                <h2>{g.label}</h2>
                <span className="tabular-nums">¥{g.total.toLocaleString()}</span>
              </div>
              <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
                {g.items.map((e) => {
                  const c = e.categories[0]
                  return (
                    <li key={e.uuid}>
                      <button
                        type="button"
                        onClick={() => navigate(`/expense/${e.uuid}`)}
                        className="flex w-full items-center gap-3 px-3.5 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-base dark:bg-gray-700">
                          {c ? categoryGlyph(c) : "·"}
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium">{e.name}</span>
                          <span className="truncate text-[11px] text-gray-400 dark:text-gray-500">
                            {c ? c.name : "Uncategorized"} · {timeLabel(e.expensed_at)}
                          </span>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          ¥{e.amount.toLocaleString()}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <ExpenseFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filter={filter}
        onApply={setFilter}
        categories={usedCategories}
      />
    </>
  )
}
