import type { VibeNecessity, VibePlanning, VibeSocial } from "../../common/libs/types"

interface VibePickerProps {
  social: VibeSocial | null
  planning: VibePlanning | null
  necessity: VibeNecessity | null
  onSocialChange: (v: VibeSocial | null) => void
  onPlanningChange: (v: VibePlanning | null) => void
  onNecessityChange: (v: VibeNecessity | null) => void
}

interface AxisProps<T extends string> {
  current: T | null
  options: { value: T; label: string }[]
  onChange: (v: T | null) => void
}

const Axis = <T extends string>({ current, options, onChange }: AxisProps<T>) => (
  <div className="flex gap-2">
    {options.map((opt) => {
      const on = current === opt.value
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(on ? null : opt.value)}
          className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
            on
              ? "border-primary bg-primary text-white"
              : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {opt.label}
        </button>
      )
    })}
  </div>
)

export const VibePicker = ({
  social,
  planning,
  necessity,
  onSocialChange,
  onPlanningChange,
  onNecessityChange,
}: VibePickerProps) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs text-gray-500 dark:text-gray-400">Vibe</span>
    <Axis
      current={social}
      onChange={onSocialChange}
      options={[
        { value: "SOLO", label: "Solo" },
        { value: "WITH_SOMEONE", label: "With someone" },
      ]}
    />
    <Axis
      current={planning}
      onChange={onPlanningChange}
      options={[
        { value: "ROUTINE", label: "Routine" },
        { value: "SPONTANEOUS", label: "Spontaneous" },
      ]}
    />
    <Axis
      current={necessity}
      onChange={onNecessityChange}
      options={[
        { value: "NEEDED", label: "Needed it" },
        { value: "WANTED", label: "Wanted it" },
      ]}
    />
  </div>
)
