import { Outlet } from "react-router"
import { LayoutLaptop } from "./LayoutLaptop"
import { LayoutPhone } from "./LayoutPhone"

const navItems = [
  { label: "ダッシュボード", to: "/dashboard" },
  { label: "記帳", to: "/subscriptions" },
  { label: "カテゴリ", to: "/categories" },
]

export const AppLayout = () => {
  return (
    <div className="flex h-screen">
      <LayoutLaptop navItems={navItems} />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>
      <LayoutPhone navItems={navItems} />
    </div>
  )
}
