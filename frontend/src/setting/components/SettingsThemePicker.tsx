import { useState } from "react"

import { applyTheme, getStoredTheme, type ThemeMode } from "../../common/libs/theme"
import { SettingsSectionLabel } from "./SettingsSectionLabel"

const MODES: ThemeMode[] = ["system", "light", "dark"]
const LABELS: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
}

export const SettingsThemePicker = () => {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme)

  const change = (mode: ThemeMode) => {
    setTheme(mode)
    applyTheme(mode)
  }

  return (
    <div>
      <SettingsSectionLabel>Preferences</SettingsSectionLabel>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Theme</p>
        <div className="flex gap-2">
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => change(mode)}
              className={`flex-1 rounded-xl py-2 text-sm transition-colors ${
                theme === mode
                  ? "bg-primary text-white"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}
            >
              {LABELS[mode]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
