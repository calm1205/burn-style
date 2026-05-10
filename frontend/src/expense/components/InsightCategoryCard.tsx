import { categoryGlyph } from "../../common/libs/category"
import { type CategoryStat, fmtAmount } from "../libs/insightStats"

interface InsightCategoryCardProps {
  cats: CategoryStat[]
}

export const InsightCategoryCard = ({ cats }: InsightCategoryCardProps) => {
  if (cats.length === 0) {
    return (
      <p className="py-2 text-sm text-gray-400 dark:text-gray-500">No expenses this month yet.</p>
    )
  }

  const total = cats.reduce((s, c) => s + c.amount, 0)

  return (
    <>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight tabular-nums">{fmtAmount(total)}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">total</span>
      </div>
      <div className="mt-3 flex h-3.5 gap-0.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        {cats.map((c, i) => (
          <div
            key={c.category?.uuid ?? "__none__"}
            style={{ width: `${c.pct}%`, opacity: 1 - i * 0.13 }}
            className="bg-primary"
          />
        ))}
      </div>
      <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
        {cats.map((c, i) => (
          <div key={c.category?.uuid ?? "__none__"} className="flex items-center gap-2.5 py-2">
            <div style={{ opacity: 1 - i * 0.13 }} className="size-2.5 rounded-sm bg-primary" />
            <span className="text-sm">{c.category ? categoryGlyph(c.category) : "·"}</span>
            <span className="flex-1 text-sm font-medium">
              {c.category ? c.category.name : "Uncategorized"}
            </span>
            <span className="text-[11px] text-gray-400 tabular-nums dark:text-gray-500">
              {fmtAmount(c.amount)}
            </span>
            <span className="min-w-10 text-right text-sm font-bold tabular-nums">
              {Math.round(c.pct)}%
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
