import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./i18n";

import { AuthInitializer } from "@/components/auth/AuthInitializer";

import { Router } from "./Router";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthInitializer>
      <RouterProvider router={Router} />
    </AuthInitializer>
  </StrictMode>,
);
