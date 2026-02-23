import { createBrowserRouter, Navigate } from "react-router"
import { AppLayout } from "./components/AppLayout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { CategoriesPage } from "./pages/CategoriesPage"
import { DashboardPage } from "./pages/DashboardPage"
import { ExpensesPage } from "./pages/ExpensesPage"
import { LoginPage } from "./pages/LoginPage"
import { SignupPage } from "./pages/SignupPage"

export const router = createBrowserRouter([
  { path: "/signup", element: <SignupPage /> },
  { path: "/login", element: <LoginPage /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/expenses", element: <ExpensesPage /> },
      { path: "/categories", element: <CategoriesPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
])
