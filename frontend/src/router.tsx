import { Navigate, createBrowserRouter } from "react-router"

import { SignInPage } from "./auth/pages/SignInPage"
import { SignupPage } from "./auth/pages/SignupPage"
import { CategoriesPage } from "./category/pages/CategoriesPage"
import { CategoryEditPage } from "./category/pages/CategoryEditPage"
import { AppLayout } from "./common/components/AppLayout"
import { ProtectedRoute } from "./common/components/ProtectedRoute"
import { RecurringExpenseEditPage } from "./expense-recurring/pages/RecurringExpenseEditPage"
import { RecurringExpenseListPage } from "./expense-recurring/pages/RecurringExpenseListPage"
import { ExpenseDetailPage } from "./expense/pages/ExpenseDetailPage"
import { ExpenseInsightPage } from "./expense/pages/ExpenseInsightPage"
import { ExpenseMonthlyPage } from "./expense/pages/ExpenseMonthlyPage"
import { ExpensesPage } from "./expense/pages/ExpensesPage"
import { TopPage } from "./expense/pages/TopPage"
import { SettingsPage } from "./setting/pages/SettingsPage"

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
      { path: "/insight", element: <ExpenseInsightPage /> },
      {
        path: "/expense",
        children: [
          { path: "monthly", element: <ExpenseMonthlyPage /> },
          { path: "new", element: <ExpensesPage /> },
          { path: "recurring", element: <RecurringExpenseListPage /> },
          { path: "recurring/new", element: <RecurringExpenseEditPage /> },
          { path: "recurring/:uuid", element: <RecurringExpenseEditPage /> },
          { path: ":uuid", element: <ExpenseDetailPage /> },
        ],
      },
      {
        path: "/category",
        children: [
          { index: true, element: <CategoriesPage /> },
          { path: "new", element: <CategoryEditPage /> },
          { path: ":uuid", element: <CategoryEditPage /> },
        ],
      },
      { path: "/setting", element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
])
