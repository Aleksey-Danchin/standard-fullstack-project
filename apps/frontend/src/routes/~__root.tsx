import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { SessionCheck } from "__frontend/services/session";

export const Route = createRootRoute({
  component: () => (
    <SessionCheck
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-base-100">
          <span className="loading loading-spinner loading-lg" />
        </div>
      }
    >
      <div className="flex min-h-screen bg-base-100">
        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <TanStackRouterDevtools />
        <ReactQueryDevtools initialIsOpen={false} />
      </div>
    </SessionCheck>
  ),
});
