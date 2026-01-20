import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { createRouter } from "./router";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
const router = createRouter();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <RouterProvider router={router} />
    </ConvexProvider>
  </StrictMode>
);
