import { createBrowserRouter, Navigate } from "react-router"
import { AppLayout } from "./components/AppLayout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { CategoriesPage } from "./pages/CategoriesPage"
import { ExpenseDetailPage } from "./pages/ExpenseDetailPage"
import { ExpenseMonthlyPage } from "./pages/ExpenseMonthlyPage"
import { ExpensesPage } from "./pages/ExpensesPage"
import { SettingsPage } from "./pages/SettingsPage"
import { SignInPage } from "./pages/SignInPage"
import { SignupPage } from "./pages/SignupPage"
import { TopPage } from "./pages/TopPage"

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
      { path: "/", element: <TopPage /> },
      {
        path: "/expense",
        children: [
          { path: "monthly", element: <ExpenseMonthlyPage /> },
          { path: "new", element: <ExpensesPage /> },
          { path: ":uuid", element: <ExpenseDetailPage /> },
        ],
      },
      { path: "/category", element: <CategoriesPage /> },
      { path: "/setting", element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
])
