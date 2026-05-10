import { BarChartIcon, HomeIcon, PersonIcon, PlusIcon, RowsIcon } from "@radix-ui/react-icons"
import { useCallback, useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router"

import { api } from "../libs/api"
import { STORAGE_KEYS } from "../libs/constants"
import type { UserResponse } from "../libs/types"
import { LayoutLaptop } from "./LayoutLaptop"
import { LayoutPhone } from "./LayoutPhone"

const navItems = [
  { label: "Today", to: "/", icon: HomeIcon },
  { label: "Expense", to: "/expense/monthly", icon: RowsIcon },
  { label: "Add", to: "/expense/new", icon: PlusIcon, accent: true },
  { label: "Insights", to: "/expense/annual", icon: BarChartIcon },
  { label: "You", to: "/setting", icon: PersonIcon },
]

export const AppLayout = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserResponse | null>(null)

  const fetchUser = useCallback(async () => {
    try {
      setUser(await api.getMe())
    } catch {
      // Redirect handled by client.ts on auth expiry
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
      <LayoutLaptop navItems={navItems} userName={user?.name} onLogout={onLogout} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pt-6 md:pb-0">
          <Outlet context={{ user, onLogout, refreshUser: fetchUser }} />
        </main>
      </div>
      <LayoutPhone navItems={navItems} />
    </div>
  )
}
