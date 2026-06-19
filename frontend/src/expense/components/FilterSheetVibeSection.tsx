import type { VibeNecessity, VibePlanning, VibeSocial } from "../../common/libs/types"
import { VibePicker } from "./VibePicker"

interface FilterSheetVibeSectionProps {
  social: VibeSocial | null
  planning: VibePlanning | null
  necessity: VibeNecessity | null
  onSocialChange: (v: VibeSocial | null) => void
  onPlanningChange: (v: VibePlanning | null) => void
  onNecessityChange: (v: VibeNecessity | null) => void
}

export const FilterSheetVibeSection = ({
  social,
  planning,
  necessity,
  onSocialChange,
  onPlanningChange,
  onNecessityChange,
}: FilterSheetVibeSectionProps) => {
  const hasSelection = social !== null || planning !== null || necessity !== null
  const clear = () => {
    onSocialChange(null)
    onPlanningChange(null)
    onNecessityChange(null)
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          Vibe
        </h3>
        {hasSelection && (
          <button type="button" onClick={clear} className="text-[11px] text-gray-400">
            clear
          </button>
        )}
      </div>
      <VibePicker
        social={social}
        planning={planning}
        necessity={necessity}
        onSocialChange={onSocialChange}
        onPlanningChange={onPlanningChange}
        onNecessityChange={onNecessityChange}
      />
    </section>
  )
}
