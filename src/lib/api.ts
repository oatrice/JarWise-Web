export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api/v1';

export class ApiError extends Error {
    status: number;
    details?: unknown;

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
    if (!isFormData && !headers.has('Content-Type') && init.body) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers,
        credentials: 'include',
    });

    if (!response.ok) {
        const contentType = response.headers.get('content-type') ?? '';
        let details: unknown;
        let message = `Request failed with status ${response.status}`;

        if (contentType.includes('application/json')) {
            details = await response.json();
            if (details && typeof details === 'object' && 'message' in details && typeof details.message === 'string') {
                message = details.message;
            }
        } else {
            const text = await response.text();
            if (text.trim()) {
                message = text;
            }
            details = text;
        }

        throw new ApiError(message, response.status, details);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}
