import { Theme } from "@radix-ui/themes"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { App } from "./App.tsx"
import { initTheme } from "./lib/theme.ts"

initTheme()

const root = document.getElementById("root") as HTMLElement
createRoot(root).render(
  <StrictMode>
    <Theme>
      <App />
    </Theme>
  </StrictMode>,
)
