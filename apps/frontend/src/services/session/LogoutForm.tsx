/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { useState } from 'react';
import { useSessionUser } from './useSessionUser';

export function LogoutForm() {
  const { logout, session } = useSessionUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setError(null);
    setIsSubmitting(true);
    try {
      await logout();
    } catch {
      setError('Logout failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {session && (
        <p className="text-sm text-base-content/70">
          Signed in as <strong>{session.user.login}</strong>
        </p>
      )}

      <button
        className="btn btn-outline btn-sm w-fit"
        type="button"
        onClick={() => void handleLogout()}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing out…' : 'Sign out'}
      </button>

      {error && (
        <p className="text-error text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
