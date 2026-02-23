import { NavLink } from "react-router"

interface NavItem {
  label: string
  to: string
}

interface LayoutLaptopProps {
  navItems: NavItem[]
}

export const LayoutLaptop = ({ navItems }: LayoutLaptopProps) => {
  return (
    <aside className="hidden md:flex md:flex-col w-56 border-r border-gray-200 bg-white">
      <div className="p-4 font-bold text-lg border-b border-gray-200">
        Finance
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
