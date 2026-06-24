/**
 * @scaffold-core — fullstack scaffold (каркас).
 * Avoid edits: changes complicate merge when syncing template updates.
 * Extend in your own modules. See SCAFFOLD.md
 */


import { apiClient } from '../api';
import type { LoginDto, SessionPayloadDto } from './types';

const sessionBase = '/session';

export async function fetchSessionCheck(): Promise<SessionPayloadDto> {
  const { data } = await apiClient.get<SessionPayloadDto>(`${sessionBase}/check`);
  return data;
}

export async function fetchSessionRefresh(): Promise<SessionPayloadDto> {
  const { data } = await apiClient.post<SessionPayloadDto>(`${sessionBase}/refresh`);
  return data;
}

export async function fetchSessionLogin(body: LoginDto): Promise<SessionPayloadDto> {
  const { data } = await apiClient.post<SessionPayloadDto>(`${sessionBase}/login`, body);
  return data;
}

export async function fetchSessionLogout(): Promise<{ ok: true }> {
  const { data } = await apiClient.post<{ ok: true }>(`${sessionBase}/logout`);
  return data;
}
