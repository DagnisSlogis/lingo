import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import posthog from "posthog-js";
import { createRouter } from "./router";

posthog.init(import.meta.env.VITE_POSTHOG_KEY as string, {
  api_host: "https://eu.i.posthog.com",
  person_profiles: "identified_only",
});

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
const router = createRouter();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <RouterProvider router={router} />
    </ConvexProvider>
  </StrictMode>
);
