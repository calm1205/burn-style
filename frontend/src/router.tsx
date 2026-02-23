import { createBrowserRouter, Navigate } from "react-router"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardPage } from "./pages/DashboardPage"
import { LoginPage } from "./pages/LoginPage"
import { SignupPage } from "./pages/SignupPage"

export const router = createBrowserRouter([
  { path: "/signup", element: <SignupPage /> },
  { path: "/login", element: <LoginPage /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
])
