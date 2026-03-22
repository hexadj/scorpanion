export function getApiBaseUrl(): string {
    const raw = import.meta.env.VITE_API_BASE_URL;
    if (raw == null || String(raw).trim() === '') {
        throw new Error(
            'VITE_API_BASE_URL est manquant : copiez frontend/.env.example vers frontend/.env et définissez l’URL de l’API.',
        );
    }
    return String(raw).replace(/\/$/, '');
}