import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { ApiError, apiFetch } from '../lib/api';
import type { AuthStatus, AuthUser, SyncStatus } from '../types/auth';
import { AuthContext, type AuthContextValue } from './useAuth';

interface AuthApiResponse {
    user: AuthUser;
}

interface AuthState {
    status: AuthStatus;
    user: AuthUser | null;
    syncStatus: SyncStatus;
    lastSyncTime: Date | null;
    error: string | null;
}

type AuthAction =
    | { type: 'refresh_started' }
    | { type: 'sign_in_started' }
    | { type: 'authenticated'; user: AuthUser; syncedAt: Date }
    | { type: 'unauthenticated' }
    | { type: 'refresh_failed'; error: string }
    | { type: 'sign_in_failed'; error: string };

const INITIAL_AUTH_STATE: AuthState = {
    status: 'loading',
    user: null,
    syncStatus: 'idle',
    lastSyncTime: null,
    error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'refresh_started':
            return {
                ...state,
                syncStatus: 'syncing',
            };
        case 'sign_in_started':
            return {
                ...state,
                syncStatus: 'syncing',
                error: null,
            };
        case 'authenticated':
            return {
                status: 'authenticated',
                user: action.user,
                syncStatus: 'success',
                lastSyncTime: action.syncedAt,
                error: null,
            };
        case 'unauthenticated':
            return {
                status: 'unauthenticated',
                user: null,
                syncStatus: 'idle',
                lastSyncTime: null,
                error: null,
            };
        case 'refresh_failed':
            return {
                ...state,
                status: state.status === 'loading' ? 'unauthenticated' : state.status,
                syncStatus: 'error',
                error: action.error,
            };
        case 'sign_in_failed':
            return {
                status: 'unauthenticated',
                user: null,
                syncStatus: 'error',
                lastSyncTime: null,
                error: action.error,
            };
        default:
            return state;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, INITIAL_AUTH_STATE);

    const refreshSession = useCallback(async () => {
        dispatch({ type: 'refresh_started' });

        try {
            const response = await apiFetch<AuthApiResponse>('/auth/me');
            dispatch({
                type: 'authenticated',
                user: response.user,
                syncedAt: new Date(),
            });
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                dispatch({ type: 'unauthenticated' });
                return;
            }

            dispatch({
                type: 'refresh_failed',
                error: err instanceof Error ? err.message : 'Failed to restore session',
            });
        }
    }, []);

    const signInWithGoogle = useCallback(async (idToken: string) => {
        dispatch({ type: 'sign_in_started' });

        try {
            const response = await apiFetch<AuthApiResponse>('/auth/google', {
                method: 'POST',
                body: JSON.stringify({ idToken }),
            });
            dispatch({
                type: 'authenticated',
                user: response.user,
                syncedAt: new Date(),
            });
        } catch (err) {
            dispatch({
                type: 'sign_in_failed',
                error: err instanceof Error ? err.message : 'Failed to sign in',
            });
            throw err;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiFetch<{ success: boolean }>('/auth/logout', {
                method: 'POST',
            });
        } catch {
            // We still clear local state even if the backend session has already expired.
        }

        dispatch({ type: 'unauthenticated' });
    }, []);

    useEffect(() => {
        void refreshSession();
    }, [refreshSession]);

    const value = useMemo<AuthContextValue>(() => ({
        status: state.status,
        user: state.user,
        syncStatus: state.syncStatus,
        lastSyncTime: state.lastSyncTime,
        error: state.error,
        signInWithGoogle,
        refreshSession,
        logout,
    }), [logout, refreshSession, signInWithGoogle, state.error, state.lastSyncTime, state.status, state.syncStatus, state.user]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
