import { PersonIcon } from "@radix-ui/react-icons"
import { Popover } from "radix-ui"
import { NavLink } from "react-router"

interface NavItem {
  label: string
  to: string
}

interface LayoutPhoneProps {
  navItems: NavItem[]
  userName?: string
  onLogout: () => void
}

export const LayoutPhone = ({
  navItems,
  userName,
  onLogout,
}: LayoutPhoneProps) => {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <span className="font-bold text-lg">Finance</span>
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <PersonIcon className="size-4" />
              <span>{userName ?? "..."}</span>
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="bottom"
              sideOffset={4}
              align="end"
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
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-gray-200 bg-white md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 items-center justify-center py-3 text-xs font-medium ${isActive ? "text-gray-900" : "text-gray-500"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
