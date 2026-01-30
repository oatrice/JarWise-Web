/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * TDD Tests for Transaction Storage Service
 * 
 * These tests define the expected behavior of localStorage persistence
 * for transactions before implementation.
 */

// Functions to be implemented
import {
    getTransactions,
    saveTransaction,
    clearTransactions,
    type Transaction,
} from '../utils/transactionStorage';

describe('Transaction Storage Service', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    describe('getTransactions', () => {
        it('should return empty array when no transactions exist', () => {
            const transactions = getTransactions();
            expect(transactions).toEqual([]);
        });

        it('should return saved transactions', () => {
            const mockTx: Transaction = {
                id: '1',
                amount: 100,
                jarId: 'necessities',
                note: 'Test',
                date: '2026-01-16T12:00:00Z',
                type: 'expense',
            };
            localStorage.setItem('jarwise_transactions', JSON.stringify([mockTx]));

            const transactions = getTransactions();
            expect(transactions).toHaveLength(1);
            expect(transactions[0]).toEqual(mockTx);
        });

        it('should return empty array if localStorage contains invalid JSON', () => {
            localStorage.setItem('jarwise_transactions', 'invalid json');

            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            const transactions = getTransactions();

            expect(transactions).toEqual([]);
            expect(consoleWarnSpy).toHaveBeenCalled();
            consoleWarnSpy.mockRestore();
        });
    });

    describe('saveTransaction', () => {
        it('should save a new transaction to localStorage', () => {
            const newTx: Transaction = {
                id: '1',
                amount: 500,
                jarId: 'education',
                note: 'Course fee',
                date: '2026-01-16T12:00:00Z',
                type: 'expense',
            };

            saveTransaction(newTx);

            const stored = JSON.parse(localStorage.getItem('jarwise_transactions') || '[]');
            expect(stored).toHaveLength(1);
            expect(stored[0]).toEqual(newTx);
        });

        it('should append to existing transactions', () => {
            const existingTx: Transaction = {
                id: '1',
                amount: 100,
                jarId: 'necessities',
                date: '2026-01-16T10:00:00Z',
                type: 'expense',
            };
            localStorage.setItem('jarwise_transactions', JSON.stringify([existingTx]));

            const newTx: Transaction = {
                id: '2',
                amount: 200,
                jarId: 'savings',
                date: '2026-01-16T12:00:00Z',
                type: 'expense',
            };

            saveTransaction(newTx);

            const stored = JSON.parse(localStorage.getItem('jarwise_transactions') || '[]');
            expect(stored).toHaveLength(2);
        });

        it('should add new transaction at the beginning (newest first)', () => {
            const existingTx: Transaction = {
                id: '1',
                amount: 100,
                jarId: 'necessities',

                date: '2026-01-16T10:00:00Z',
                type: 'expense',
            };
            localStorage.setItem('jarwise_transactions', JSON.stringify([existingTx]));

            const newTx: Transaction = {
                id: '2',
                amount: 200,
                jarId: 'savings',
                date: '2026-01-16T12:00:00Z',
                type: 'expense',
            };

            saveTransaction(newTx);

            const stored = JSON.parse(localStorage.getItem('jarwise_transactions') || '[]');
            expect(stored[0].id).toBe('2'); // New transaction first
            expect(stored[1].id).toBe('1');
        });

        it('should limit to 100 most recent transactions', () => {
            // Create 100 existing transactions
            const existingTxs: Transaction[] = Array.from({ length: 100 }, (_, i) => ({
                id: String(i),
                amount: 100,
                jarId: 'necessities',
                date: `2026-01-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
                type: 'expense' as const,
            }));
            localStorage.setItem('jarwise_transactions', JSON.stringify(existingTxs));

            const newTx: Transaction = {
                id: '101',
                amount: 999,
                jarId: 'play',
                date: '2026-02-01T12:00:00Z',
                type: 'expense',
            };

            saveTransaction(newTx);

            const stored = JSON.parse(localStorage.getItem('jarwise_transactions') || '[]');
            expect(stored).toHaveLength(100); // Still 100, oldest removed
            expect(stored[0].id).toBe('101'); // New one first
        });
    });

    describe('clearTransactions', () => {
        it('should remove all transactions from localStorage', () => {
            const mockTx: Transaction = {
                id: '1',
                amount: 100,
                jarId: 'necessities',
                date: '2026-01-16T12:00:00Z',
                type: 'expense',
            };
            localStorage.setItem('jarwise_transactions', JSON.stringify([mockTx]));

            clearTransactions();

            const stored = localStorage.getItem('jarwise_transactions');
            expect(stored).toBeNull();
        });
    });
});
