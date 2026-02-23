import { Outlet, useNavigate } from "react-router"
import { STORAGE_KEYS } from "../lib/constants"
import { LayoutLaptop } from "./LayoutLaptop"
import { LayoutPhone } from "./LayoutPhone"

const navItems = [
  { label: "ダッシュボード", to: "/dashboard" },
  { label: "記帳", to: "/subscriptions" },
  { label: "カテゴリ", to: "/categories" },
]

export const AppLayout = () => {
  const navigate = useNavigate()

  const onLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    navigate("/login")
  }

  return (
    <div className="flex h-screen">
      <LayoutLaptop navItems={navItems} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto pt-12 pb-16 md:pt-0 md:pb-0">
        <Outlet />
      </main>
      <LayoutPhone navItems={navItems} onLogout={onLogout} />
    </div>
  )
}
