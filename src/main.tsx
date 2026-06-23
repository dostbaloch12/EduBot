import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./auth";
import { I18nProvider } from "./i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </AuthProvider>
  </StrictMode>
);
