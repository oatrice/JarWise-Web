export interface AuthUser {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
