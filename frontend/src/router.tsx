import { Navigate, createBrowserRouter } from "react-router"

import { AppLayout } from "./components/AppLayout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { ExpenseAnnualPage } from "./pages/ExpenseAnnualPage"
import { ExpenseDetailPage } from "./pages/ExpenseDetailPage"
import { ExpenseMonthlyPage } from "./pages/ExpenseMonthlyPage"
import { ExpensesPage } from "./pages/ExpensesPage"
import { ExpenseTemplatePage } from "./pages/ExpenseTemplatePage"
import { ExpenseTemplateRecordPage } from "./pages/ExpenseTemplateRecordPage"
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
          { path: "annual", element: <ExpenseAnnualPage /> },
          { path: "new", element: <ExpensesPage /> },
          { path: "template", element: <ExpenseTemplatePage /> },
          { path: "template/new", element: <ExpenseTemplateRecordPage /> },
          { path: ":uuid", element: <ExpenseDetailPage /> },
        ],
      },
      { path: "/setting", element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
])
