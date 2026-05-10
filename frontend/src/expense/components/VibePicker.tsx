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
  <div className="flex flex-col gap-2">
    <div className="flex items-baseline justify-between">
      <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
        Vibe
      </span>
      <span className="text-[10px] tracking-wide text-gray-400 dark:text-gray-500">
        pick one per row
      </span>
    </div>
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
        label="Routine"
        onClick={() => onPlanningChange(planning === "ROUTINE" ? null : "ROUTINE")}
      />
      {separator}
      <VibeChip
        active={planning === "SPONTANEOUS"}
        label="Spontaneous"
        onClick={() => onPlanningChange(planning === "SPONTANEOUS" ? null : "SPONTANEOUS")}
      />

      <VibeChip
        active={necessity === "NEEDED"}
        label="Needed it"
        onClick={() => onNecessityChange(necessity === "NEEDED" ? null : "NEEDED")}
      />
      {separator}
      <VibeChip
        active={necessity === "WANTED"}
        label="Wanted it"
        onClick={() => onNecessityChange(necessity === "WANTED" ? null : "WANTED")}
      />
    </div>
  </div>
)
