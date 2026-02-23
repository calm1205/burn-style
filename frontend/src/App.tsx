import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import LoginPage from "./pages/LoginPage"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
