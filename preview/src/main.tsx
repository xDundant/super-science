import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast"

// Toast providers wrap the app, as the coss ui Toast docs describe.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider position="bottom-center">
      <AnchoredToastProvider>
        <App />
      </AnchoredToastProvider>
    </ToastProvider>
  </StrictMode>,
)
