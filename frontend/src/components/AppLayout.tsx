import {
  BookmarkIcon,
  GearIcon,
  HomeIcon,
  PlusIcon,
} from "@radix-ui/react-icons"
import { useCallback, useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router"
import { api } from "../lib/api"
import { STORAGE_KEYS } from "../lib/constants"
import type { UserResponse } from "../lib/types"
import { LayoutLaptop } from "./LayoutLaptop"
import { LayoutPhone } from "./LayoutPhone"

const navItems = [
  { label: "Dashboard", to: "/", icon: HomeIcon },
  { label: "Category", to: "/category", icon: BookmarkIcon },
  { label: "Setting", to: "/setting", icon: GearIcon },
  { label: "Expense", to: "/expense/new", icon: PlusIcon },
]

const PAGE_TITLES: Record<string, string> = {
  "/": "BurnStyle",
  "/expense/new": "Expense",
  "/expense/monthly": "Monthly",
  "/expense/annual": "Annual",
  "/expense/template": "Template",
  "/expense/template/new": "Record",
  "/category": "Category",
  "/setting": "Setting",
}

const getPageTitle = (pathname: string): string =>
  PAGE_TITLES[pathname] ?? (pathname.startsWith("/expense/") ? "Expense" : "")

export const AppLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<UserResponse | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      setUser(await api.getMe())
    } catch {
      // 認証切れ時はclient.tsでリダイレクト済み
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const onLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.LAST_USERNAME)
    navigate("/signin")
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <LayoutLaptop
        navItems={navItems}
        userName={user?.name}
        onLogout={onLogout}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center border-b border-gray-100 px-4 py-3 dark:border-gray-700 md:hidden">
          <h1 className="text-lg font-bold">
            {getPageTitle(location.pathname)}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto pt-6 pb-20 md:pb-0">
          <Outlet context={{ user, onLogout, refreshUser: fetchUser }} />
        </main>
      </div>
      <LayoutPhone navItems={navItems} />
    </div>
  )
}
