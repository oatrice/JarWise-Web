import { describe, it, expect } from 'vitest';
import type { Transaction } from './transactionStorage';

/**
 * Utility function to filter out the income side of linked transfers.
 * This keeps only the expense side visible in list views.
 */
export function filterVisibleTransactions(transactions: Transaction[]): Transaction[] {
    return transactions.filter(t => !(t.type === 'income' && t.relatedTransactionId));
}

/**
 * Utility function to find the linked transaction for a given transfer.
 */
export function findLinkedTransaction(
    transaction: Transaction,
    allTransactions: Transaction[]
): Transaction | undefined {
    if (!transaction.relatedTransactionId) return undefined;
    return allTransactions.find(t => t.id === transaction.relatedTransactionId);
}

describe('Transfer Utils', () => {
    const mockTransactions: Transaction[] = [
        // Normal expense
        {
            id: 'tx-1',
            amount: 500,
            jarId: 'necessities',
            walletId: 'wallet-1',
            note: 'Lunch',
            date: '2026-02-04T12:00:00Z',
            type: 'expense',
        },
        // Normal income
        {
            id: 'tx-2',
            amount: 50000,
            jarId: 'income',
            walletId: 'wallet-2',
            note: 'Salary',
            date: '2026-02-04T09:00:00Z',
            type: 'income',
        },
        // Transfer: Expense side (FROM Cash)
        {
            id: 'tx-3',
            amount: 1000,
            jarId: 'transfer',
            walletId: 'wallet-1',
            note: 'Transfer to Bank',
            date: '2026-02-04T10:00:00Z',
            type: 'expense',
            relatedTransactionId: 'tx-4',
        },
        // Transfer: Income side (TO Bank) - should be filtered out
        {
            id: 'tx-4',
            amount: 1000,
            jarId: 'transfer',
            walletId: 'wallet-2',
            note: 'Transfer from Cash',
            date: '2026-02-04T10:00:00Z',
            type: 'income',
            relatedTransactionId: 'tx-3',
        },
    ];

    describe('filterVisibleTransactions', () => {
        it('filters out income side of linked transfers', () => {
            const visible = filterVisibleTransactions(mockTransactions);

            // Should have 3 transactions (tx-1, tx-2, tx-3)
            expect(visible).toHaveLength(3);

            // tx-4 (income side of transfer) should be filtered out
            expect(visible.find(t => t.id === 'tx-4')).toBeUndefined();
        });

        it('keeps normal income transactions', () => {
            const visible = filterVisibleTransactions(mockTransactions);

            // tx-2 is normal income (no relatedTransactionId), should remain
            expect(visible.find(t => t.id === 'tx-2')).toBeDefined();
        });

        it('keeps expense side of transfers', () => {
            const visible = filterVisibleTransactions(mockTransactions);

            // tx-3 is expense side of transfer, should remain
            expect(visible.find(t => t.id === 'tx-3')).toBeDefined();
        });

        it('returns empty array for empty input', () => {
            expect(filterVisibleTransactions([])).toEqual([]);
        });
    });

    describe('findLinkedTransaction', () => {
        it('finds linked transaction by relatedTransactionId', () => {
            const expenseSide = mockTransactions[2]; // tx-3
            const linked = findLinkedTransaction(expenseSide, mockTransactions);

            expect(linked).toBeDefined();
            expect(linked?.id).toBe('tx-4');
        });

        it('returns undefined for transactions without relatedTransactionId', () => {
            const normalExpense = mockTransactions[0]; // tx-1
            const linked = findLinkedTransaction(normalExpense, mockTransactions);

            expect(linked).toBeUndefined();
        });

        it('returns undefined if linked transaction not found in list', () => {
            const orphanedTransfer: Transaction = {
                id: 'tx-orphan',
                amount: 500,
                jarId: 'transfer',
                walletId: 'wallet-1',
                note: 'Orphaned',
                date: '2026-02-04T10:00:00Z',
                type: 'expense',
                relatedTransactionId: 'tx-nonexistent',
            };

            const linked = findLinkedTransaction(orphanedTransfer, mockTransactions);
            expect(linked).toBeUndefined();
        });
    });
});
