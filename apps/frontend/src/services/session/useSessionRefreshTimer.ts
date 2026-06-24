/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { useEffect } from 'react';
import { SESSION_CHECK_LEAD_MS } from './constants';
import { useSessionStore } from './sessionStore';

export function useSessionRefreshTimer(): void {
  const session = useSessionStore((state) => state.session);
  const check = useSessionStore((state) => state.check);

  useEffect(() => {
    if (!session) {
      return;
    }

    const delay = session.accessExpiresAt.getTime() - Date.now() - SESSION_CHECK_LEAD_MS;
    const timeoutId = window.setTimeout(() => {
      void check();
    }, Math.max(0, delay));

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [session, check]);
}
