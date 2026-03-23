import type { PlayerResult } from '@/models/types';
import { getApiBaseUrl } from './api.utils';

export async function getHistoryByUserId(userId: string): Promise<PlayerResult[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/history/user/${userId}`);
  if (!res.ok) {
    throw new Error(`getHistoryByUserId: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as PlayerResult[];
}
