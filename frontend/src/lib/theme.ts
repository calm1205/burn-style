import { STORAGE_KEYS } from "./constants"

export type ThemeMode = "system" | "light" | "dark"

const VALID_MODES: ThemeMode[] = ["system", "light", "dark"]

export const getStoredTheme = (): ThemeMode => {
  const stored = localStorage.getItem(STORAGE_KEYS.THEME)
  return VALID_MODES.includes(stored as ThemeMode)
    ? (stored as ThemeMode)
    : "system"
}

const isDarkPreferred = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches

const applyClass = (dark: boolean) => {
  document.documentElement.classList.toggle("dark", dark)
}

export const applyTheme = (mode: ThemeMode) => {
  localStorage.setItem(STORAGE_KEYS.THEME, mode)
  applyClass(mode === "dark" || (mode === "system" && isDarkPreferred()))
}

export const initTheme = () => {
  const mode = getStoredTheme()
  applyClass(mode === "dark" || (mode === "system" && isDarkPreferred()))

  if (mode === "system") {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (getStoredTheme() === "system") {
          applyClass(e.matches)
        }
      })
  }
}
