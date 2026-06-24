/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import type { ReactNode } from 'react';
import { LoginForm } from './LoginForm';
import { useSessionUser, type UseSessionUserResult } from './useSessionUser';

type AuthCheckProps = {
  children: ReactNode;
  loginForm?: ReactNode;
  checker?: (data: UseSessionUserResult) => boolean;
};

export function AuthCheck({
  children,
  loginForm = <LoginForm />,
  checker = (data) => data.isAuthenticated,
}: AuthCheckProps) {
  const sessionData = useSessionUser();

  if (checker(sessionData)) {
    return <>{children}</>;
  }

  return <>{loginForm}</>;
}
