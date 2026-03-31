import { createContext, useContext } from 'react';
import type { AuthStatus, AuthUser, SyncStatus } from '../types/auth';

export interface AuthContextValue {
    status: AuthStatus;
    user: AuthUser | null;
    syncStatus: SyncStatus;
    lastSyncTime: Date | null;
    error: string | null;
    signInWithGoogle: (idToken: string) => Promise<void>;
    refreshSession: () => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
