interface InsightSectionProps {
  title: string
  children: React.ReactNode
  /** カードのpadding。デフォルト p-5 */
  padding?: string
  className?: string
}

export const InsightSection = ({
  title,
  children,
  padding = "p-5",
  className = "",
}: InsightSectionProps) => (
  <div className={className}>
    <div className="mb-2.5 px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
      {title}
    </div>
    <div
      className={`${padding} rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800`}
    >
      {children}
    </div>
  </div>
)
