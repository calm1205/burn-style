import { createBrowserRouter, Navigate } from "react-router"
import { AppLayout } from "./components/AppLayout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { CategoriesPage } from "./pages/CategoriesPage"
import { DashboardPage } from "./pages/DashboardPage"
import { ExpenseDetailPage } from "./pages/ExpenseDetailPage"
import { ExpensesPage } from "./pages/ExpensesPage"
import { SettingsPage } from "./pages/SettingsPage"
import { SignInPage } from "./pages/SignInPage"
import { SignupPage } from "./pages/SignupPage"

export const router = createBrowserRouter([
  { path: "/signup", element: <SignupPage /> },
  { path: "/signin", element: <SignInPage /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      {
        path: "/expense",
        children: [
          { index: true, element: <ExpensesPage /> },
          { path: ":uuid", element: <ExpenseDetailPage /> },
        ],
      },
      { path: "/category", element: <CategoriesPage /> },
      { path: "/setting", element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
])
