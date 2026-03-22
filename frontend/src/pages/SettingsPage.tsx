import {
  CheckIcon,
  DownloadIcon,
  ExitIcon,
  Pencil1Icon,
  ResetIcon,
} from "@radix-ui/react-icons"
import { Button, Text } from "@radix-ui/themes"
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

  return (
    <div className="mx-auto max-w-2xl px-6">
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="mb-8">
        {editing ? (
          <div className="flex items-center gap-2">
            <Text size="3" weight="bold" as="span" className="shrink-0">
              Account
            </Text>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="flex-1 border-b border-gray-300 px-1 py-1 text-sm outline-none focus:border-gray-900"
            />
            <button
              type="button"
              onClick={handleUpdate}
              className="text-blue-500 hover:text-blue-700"
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
          <div className="flex items-center gap-2">
            <Text size="3" weight="bold" as="span">
              Account
            </Text>
            <Text size="2" color="gray" as="span">
              {user?.name ?? "---"}
            </Text>
            <button
              type="button"
              onClick={startEdit}
              className="text-gray-400 hover:text-gray-600"
            >
              <Pencil1Icon className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          color="gray"
          onClick={async () => {
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
          }}
        >
          <DownloadIcon />
          Export Data
        </Button>
        <Button variant="outline" color="red" onClick={onLogout}>
          <ExitIcon />
          Logout
        </Button>
        <Button variant="solid" color="red" onClick={openDialog}>
          Delete Account
        </Button>
      </div>

      <ConfirmDialog
        message="All your expense data will be permanently deleted. Are you sure?"
        onConfirm={handleDelete}
        dialogRef={dialogRef}
      />
    </div>
  )
}
