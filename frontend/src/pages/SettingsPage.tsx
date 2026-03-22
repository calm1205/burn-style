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
  const { dialogRef, open: openDialog } = useConfirmDialog()

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
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Profile */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="mb-1 text-xs text-gray-500">Username</p>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="flex-1 border-b border-gray-300 px-1 py-1 text-base outline-none focus:border-primary"
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
              className="text-gray-400 hover:text-gray-600"
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
            <Pencil1Icon className="size-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm">
        <button
          type="button"
          onClick={handleExport}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
          <DownloadIcon className="size-4 text-gray-400" />
          <span className="flex-1">Export Data</span>
          <ChevronRightIcon className="size-4 text-gray-300" />
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 hover:bg-gray-50"
        >
          <ExitIcon className="size-4 text-gray-400" />
          <span className="flex-1">Logout</span>
          <ChevronRightIcon className="size-4 text-gray-300" />
        </button>
      </div>

      {/* Danger Zone */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <button
          type="button"
          onClick={openDialog}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-red-600 hover:bg-red-50"
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
