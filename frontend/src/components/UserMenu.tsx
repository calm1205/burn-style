import { PersonIcon } from "@radix-ui/react-icons"
import { Popover } from "radix-ui"

interface UserMenuProps {
  userName?: string
  onLogout: () => void
}

export const UserMenu = ({ userName, onLogout }: UserMenuProps) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <PersonIcon className="size-4 shrink-0" />
          <span className="truncate">{userName ?? "..."}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={4}
          className="rounded-md border border-gray-200 bg-white p-1 shadow-md"
        >
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
          >
            ログアウト
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
