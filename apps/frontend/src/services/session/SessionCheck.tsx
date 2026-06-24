/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { type ReactNode, useEffect } from 'react';
import { useSessionUser } from './useSessionUser';
import { useSessionRefreshTimer } from './useSessionRefreshTimer';

type SessionCheckProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

function SessionRefreshTimer() {
  useSessionRefreshTimer();
  return null;
}

export function SessionCheck({ children, fallback = null }: SessionCheckProps) {
  const { check, isChecking } = useSessionUser();

  useEffect(() => {
    void check();
  }, [check]);

  if (isChecking) {
    return <>{fallback}</>;
  }

  return (
    <>
      <SessionRefreshTimer />
      {children}
    </>
  );
}
