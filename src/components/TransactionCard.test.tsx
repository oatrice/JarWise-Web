import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionCard from './TransactionCard';
import type { Transaction } from '../utils/transactionStorage';
import { CurrencyProvider } from '../context/CurrencyContext';

// Wrapper to provide CurrencyContext
const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <CurrencyProvider>
            {ui}
        </CurrencyProvider>
    );
};

describe('TransactionCard', () => {
    const baseTransaction: Transaction = {
        id: 'tx-1',
        amount: 1000,
        jarId: 'necessities',
        walletId: 'wallet-1',
        note: 'Grocery shopping',
        date: '2026-02-04T10:00:00Z',
        type: 'expense',
    };

    const linkedTransaction: Transaction = {
        id: 'tx-2',
        amount: 1000,
        jarId: 'transfer',
        walletId: 'wallet-2',
        note: 'Transfer from Cash',
        date: '2026-02-04T10:00:00Z',
        type: 'income',
        relatedTransactionId: 'tx-1',
    };

    const transferTransaction: Transaction = {
        ...baseTransaction,
        id: 'tx-3',
        jarId: 'transfer',
        note: 'Transfer to Bank',
        relatedTransactionId: 'tx-2',
    };

    describe('Normal Transaction Rendering', () => {
        it('renders note as title for normal expense', () => {
            renderWithProviders(<TransactionCard transaction={baseTransaction} />);
            expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
        });

        it('renders amount with minus sign for expense', () => {
            renderWithProviders(<TransactionCard transaction={baseTransaction} />);
            // Amount should contain the formatted value with minus
            expect(screen.getByText(/-.*1,000/)).toBeInTheDocument();
        });

        it('renders amount with plus sign for income', () => {
            const incomeTransaction: Transaction = {
                ...baseTransaction,
                type: 'income',
                note: 'Salary',
            };
            renderWithProviders(<TransactionCard transaction={incomeTransaction} />);
            expect(screen.getByText(/\+.*1,000/)).toBeInTheDocument();
        });
    });

    describe('Transfer Rendering (isTransfer=true)', () => {
        it('renders "From → To" title when linkedTransaction is provided', () => {
            renderWithProviders(
                <TransactionCard
                    transaction={transferTransaction}
                    isTransfer={true}
                    linkedTransaction={linkedTransaction}
                />
            );
            // Should show wallet names: Cash → Bank Account
            expect(screen.getByText(/Cash.*→.*Bank Account/)).toBeInTheDocument();
        });

        it('renders "Transfer from [Wallet]" when no linkedTransaction', () => {
            renderWithProviders(
                <TransactionCard
                    transaction={transferTransaction}
                    isTransfer={true}
                />
            );
            expect(screen.getByText(/Transfer from Cash/)).toBeInTheDocument();
        });

        it('renders "Transfer" subtitle', () => {
            renderWithProviders(
                <TransactionCard
                    transaction={transferTransaction}
                    isTransfer={true}
                    linkedTransaction={linkedTransaction}
                />
            );
            expect(screen.getByText('Transfer')).toBeInTheDocument();
        });

        it('renders amount without +/- prefix for transfers', () => {
            renderWithProviders(
                <TransactionCard
                    transaction={transferTransaction}
                    isTransfer={true}
                    linkedTransaction={linkedTransaction}
                />
            );
            // Should NOT have + or - prefix
            const amountElement = screen.getByText(/1,000/);
            expect(amountElement.textContent).not.toMatch(/^[+-]/);
        });
    });

    describe('Draft Transaction Rendering', () => {
        it('renders draft badge for draft transactions', () => {
            const draftTransaction: Transaction = {
                ...baseTransaction,
                status: 'draft',
            };
            renderWithProviders(<TransactionCard transaction={draftTransaction} />);
            expect(screen.getByText('Draft')).toBeInTheDocument();
        });
    });
});
