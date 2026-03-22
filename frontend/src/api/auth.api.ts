import type { User, UserCredentials } from '@/models/types';
import { getApiBaseUrl } from './api.utils';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

export class RegisterConflictError extends Error {
    constructor() {
        super('Ce nom d’utilisateur est déjà pris.');
        this.name = 'RegisterConflictError';
    }
}

/** POST user/create — renvoie l’id du compte créé (201). */
export async function registerUser(credentials: UserCredentials): Promise<string> {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/user/create`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
        }),
    });
    if (res.status === 409) {
        throw new RegisterConflictError();
    }
    if (!res.ok) {
        throw new Error(`Inscription : ${res.status} ${res.statusText}`);
    }
    const body: unknown = await res.json();
    return typeof body === 'string' ? body : String(body);
}

/** POST user/login — renvoie le profil utilisateur (200). */
export async function loginUser(credentials: UserCredentials): Promise<User> {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/user/login`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
        }),
    });
    if (res.status === 401) {
        throw new LoginUnauthorizedError();
    }
    if (!res.ok) {
        throw new Error(`Connexion : ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<User>;
}

export class LoginUnauthorizedError extends Error {
    constructor() {
        super('Nom d’utilisateur ou mot de passe incorrect.');
        this.name = 'LoginUnauthorizedError';
    }
}
