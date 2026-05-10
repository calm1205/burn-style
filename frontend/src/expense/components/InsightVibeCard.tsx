import type { VibeStat } from "../libs/insightStats"

interface InsightVibeCardProps {
  vibes: VibeStat[]
}

export const InsightVibeCard = ({ vibes }: InsightVibeCardProps) => {
  const top = vibes[0]
  if (!top) {
    return (
      <p className="py-2 text-sm text-gray-400 dark:text-gray-500">No vibe data this month yet.</p>
    )
  }

  return (
    <>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight tabular-nums">
          {Math.round(top.pct)}%
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          was {top.label.toLowerCase()}
        </span>
      </div>
      <div className="mt-3 flex h-3.5 gap-0.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        {vibes.map((v, i) => (
          <div
            key={v.key}
            style={{ width: `${v.pct}%`, opacity: 1 - i * 0.18 }}
            className="bg-primary"
          />
        ))}
      </div>
      <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-700">
        {vibes.map((v, i) => (
          <div key={v.key} className="flex items-center gap-2.5 py-2">
            <div style={{ opacity: 1 - i * 0.18 }} className="size-2.5 rounded-sm bg-primary" />
            <span className="flex-1 text-sm font-medium">{v.label}</span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {v.count} {v.count === 1 ? "time" : "times"}
            </span>
            <span className="min-w-9 text-right text-sm font-bold tabular-nums">
              {Math.round(v.pct)}%
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
