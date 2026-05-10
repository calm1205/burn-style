interface TopHeatmapProps {
  year: number
  month: number
  today: number
  totals: number[]
  onSelectDay: (day: number) => void
}

export const TopHeatmap = ({ year, month, today, totals, onSelectDay }: TopHeatmapProps) => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDow = new Date(year, month - 1, 1).getDay()
  const max = Math.max(...totals, 0)

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-7 text-center text-[9px] font-semibold tracking-wide text-gray-400 dark:text-gray-500">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`sp${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const v = totals[i] ?? 0
          const isToday = day === today
          const isFuture = day > today
          const intensity = max > 0 ? 22 + (v / max) * 72 : 0
          const cellStyle =
            !isFuture && v > 0
              ? {
                  background: `color-mix(in oklab, var(--color-primary) ${intensity}%, #edf2f7)`,
                  color: v / max > 0.5 ? "#fff" : "#4a5568",
                }
              : undefined
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDay(day)}
              disabled={isFuture}
              style={cellStyle}
              className={`flex aspect-square items-center justify-center rounded-md text-[10px] font-semibold disabled:cursor-default ${
                isFuture
                  ? "border border-dashed border-gray-200 text-gray-300 dark:border-gray-700 dark:text-gray-600"
                  : isToday
                    ? "border-[1.5px] border-gray-900 dark:border-gray-100"
                    : v === 0
                      ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                      : ""
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
