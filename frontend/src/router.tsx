import { createBrowserRouter, Navigate } from "react-router"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardPage } from "./pages/DashboardPage"
import { LoginPage } from "./pages/LoginPage"
import { SignupPage } from "./pages/SignupPage"
import { SubscriptionTemplatesPage } from "./pages/SubscriptionTemplatesPage"

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
  {
    path: "/subscriptions",
    element: (
      <ProtectedRoute>
        <SubscriptionTemplatesPage />
      </ProtectedRoute>
    ),
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
])
