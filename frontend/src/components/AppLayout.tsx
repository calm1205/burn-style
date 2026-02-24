import { DashboardIcon, Pencil2Icon, TokensIcon } from "@radix-ui/react-icons"
import { useCallback, useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router"
import { api } from "../lib/api"
import { STORAGE_KEYS } from "../lib/constants"
import type { UserResponse } from "../lib/types"
import { LayoutLaptop } from "./LayoutLaptop"
import { LayoutPhone } from "./LayoutPhone"

const navItems = [
  { label: "ダッシュボード", to: "/dashboard", icon: DashboardIcon },
  { label: "記帳", to: "/expenses", icon: Pencil2Icon },
  { label: "カテゴリ", to: "/categories", icon: TokensIcon },
]

export const AppLayout = () => {
  const navigate = useNavigate()
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
    navigate("/login")
  }

  return (
    <div className="flex h-screen">
      <LayoutLaptop
        navItems={navItems}
        userName={user?.name}
        onLogout={onLogout}
      />
      <main className="flex-1 overflow-y-auto pt-12 pb-16 md:pt-0 md:pb-0">
        <Outlet />
      </main>
      <LayoutPhone
        navItems={navItems}
        userName={user?.name}
        onLogout={onLogout}
      />
    </div>
  )
}
