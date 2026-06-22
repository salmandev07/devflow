import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

import { ThemeProvider } from "./context/ThemeContext";
import { TeamProvider } from "./context/TeamContext";
import { ToastProvider } from "./context/ToastContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TeamProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </TeamProvider>
    </ThemeProvider>
  </StrictMode>
);