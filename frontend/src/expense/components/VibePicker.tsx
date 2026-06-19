import type { VibeNecessity, VibePlanning, VibeSocial } from "../../common/libs/types"
import { VibeChip } from "./VibeChip"

interface VibePickerProps {
  social: VibeSocial | null
  planning: VibePlanning | null
  necessity: VibeNecessity | null
  onSocialChange: (v: VibeSocial | null) => void
  onPlanningChange: (v: VibePlanning | null) => void
  onNecessityChange: (v: VibeNecessity | null) => void
}

const separator = (
  <div className="h-px w-full self-center bg-gray-200 opacity-60 dark:bg-gray-700" />
)

export const VibePicker = ({
  social,
  planning,
  necessity,
  onSocialChange,
  onPlanningChange,
  onNecessityChange,
}: VibePickerProps) => (
  <div className="grid grid-cols-[1fr_12px_1fr] gap-y-1.5">
    <VibeChip
      active={social === "SOLO"}
      label="Solo"
      onClick={() => onSocialChange(social === "SOLO" ? null : "SOLO")}
    />
    {separator}
    <VibeChip
      active={social === "WITH_SOMEONE"}
      label="With someone"
      onClick={() => onSocialChange(social === "WITH_SOMEONE" ? null : "WITH_SOMEONE")}
    />

    <VibeChip
      active={planning === "ROUTINE"}
      label="Habitual"
      onClick={() => onPlanningChange(planning === "ROUTINE" ? null : "ROUTINE")}
    />
    {separator}
    <VibeChip
      active={planning === "SPONTANEOUS"}
      label="Impulsive"
      onClick={() => onPlanningChange(planning === "SPONTANEOUS" ? null : "SPONTANEOUS")}
    />

    <VibeChip
      active={necessity === "NEEDED"}
      label="Need"
      onClick={() => onNecessityChange(necessity === "NEEDED" ? null : "NEEDED")}
    />
    {separator}
    <VibeChip
      active={necessity === "WANTED"}
      label="Want"
      onClick={() => onNecessityChange(necessity === "WANTED" ? null : "WANTED")}
    />
  </div>
)
