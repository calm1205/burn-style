interface SettingsSectionLabelProps {
  children: React.ReactNode
}

export const SettingsSectionLabel = ({ children }: SettingsSectionLabelProps) => (
  <div className="px-2 pb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
    {children}
  </div>
)
