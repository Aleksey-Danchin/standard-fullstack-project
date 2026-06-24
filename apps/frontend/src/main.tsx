/**
 * @scaffold-integration — scaffold wiring point.
 * Add your imports/providers; avoid rewriting scaffold core unless needed. See SCAFFOLD.md
 */


import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { setupApiInterceptors } from "./services/api";
import { queryClient } from "./global/queryClient";
import { router } from "./global/router";
import "./index.css";

setupApiInterceptors();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
