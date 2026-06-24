/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { isAxiosError } from 'axios';
import { create } from 'zustand';
import {
  fetchSessionCheck,
  fetchSessionLogin,
  fetchSessionLogout,
  fetchSessionRefresh,
} from './sessionApi';
import type { LoginDto, Session } from './types';
import { mapSessionPayload } from './types';

type SessionStatus = 'idle' | 'checking' | 'ready';

type SessionStoreState = {
  status: SessionStatus;
  session: Session | null;
  check: () => Promise<void>;
  revalidate: () => Promise<void>;
  refresh: () => Promise<void>;
  login: (data: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
};

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  status: 'idle',
  session: null,

  check: async () => {
    if (get().status === 'idle') {
      set({ status: 'checking' });
    }

    try {
      const payload = await fetchSessionCheck();
      set({
        status: 'ready',
        session: mapSessionPayload(payload),
      });
    } catch {
      set({
        status: 'ready',
        session: null,
      });
    }
  },

  revalidate: async () => {
    const previousSession = get().session;

    try {
      const payload = await fetchSessionCheck();
      set({
        status: 'ready',
        session: mapSessionPayload(payload),
      });
    } catch (error) {
      const isUnauthorized =
        isAxiosError(error) && error.response?.status === 401;

      set({
        status: 'ready',
        session: isUnauthorized ? null : previousSession,
      });
    }
  },

  refresh: async () => {
    try {
      const payload = await fetchSessionRefresh();
      set({
        status: 'ready',
        session: mapSessionPayload(payload),
      });
    } catch {
      set({
        status: 'ready',
        session: null,
      });
    }
  },

  login: async (data: LoginDto) => {
    await fetchSessionLogin(data);
    window.location.reload();
  },

  logout: async () => {
    await fetchSessionLogout();
    window.location.reload();
  },

  reset: () => {
    set({ status: 'idle', session: null });
  },
}));
