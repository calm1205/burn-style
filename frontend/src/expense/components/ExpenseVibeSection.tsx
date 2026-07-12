import type { VibeNecessity, VibePlanning, VibeSocial } from "../../common/libs/types"
import { VibePicker } from "./VibePicker"

interface ExpenseVibeSectionProps {
  social: VibeSocial | null
  planning: VibePlanning | null
  necessity: VibeNecessity | null
  onSocialChange: (v: VibeSocial | null) => void
  onPlanningChange: (v: VibePlanning | null) => void
  onNecessityChange: (v: VibeNecessity | null) => void
}

export const ExpenseVibeSection = (props: ExpenseVibeSectionProps) => {
  return (
    <div className="flex flex-col gap-2 px-5 pt-5">
      <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
        Vibe
      </span>
      <VibePicker
        social={props.social}
        planning={props.planning}
        necessity={props.necessity}
        onSocialChange={props.onSocialChange}
        onPlanningChange={props.onPlanningChange}
        onNecessityChange={props.onNecessityChange}
      />
    </div>
  )
}
