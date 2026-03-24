import {
  CheckIcon,
  ChevronRightIcon,
  DownloadIcon,
  ExitIcon,
  Pencil1Icon,
  ResetIcon,
  TrashIcon,
} from "@radix-ui/react-icons"
import { useState } from "react"
import { useOutletContext } from "react-router"
import { ConfirmDialog, useConfirmDialog } from "../components/ConfirmDialog"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import { STORAGE_KEYS } from "../lib/constants"
import { applyTheme, getStoredTheme, type ThemeMode } from "../lib/theme"
import type { UserResponse } from "../lib/types"

interface OutletContext {
  user: UserResponse | null
  onLogout: () => void
  refreshUser: () => Promise<void>
}

export const SettingsPage = () => {
  const { user, onLogout, refreshUser } = useOutletContext<OutletContext>()
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme)
  const { dialogRef, open: openDialog } = useConfirmDialog()

  const changeTheme = (mode: ThemeMode) => {
    setTheme(mode)
    applyTheme(mode)
  }

  const startEdit = () => {
    setName(user?.name ?? "")
    setEditing(true)
  }

  const handleUpdate = async () => {
    setError("")
    try {
      await api.updateMe({ name })
      setEditing(false)
      await refreshUser()
    } catch (err) {
      setError(getErrorMessage(err, "Update failed"))
    }
  }

  const handleDelete = async () => {
    setError("")
    try {
      await api.deleteMe()
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      dialogRef.current?.close()
      window.location.href = "/auth"
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed"))
    }
  }

  const handleExport = async () => {
    try {
      const data = await api.exportMe()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `${user?.name ?? "export"}_expense.json`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (err) {
      setError(getErrorMessage(err, "Export failed"))
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6">
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Profile */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
          Username
        </p>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="flex-1 border-b border-gray-300 px-1 py-1 text-base outline-none focus:border-primary dark:border-gray-600 dark:bg-transparent dark:text-gray-100"
            />
            <button
              type="button"
              onClick={handleUpdate}
              className="text-primary hover:text-primary-hover"
            >
              <CheckIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <ResetIcon className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="flex w-full items-center justify-between"
          >
            <span className="text-base font-bold">{user?.name ?? "---"}</span>
            <Pencil1Icon className="size-3.5 text-gray-400 dark:text-gray-500" />
          </button>
        )}
      </div>

      {/* Theme */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">Theme</p>
        <div className="flex gap-2">
          {(["system", "light", "dark"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => changeTheme(mode)}
              className={`flex-1 rounded-xl py-2 text-sm transition-colors ${
                theme === mode
                  ? "bg-primary text-white"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}
            >
              {mode === "system"
                ? "System"
                : mode === "light"
                  ? "Light"
                  : "Dark"}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-gray-700 dark:bg-gray-800">
        <button
          type="button"
          onClick={handleExport}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <DownloadIcon className="size-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1">Export Data</span>
          <ChevronRightIcon className="size-4 text-gray-300 dark:text-gray-600" />
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ExitIcon className="size-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1">Logout</span>
          <ChevronRightIcon className="size-4 text-gray-300 dark:text-gray-600" />
        </button>
      </div>

      {/* Danger Zone */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800">
        <button
          type="button"
          onClick={openDialog}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
        >
          <TrashIcon className="size-4" />
          <span className="flex-1">Delete Account</span>
        </button>
      </div>

      <ConfirmDialog
        message="All your expense data will be permanently deleted. Are you sure?"
        onConfirm={handleDelete}
        dialogRef={dialogRef}
      />
    </div>
  )
}
