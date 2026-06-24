/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { useSessionStore } from './sessionStore';
import type { LoginDto, Session } from './types';

export type UseSessionUserResult = {
  isAuthenticated: boolean;
  session: Session | null;
  isChecking: boolean;
  refresh: () => Promise<void>;
  check: () => Promise<void>;
  login: (data: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
};

export function useSessionUser(): UseSessionUserResult {
  const session = useSessionStore((state) => state.session);
  const status = useSessionStore((state) => state.status);
  const check = useSessionStore((state) => state.check);
  const refresh = useSessionStore((state) => state.refresh);
  const login = useSessionStore((state) => state.login);
  const logout = useSessionStore((state) => state.logout);

  return {
    isAuthenticated: session !== null,
    session,
    isChecking: status === 'checking' || status === 'idle',
    refresh,
    check,
    login,
    logout,
  };
}
