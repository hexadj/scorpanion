import type { User } from '@/models/types';
import { getApiBaseUrl } from './api.utils';

/** GET user/getAll — liste des comptes (pour composition de partie). */
export async function getAllUsers(): Promise<User[]> {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/user/getAll`);
    if (!res.ok) {
        throw new Error(`getAllUsers: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<User[]>;
}
