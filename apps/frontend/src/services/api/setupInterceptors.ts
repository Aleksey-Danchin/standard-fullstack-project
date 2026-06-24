/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { apiClient } from './apiClient';
import { useSessionStore } from '../session/sessionStore';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _revalidateRetry?: boolean;
};

type PendingRetry = {
  resolve: (value: AxiosResponse) => void;
  reject: (reason: unknown) => void;
  config: RetryableRequestConfig;
};

let revalidateInFlight: Promise<boolean> | null = null;
let pendingRetries: PendingRetry[] = [];

function isSessionRequest(url: string | undefined): boolean {
  return url?.includes('/session') ?? false;
}

function enqueueRetry(config: RetryableRequestConfig): Promise<AxiosResponse> {
  return new Promise((resolve, reject) => {
    pendingRetries.push({ resolve, reject, config });
  });
}

function flushPendingRetries(success: boolean, rejectionReason: unknown): void {
  const queue = pendingRetries;
  pendingRetries = [];

  for (const { resolve, reject, config } of queue) {
    if (success) {
      void apiClient.request(config).then(resolve).catch(reject);
    } else {
      reject(rejectionReason);
    }
  }
}

function startRevalidate(failureReason: unknown): Promise<boolean> {
  if (revalidateInFlight) {
    return revalidateInFlight;
  }

  revalidateInFlight = (async () => {
    try {
      await useSessionStore.getState().revalidate();
      const success = useSessionStore.getState().session !== null;
      flushPendingRetries(success, failureReason);
      return success;
    } catch (error) {
      flushPendingRetries(false, error);
      return false;
    } finally {
      revalidateInFlight = null;
    }
  })();

  return revalidateInFlight;
}

async function handleUnauthorized(
  error: AxiosError,
): Promise<AxiosResponse | never> {
  const config = error.config as RetryableRequestConfig | undefined;

  if (!config || isSessionRequest(config.url)) {
    return Promise.reject(error);
  }

  if (config._revalidateRetry) {
    return Promise.reject(error);
  }

  config._revalidateRetry = true;

  const retryPromise = enqueueRetry(config);

  if (!revalidateInFlight) {
    void startRevalidate(error);
  }

  return retryPromise;
}

export function setupApiInterceptors(): void {
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        return handleUnauthorized(error);
      }

      return Promise.reject(error);
    },
  );
}
