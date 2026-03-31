import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Dashboard from '../pages/Dashboard';
import type { Transaction } from '../utils/transactionStorage';

vi.mock('framer-motion', () => ({
    motion: {
        header: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <header {...props}>{children}</header>
        ),
        h1: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <h1 {...props}>{children}</h1>
        ),
    },
}));

vi.mock('../components/JarCard', () => ({
    default: () => <div>Jar Card</div>,
}));

vi.mock('../components/TransactionCard', () => ({
    default: ({ transaction }: { transaction: Transaction }) => (
        <div data-testid="transaction-card">{transaction.note ?? transaction.id}</div>
    ),
}));

vi.mock('../pages/ScanPage', () => ({
    default: () => <div>Scan Page</div>,
}));

vi.mock('../pages/ImportSlip', () => ({
    default: () => <div>Import Slip</div>,
}));

vi.mock('../pages/SettingsOverlay', () => ({
    default: () => <div>Settings Overlay</div>,
}));

vi.mock('../pages/ManageJars', () => ({
    default: () => <div>Manage Jars</div>,
}));

vi.mock('../components/BottomNav', () => ({
    default: () => null,
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: {
            name: 'Test User',
            email: 'test@example.com',
            avatarUrl: '',
        },
        syncStatus: 'success',
        lastSyncTime: null,
        refreshSession: vi.fn(),
        logout: vi.fn(),
    }),
}));

vi.mock('../context/CurrencyContext', () => ({
    useCurrency: () => ({
        currency: 'THB',
        setCurrency: vi.fn(),
        formatAmount: (amount: number) => `${amount.toFixed(2)}`,
    }),
}));

vi.mock('../hooks/useScrollDirection', () => ({
    useScrollDirection: () => true,
}));

vi.mock('../utils/transactionStorage', async () => {
    const actual = await vi.importActual<typeof import('../utils/transactionStorage')>('../utils/transactionStorage');
    return {
        ...actual,
        getDrafts: () => [],
    };
});

describe('Dashboard recent activity', () => {
    it('renders only a small recent subset instead of the full imported transaction list', () => {
        const transactions = Array.from({ length: 30 }, (_, index) => ({
            id: `tx-${index + 1}`,
            amount: index + 1,
            note: `Transaction ${index + 1}`,
            date: new Date(Date.UTC(2026, 0, 31, 0, 30 - index, 0)).toISOString(),
            type: 'expense' as const,
            walletId: 'wallet-1',
            jarId: 'jar-1',
        }));

        render(
            <Dashboard
                onNavigate={vi.fn()}
                transactions={transactions}
                totalBalance={1234}
                onTransactionClick={vi.fn()}
                jars={[]}
                manageJarsData={[]}
            />,
        );

        expect(screen.getAllByTestId('transaction-card')).toHaveLength(15);
        expect(screen.queryByText('Transaction 16')).not.toBeInTheDocument();
    });
});
