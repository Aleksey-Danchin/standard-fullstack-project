import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { fetchUsers } from "__frontend/global/usersApi";
import { queryClient } from "__frontend/global/queryClient";
import { AuthCheck, LogoutForm } from "__frontend/services/session";

export const Route = createFileRoute("/users/")({
  component: UsersPage,
});

function UsersPage() {
  return (
    <AuthCheck>
      <UsersPageContent />
    </AuthCheck>
  );
}

function UsersPageContent() {
  const {
    data: users,
    isPending,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return (
    <section className="users-page">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">Users</h1>
        <LogoutForm />
      </div>
      {isPending && <p>Loading…</p>}
      {error && (
        <p role="alert">
          Failed to load users:{" "}
          {error instanceof Error ? error.message : "Request failed"}
        </p>
      )}
      {users && (
        <ul className="mt-4 divide-y">
          {users.map((user) => (
            <li key={user.id} className="py-2">
              <strong>{user.login}</strong>
              <span className="text-base-content/60"> — {user.id}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        className="btn btn-primary"
        onClick={() => {
          queryClient.resetQueries({ queryKey: ["users"] });
        }}
      >
        Reset users list cache
      </button>
    </section>
  );
}
