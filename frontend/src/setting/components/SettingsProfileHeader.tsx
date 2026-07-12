import { CheckIcon, Pencil1Icon, ResetIcon } from "../../common/icons"
import type { useSettingsActions } from "../hooks/useSettingsActions"

interface SettingsProfileHeaderProps {
  name: string | undefined
  actions: ReturnType<typeof useSettingsActions>
}

export const SettingsProfileHeader = ({ name, actions }: SettingsProfileHeaderProps) => {
  const {
    editing,
    name: draftName,
    loading,
    setName,
    startEdit,
    handleUpdate,
    setEditing,
  } = actions

  return (
    <div className="flex items-center gap-3.5 px-2 pt-2">
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="min-w-0 flex-1 border-b border-gray-300 px-1 py-0.5 text-lg font-bold tracking-tight outline-none focus:border-primary dark:border-gray-600 dark:bg-transparent dark:text-gray-100"
            />
            <button
              type="button"
              onClick={handleUpdate}
              disabled={loading}
              className="text-primary hover:text-primary-hover disabled:opacity-50"
            >
              <CheckIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <ResetIcon className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="flex w-full items-center gap-2 text-left"
          >
            <span className="truncate text-xl font-bold tracking-tight">{name ?? "---"}</span>
            <Pencil1Icon className="size-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
          </button>
        )}
      </div>
    </div>
  )
}
