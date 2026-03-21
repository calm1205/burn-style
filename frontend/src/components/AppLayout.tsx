import {
  BookmarkIcon,
  GearIcon,
  HomeIcon,
  PlusIcon,
} from "@radix-ui/react-icons"
import { useCallback, useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router"
import { api } from "../lib/api"
import { STORAGE_KEYS } from "../lib/constants"
import type { UserResponse } from "../lib/types"
import { LayoutLaptop } from "./LayoutLaptop"
import { LayoutPhone } from "./LayoutPhone"

const navItems = [
  { label: "ダッシュボード", to: "/", icon: HomeIcon },
  { label: "カテゴリ", to: "/category", icon: BookmarkIcon },
  { label: "設定", to: "/setting", icon: GearIcon },
  { label: "記帳", to: "/expense/new", icon: PlusIcon },
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
    navigate("/signin")
  }

  return (
    <div className="flex h-screen">
      <LayoutLaptop
        navItems={navItems}
        userName={user?.name}
        onLogout={onLogout}
      />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet context={{ user, onLogout }} />
      </main>
      <LayoutPhone navItems={navItems} />
    </div>
  )
}
