/** Réponse API login */
export interface User {
    id: string;
    username: string;
}

/** Corps des requêtes create */
export interface UserCredentials {
    username: string;
    password: string;
}
