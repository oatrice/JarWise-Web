import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, apiFetch } from '../lib/api';
import type { AuthStatus, AuthUser, SyncStatus } from '../types/auth';

interface AuthContextValue {
    status: AuthStatus;
    user: AuthUser | null;
    syncStatus: SyncStatus;
    lastSyncTime: Date | null;
    error: string | null;
    signInWithGoogle: (idToken: string) => Promise<void>;
    refreshSession: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthApiResponse {
    user: AuthUser;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>('loading');
    const [user, setUser] = useState<AuthUser | null>(null);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const applyAuthenticatedUser = (nextUser: AuthUser) => {
        setUser(nextUser);
        setStatus('authenticated');
        setSyncStatus('success');
        setLastSyncTime(new Date());
        setError(null);
    };

    const refreshSession = async () => {
        setSyncStatus('syncing');

        try {
            const response = await apiFetch<AuthApiResponse>('/auth/me');
            applyAuthenticatedUser(response.user);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                setUser(null);
                setStatus('unauthenticated');
                setSyncStatus('idle');
                setLastSyncTime(null);
                setError(null);
                return;
            }

            setStatus(prev => (prev === 'loading' ? 'unauthenticated' : prev));
            setSyncStatus('error');
            setError(err instanceof Error ? err.message : 'Failed to restore session');
        }
    };

    const signInWithGoogle = async (idToken: string) => {
        setSyncStatus('syncing');
        setError(null);

        try {
            const response = await apiFetch<AuthApiResponse>('/auth/google', {
                method: 'POST',
                body: JSON.stringify({ idToken }),
            });
            applyAuthenticatedUser(response.user);
        } catch (err) {
            setStatus('unauthenticated');
            setSyncStatus('error');
            setError(err instanceof Error ? err.message : 'Failed to sign in');
            throw err;
        }
    };

    const logout = async () => {
        try {
            await apiFetch<{ success: boolean }>('/auth/logout', {
                method: 'POST',
            });
        } catch {
            // We still clear local state even if the backend session has already expired.
        }

        setUser(null);
        setStatus('unauthenticated');
        setSyncStatus('idle');
        setLastSyncTime(null);
        setError(null);
    };

    useEffect(() => {
        void refreshSession();
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        status,
        user,
        syncStatus,
        lastSyncTime,
        error,
        signInWithGoogle,
        refreshSession,
        logout,
    }), [status, user, syncStatus, lastSyncTime, error]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
