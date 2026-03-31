import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

const authState = {
    status: 'authenticated' as 'authenticated' | 'unauthenticated' | 'loading',
    user: {
        id: 'user-1',
        email: 'tester@example.com',
        name: 'Test User',
        avatarUrl: '',
    },
    syncStatus: 'success' as const,
    lastSyncTime: null,
    error: null,
    signInWithGoogle: vi.fn(),
    refreshSession: vi.fn(),
    logout: vi.fn(),
};

const fetchTransactionsMock = vi.fn();
const fetchWalletsMock = vi.fn();
const fetchJarsMock = vi.fn();
const getTransactionsMock = vi.fn(() => []);

function createDeferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

vi.mock('../context/useAuth', () => ({
    useAuth: () => authState,
}));

vi.mock('../lib/api', () => ({
    fetchTransactions: () => fetchTransactionsMock(),
    fetchWallets: () => fetchWalletsMock(),
    fetchJars: () => fetchJarsMock(),
}));

vi.mock('../utils/transactionStorage', () => ({
    getTransactions: () => getTransactionsMock(),
    saveTransaction: vi.fn(),
}));

vi.mock('../utils/constants', () => ({
    resetCatalogs: vi.fn(),
    setJarCatalog: vi.fn(),
    setWalletCatalog: vi.fn(),
}));

vi.mock('../pages/Dashboard', () => ({
    default: ({
        totalBalance,
        onNavigate,
    }: {
        totalBalance?: number;
        onNavigate?: (page: 'history') => void;
    }) => (
        <div>
            <div>Dashboard total {totalBalance ?? 0}</div>
            <button type="button" onClick={() => onNavigate?.('history')}>
                Go to history
            </button>
        </div>
    ),
}));

vi.mock('../pages/TransactionHistory', () => ({
    default: () => <div>Transaction History Screen</div>,
}));

vi.mock('../pages/AddTransaction', () => ({
    default: () => <div>Add Transaction Screen</div>,
}));

vi.mock('../pages/LoginScreen', () => ({
    default: () => <div>Login Screen</div>,
}));

vi.mock('../pages/TransactionDetail', () => ({
    default: () => <div>Transaction Detail Screen</div>,
}));

vi.mock('../pages/ManageWallets', () => ({
    default: () => <div>Manage Wallets Screen</div>,
}));

vi.mock('../pages/SettingsOverlay', () => ({
    default: () => <div>Settings Screen</div>,
}));

vi.mock('../pages/MigrationUploadScreen', () => ({
    default: () => <div>Migration Upload Screen</div>,
}));

vi.mock('../pages/MigrationStatusScreen', () => ({
    default: () => <div>Migration Status Screen</div>,
}));

vi.mock('../pages/ReportsPage', () => ({
    default: () => <div>Reports Screen</div>,
}));

describe('App authenticated data hydration', () => {
    beforeEach(() => {
        fetchTransactionsMock.mockReset();
        fetchWalletsMock.mockReset();
        fetchJarsMock.mockReset();
        getTransactionsMock.mockReset();
        getTransactionsMock.mockReturnValue([]);
    });

    it('shows a blocking loading state instead of rendering a zeroed dashboard while authenticated data is still loading', async () => {
        const transactionsDeferred = createDeferred<Array<{
            id: string;
            amount: number;
            description?: string;
            date: string;
            type: 'income' | 'expense' | 'transfer';
            wallet_id: string;
            jar_id?: string;
        }>>();
        const walletsDeferred = createDeferred<Array<{
            id: string;
            name: string;
            currency: string;
            balance: number;
            type: string;
        }>>();
        const jarsDeferred = createDeferred<Array<{
            id: string;
            name: string;
            type: string;
        }>>();

        fetchTransactionsMock.mockReturnValueOnce(transactionsDeferred.promise);
        fetchWalletsMock.mockReturnValueOnce(walletsDeferred.promise);
        fetchJarsMock.mockReturnValueOnce(jarsDeferred.promise);

        render(<App />);

        expect(screen.getByText('Loading your data')).toBeInTheDocument();
        expect(screen.queryByText('Dashboard total 0')).not.toBeInTheDocument();

        transactionsDeferred.resolve([]);
        walletsDeferred.resolve([
            {
                id: 'wallet-1',
                name: 'Main Wallet',
                currency: 'THB',
                balance: 100,
                type: 'cash',
            },
        ]);
        jarsDeferred.resolve([]);

        await waitFor(() => {
            expect(screen.getByText('Dashboard total 100')).toBeInTheDocument();
        });
    });

    it('returns to the dashboard after logging out and signing in again instead of restoring a stale subpage', async () => {
        fetchTransactionsMock.mockResolvedValue([]);
        fetchWalletsMock.mockResolvedValue([
            {
                id: 'wallet-1',
                name: 'Main Wallet',
                currency: 'THB',
                balance: 100,
                type: 'cash',
            },
        ]);
        fetchJarsMock.mockResolvedValue([]);

        const { rerender } = render(<App />);

        await waitFor(() => {
            expect(screen.getByText('Dashboard total 100')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Go to history' }));
        expect(screen.getByText('Transaction History Screen')).toBeInTheDocument();

        authState.status = 'unauthenticated';
        rerender(<App />);
        expect(screen.getByText('Login Screen')).toBeInTheDocument();

        authState.status = 'authenticated';
        rerender(<App />);

        await waitFor(() => {
            expect(screen.getByText('Dashboard total 100')).toBeInTheDocument();
        });
        expect(screen.queryByText('Transaction History Screen')).not.toBeInTheDocument();
    });
});
