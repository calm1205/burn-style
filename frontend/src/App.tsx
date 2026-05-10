import { RouterProvider } from "react-router"

import { GlobalLoadingBar } from "./common/components/GlobalLoadingBar"
import { router } from "./router"

export const App = () => {
  return (
    <>
      <GlobalLoadingBar />
      <RouterProvider router={router} />
    </>
  )
}
