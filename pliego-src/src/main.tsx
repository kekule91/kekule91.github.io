import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Studio } from "@/components/studio";
import "./styles.css";

// El WebView de Android carga desde file://, que no es contexto seguro: no hay crypto.randomUUID.
if (typeof crypto !== "undefined" && !crypto.randomUUID) {
  (crypto as { randomUUID: () => string }).randomUUID = () =>
    "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
      (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
    ) as `${string}-${string}-${string}-${string}-${string}`;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Studio />
  </StrictMode>,
);
