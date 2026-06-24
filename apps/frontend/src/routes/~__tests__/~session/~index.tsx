import { useCallback, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { fetchUsers } from "__frontend/global/usersApi";
import { apiClient } from "__frontend/services/api";
import {
  LoginForm,
  LogoutForm,
  useSessionUser,
} from "__frontend/services/session";

export const Route = createFileRoute("/__tests__/session/")({
  component: SessionTestPage,
});

type LogEntry = {
  id: number;
  time: string;
  message: string;
  ok: boolean;
};

function SessionTestPage() {
  const { isAuthenticated, session, isChecking, check, refresh, login } =
    useSessionUser();
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const appendLog = useCallback((message: string, ok: boolean) => {
    const time = new Date().toISOString().slice(11, 19);
    const id = Date.now();
    setLogs((prev) => [{ id, time, message, ok }, ...prev].slice(0, 30));
  }, []);

  async function runAction(
    label: string,
    action: () => Promise<unknown>,
  ): Promise<void> {
    try {
      await action();
      appendLog(`${label}: OK`, true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Request failed";
      appendLog(`${label}: ${message}`, false);
    }
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6" data-testid="session-test-page">
      <header>
        <h1 className="text-2xl font-bold">Session E2E Test</h1>
        <p className="text-base-content/70 text-sm">
          Страница для ручного и автоматического тестирования сессий, apiClient и
          401-retry.
        </p>
      </header>

      <div className="card bg-base-200 shadow-sm">
        <div className="card-body gap-2">
          <h2 className="card-title text-lg">Состояние</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt>isChecking</dt>
            <dd data-testid="state-is-checking">{String(isChecking)}</dd>
            <dt>isAuthenticated</dt>
            <dd data-testid="state-is-authenticated">{String(isAuthenticated)}</dd>
            <dt>login</dt>
            <dd data-testid="state-login">{session?.user.login ?? "—"}</dd>
            <dt>sessionId</dt>
            <dd data-testid="state-session-id" className="break-all font-mono text-xs">
              {session?.sessionId ?? "—"}
            </dd>
            <dt>accessExpiresAt</dt>
            <dd data-testid="state-access-expires">
              {session?.accessExpiresAt.toISOString() ?? "—"}
            </dd>
          </dl>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg">Login</h2>
            <p className="text-sm text-base-content/70">
              Успех: root / 123. Ошибка: wrong / wrong.
            </p>
            <div data-testid="login-form-slot">
              <LoginForm />
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              data-testid="btn-login-bad"
              onClick={() =>
                void runAction("login (bad credentials)", () =>
                  login({ login: "wrong", password: "wrong" }),
                )
              }
            >
              Login with bad credentials
            </button>
          </div>
        </div>

        <div className="card bg-base-200 shadow-sm">
          <div className="card-body gap-3">
            <h2 className="card-title text-lg">Session actions</h2>
            <div data-testid="logout-form-slot">
              <LogoutForm />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                data-testid="btn-check"
                onClick={() => void runAction("check", check)}
              >
                Check
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                data-testid="btn-refresh"
                onClick={() => void runAction("refresh", refresh)}
              >
                Refresh
              </button>
              <button
                type="button"
                className="btn btn-sm btn-accent"
                data-testid="btn-fetch-users"
                onClick={() =>
                  void runAction("GET /users", async () => {
                    const users = await fetchUsers();
                    appendLog(`GET /users: ${users.length} user(s)`, true);
                  })
                }
              >
                Fetch users
              </button>
              <button
                type="button"
                className="btn btn-sm btn-warning"
                data-testid="btn-protected-probe"
                onClick={() =>
                  void runAction("GET /session/list", async () => {
                    await apiClient.get("/session/list");
                  })
                }
              >
                Fetch session list
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                data-testid="btn-reload"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-lg">Log</h2>
          <ul className="max-h-64 space-y-1 overflow-y-auto font-mono text-xs" data-testid="test-log">
            {logs.length === 0 && (
              <li className="text-base-content/50">No actions yet.</li>
            )}
            {logs.map((entry) => (
              <li
                key={entry.id}
                data-testid="test-log-entry"
                data-ok={String(entry.ok)}
                className={entry.ok ? "text-success" : "text-error"}
              >
                [{entry.time}] {entry.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
