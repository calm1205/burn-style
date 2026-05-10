import type { VibeNecessity, VibePlanning, VibeSocial } from "../../common/libs/types"

interface VibePickerProps {
  social: VibeSocial | null
  planning: VibePlanning | null
  necessity: VibeNecessity | null
  onSocialChange: (v: VibeSocial | null) => void
  onPlanningChange: (v: VibePlanning | null) => void
  onNecessityChange: (v: VibeNecessity | null) => void
}

interface ChipProps {
  active: boolean
  label: string
  onClick: () => void
}

const Chip = ({ active, label, onClick }: ChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold transition-colors ${
      active
        ? "border-primary bg-primary text-white"
        : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }`}
  >
    {label}
  </button>
)

const Separator = () => (
  <div className="self-center h-px w-full bg-gray-200 opacity-60 dark:bg-gray-700" />
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
      <Chip
        active={social === "SOLO"}
        label="Solo"
        onClick={() => onSocialChange(social === "SOLO" ? null : "SOLO")}
      />
      <Separator />
      <Chip
        active={social === "WITH_SOMEONE"}
        label="With someone"
        onClick={() => onSocialChange(social === "WITH_SOMEONE" ? null : "WITH_SOMEONE")}
      />

      <Chip
        active={planning === "ROUTINE"}
        label="Routine"
        onClick={() => onPlanningChange(planning === "ROUTINE" ? null : "ROUTINE")}
      />
      <Separator />
      <Chip
        active={planning === "SPONTANEOUS"}
        label="Spontaneous"
        onClick={() => onPlanningChange(planning === "SPONTANEOUS" ? null : "SPONTANEOUS")}
      />

      <Chip
        active={necessity === "NEEDED"}
        label="Needed it"
        onClick={() => onNecessityChange(necessity === "NEEDED" ? null : "NEEDED")}
      />
      <Separator />
      <Chip
        active={necessity === "WANTED"}
        label="Wanted it"
        onClick={() => onNecessityChange(necessity === "WANTED" ? null : "WANTED")}
      />
    </div>
  </div>
)
