import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Window } from "~/components/Window";
import { MenuBar } from "~/components/MenuBar";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="desktop">
      <Window title="Lingo">
        <MenuBar />
        <div className="window-content">
          <Outlet />
        </div>
      </Window>
    </div>
  );
}
