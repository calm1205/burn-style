import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { LoginPage } from "./pages/LoginPage"
import { SignupPage } from "./pages/SignupPage"

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
