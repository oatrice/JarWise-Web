import { useState, useCallback } from 'react';

export interface MockUser {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

export interface AuthMockState {
    isLoggedIn: boolean;
    user: MockUser | null;
    syncStatus: SyncStatus;
    lastBackupTime: Date | null;
}

const MOCK_USER: MockUser = {
    id: 'mock-user-001',
    name: 'Anna Smith',
    email: 'anna@example.com',
    avatarUrl: 'https://ui-avatars.com/api/?name=Anna+Smith&background=6366f1&color=fff&size=128',
};

export function useAuthMock() {
    const [state, setState] = useState<AuthMockState>({
        isLoggedIn: false,
        user: null,
        syncStatus: 'idle',
        lastBackupTime: null,
    });

    const signIn = useCallback(() => {
        setState({
            isLoggedIn: true,
            user: MOCK_USER,
            syncStatus: 'success',
            lastBackupTime: new Date(),
        });
    }, []);

    const signOut = useCallback(() => {
        setState({
            isLoggedIn: false,
            user: null,
            syncStatus: 'idle',
            lastBackupTime: null,
        });
    }, []);

    const triggerBackup = useCallback(() => {
        setState(prev => ({ ...prev, syncStatus: 'syncing' }));
        // Simulate backup delay
        setTimeout(() => {
            setState(prev => ({
                ...prev,
                syncStatus: 'success',
                lastBackupTime: new Date(),
            }));
        }, 2000);
    }, []);

    const setSyncStatus = useCallback((status: SyncStatus) => {
        setState(prev => ({ ...prev, syncStatus: status }));
    }, []);

    return {
        ...state,
        signIn,
        signOut,
        triggerBackup,
        setSyncStatus,
    };
}
