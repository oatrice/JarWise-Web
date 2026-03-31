import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TransactionHistory from '../pages/TransactionHistory';
import type { Transaction } from '../utils/transactionStorage';

const observerCallbacks: IntersectionObserverCallback[] = [];

class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '';
    readonly thresholds = [0];

    constructor(callback: IntersectionObserverCallback) {
        observerCallbacks.push(callback);
    }

    disconnect() { }
    observe() { }
    takeRecords() { return []; }
    unobserve() { }
}

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <div {...props}>{children}</div>
        ),
        header: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <header {...props}>{children}</header>
        ),
        section: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <section {...props}>{children}</section>
        ),
    },
}));

vi.mock('../components/TransactionCard', () => ({
    default: ({ transaction }: { transaction: Transaction }) => (
        <div data-testid="transaction-card">{transaction.note ?? transaction.id}</div>
    ),
}));

vi.mock('../components/BottomNav', () => ({
    default: () => null,
}));

vi.mock('../components/ReportFiltersSheet', () => ({
    default: () => null,
}));

vi.mock('../hooks/useScrollDirection', () => ({
    useScrollDirection: () => true,
}));

vi.mock('../context/CurrencyContext', () => ({
    useCurrency: () => ({
        formatAmount: (amount: number) => `$${amount.toFixed(2)}`,
    }),
}));

describe('TransactionHistory', () => {
    beforeEach(() => {
        observerCallbacks.length = 0;
        vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
        vi.useFakeTimers();
    });

    it('shows only a temporary loading indicator while the next batch is being appended', async () => {
        const transactions = Array.from({ length: 250 }, (_, index) => ({
            id: `tx-${index + 1}`,
            amount: index + 1,
            note: `Transaction ${index + 1}`,
            date: new Date(Date.UTC(2026, 0, 1, 0, index, 0)).toISOString(),
            type: 'expense' as const,
            walletId: 'wallet-1',
            jarId: 'jar-1',
        }));

        render(
            <TransactionHistory
                onBack={vi.fn()}
                onNavigate={vi.fn()}
                transactions={transactions}
                onTransactionClick={vi.fn()}
            />,
        );

        expect(screen.getAllByTestId('transaction-card')).toHaveLength(100);
        expect(screen.queryByText('Transaction 101')).not.toBeInTheDocument();
        expect(screen.queryByText('Showing 100 of 250 transactions')).not.toBeInTheDocument();
        expect(screen.queryByText(/More transactions will load automatically/i)).not.toBeInTheDocument();

        act(() => {
            observerCallbacks[0]?.(
                [{ isIntersecting: true } as IntersectionObserverEntry],
                {} as IntersectionObserver,
            );
        });

        expect(screen.getByText('Loading more transactions...')).toBeInTheDocument();

        await act(async () => {
            vi.runAllTimers();
            await Promise.resolve();
        });

        expect(screen.getAllByTestId('transaction-card')).toHaveLength(200);
        expect(screen.queryByText('Loading more transactions...')).not.toBeInTheDocument();
    });
});
