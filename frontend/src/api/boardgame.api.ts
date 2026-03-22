import type { BoardGame } from '@/models/types';
import { getApiBaseUrl } from './api.utils';

export async function getBoardgames(): Promise<BoardGame[]> {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/boardgame/getAll`);
    if (!res.ok) {
        throw new Error(`getBoardgames: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<BoardGame[]>;
}
