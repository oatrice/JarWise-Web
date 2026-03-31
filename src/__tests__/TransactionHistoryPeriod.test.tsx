import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

function buildTransaction(overrides: Partial<Transaction> & Pick<Transaction, 'id' | 'date' | 'amount'>): Transaction {
    return {
        id: overrides.id,
        amount: overrides.amount,
        note: overrides.note ?? overrides.id,
        date: overrides.date,
        type: overrides.type ?? 'expense',
        walletId: overrides.walletId ?? 'wallet-1',
        jarId: overrides.jarId ?? 'jar-1',
        relatedTransactionId: overrides.relatedTransactionId,
        toWalletId: overrides.toWalletId,
        status: overrides.status,
    };
}

describe('TransactionHistory period selection', () => {
    beforeEach(() => {
        observerCallbacks.length = 0;
        vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-03-31T12:00:00.000Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('updates the active label and visible transactions when switching to This Year', () => {
        const transactions = [
            buildTransaction({ id: 'march-1', note: 'March 1', amount: 10, date: '2026-03-25T12:00:00.000Z' }),
            buildTransaction({ id: 'march-2', note: 'March 2', amount: 20, date: '2026-03-02T12:00:00.000Z' }),
            buildTransaction({ id: 'jan-1', note: 'January 1', amount: 30, date: '2026-01-15T12:00:00.000Z' }),
            buildTransaction({ id: 'last-year', note: 'Last Year', amount: 40, date: '2025-12-20T12:00:00.000Z' }),
        ];

        render(
            <TransactionHistory
                onBack={vi.fn()}
                onNavigate={vi.fn()}
                transactions={transactions}
                onTransactionClick={vi.fn()}
            />,
        );

        expect(screen.getByText('This Month')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.queryByText('January 1')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Change Period' }));
        fireEvent.click(screen.getByRole('button', { name: 'This Year' }));

        expect(screen.getByText('This Year')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('January 1')).toBeInTheDocument();
        expect(screen.queryByText('Last Year')).not.toBeInTheDocument();
    });

    it('supports applying a custom range', () => {
        const transactions = [
            buildTransaction({ id: 'jan-early', note: 'Jan Early', amount: 10, date: '2026-01-05T12:00:00.000Z' }),
            buildTransaction({ id: 'jan-mid', note: 'Jan Mid', amount: 20, date: '2026-01-15T12:00:00.000Z' }),
            buildTransaction({ id: 'feb', note: 'February', amount: 30, date: '2026-02-05T12:00:00.000Z' }),
        ];

        render(
            <TransactionHistory
                onBack={vi.fn()}
                onNavigate={vi.fn()}
                transactions={transactions}
                onTransactionClick={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Change Period' }));
        fireEvent.click(screen.getByRole('button', { name: 'Custom Range' }));
        fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-01-10' } });
        fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-01-31' } });
        fireEvent.click(screen.getByRole('button', { name: 'Apply Range' }));

        expect(screen.getByText('Custom Range')).toBeInTheDocument();
        expect(screen.getByText('Jan Mid')).toBeInTheDocument();
        expect(screen.queryByText('Jan Early')).not.toBeInTheDocument();
        expect(screen.queryByText('February')).not.toBeInTheDocument();
    });

    it('keeps the previously applied period visible until a custom range is applied', () => {
        const transactions = [
            buildTransaction({ id: 'march-late', note: 'March Late', amount: 10, date: '2026-03-25T12:00:00.000Z' }),
            buildTransaction({ id: 'march-early', note: 'March Early', amount: 20, date: '2026-03-02T12:00:00.000Z' }),
            buildTransaction({ id: 'january', note: 'January', amount: 30, date: '2026-01-15T12:00:00.000Z' }),
        ];

        render(
            <TransactionHistory
                onBack={vi.fn()}
                onNavigate={vi.fn()}
                transactions={transactions}
                onTransactionClick={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Change Period' }));
        fireEvent.click(screen.getByRole('button', { name: 'Custom Range' }));

        expect(screen.getAllByText('This Month')).toHaveLength(2);
        expect(screen.getByText('March Late')).toBeInTheDocument();
        expect(screen.getByText('March Early')).toBeInTheDocument();
        expect(screen.queryByText('January')).not.toBeInTheDocument();
        expect(screen.queryByText('No transactions yet')).not.toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-01-01' } });
        fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-01-31' } });

        expect(screen.getAllByText('This Month')).toHaveLength(2);
        expect(screen.getByText('March Late')).toBeInTheDocument();
        expect(screen.queryByText('January')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Apply Range' }));

        expect(screen.getByText('Custom Range')).toBeInTheDocument();
        expect(screen.getByText('January')).toBeInTheDocument();
        expect(screen.queryByText('March Late')).not.toBeInTheDocument();
        expect(screen.queryByText('March Early')).not.toBeInTheDocument();
    });

    it('restores the previous period when a pending custom range is cancelled', () => {
        const transactions = [
            buildTransaction({ id: 'march', note: 'March', amount: 10, date: '2026-03-20T12:00:00.000Z' }),
            buildTransaction({ id: 'january', note: 'January', amount: 20, date: '2026-01-15T12:00:00.000Z' }),
        ];

        render(
            <TransactionHistory
                onBack={vi.fn()}
                onNavigate={vi.fn()}
                transactions={transactions}
                onTransactionClick={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Change Period' }));
        fireEvent.click(screen.getByRole('button', { name: 'Custom Range' }));
        fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-01-01' } });
        fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-01-31' } });
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(screen.getByText('This Month')).toBeInTheDocument();
        expect(screen.getByText('March')).toBeInTheDocument();
        expect(screen.queryByText('January')).not.toBeInTheDocument();
    });

    it('resets endless pagination back to the first batch when the period changes', async () => {
        const marchTransactions = Array.from({ length: 120 }, (_, index) => (
            buildTransaction({
                id: `march-${index + 1}`,
                note: `March ${index + 1}`,
                amount: index + 1,
                date: `2026-03-${String(31 - Math.floor(index / 4)).padStart(2, '0')}T12:00:00.000Z`,
            })
        ));
        const januaryTransactions = Array.from({ length: 50 }, (_, index) => (
            buildTransaction({
                id: `jan-${index + 1}`,
                note: `January ${index + 1}`,
                amount: index + 1,
                date: `2026-01-${String(31 - Math.floor(index / 2)).padStart(2, '0')}T12:00:00.000Z`,
            })
        ));

        render(
            <TransactionHistory
                onBack={vi.fn()}
                onNavigate={vi.fn()}
                transactions={[...marchTransactions, ...januaryTransactions]}
                onTransactionClick={vi.fn()}
            />,
        );

        expect(screen.getAllByTestId('transaction-card')).toHaveLength(100);

        act(() => {
            observerCallbacks[0]?.(
                [{ isIntersecting: true } as IntersectionObserverEntry],
                {} as IntersectionObserver,
            );
        });

        await act(async () => {
            vi.runAllTimers();
            await Promise.resolve();
        });

        expect(screen.getAllByTestId('transaction-card')).toHaveLength(120);

        fireEvent.click(screen.getByRole('button', { name: 'Change Period' }));
        fireEvent.click(screen.getByRole('button', { name: 'This Year' }));

        expect(screen.getAllByTestId('transaction-card')).toHaveLength(100);
    });
});
