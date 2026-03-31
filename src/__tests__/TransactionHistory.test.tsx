import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TransactionHistory from '../pages/TransactionHistory';
import type { Transaction } from '../utils/transactionStorage';

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
    it('renders transactions in fast initial chunks with a load more affordance for large imports', () => {
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

        expect(screen.getByText('Showing 100 of 250 transactions')).toBeInTheDocument();
        expect(screen.getAllByTestId('transaction-card')).toHaveLength(100);
        expect(screen.queryByText('Transaction 101')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Load 100 more transactions' }));

        expect(screen.getAllByTestId('transaction-card')).toHaveLength(200);
        expect(screen.getByText('Showing 200 of 250 transactions')).toBeInTheDocument();
    });
});
