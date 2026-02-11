/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Functions to be implemented
import {
    getSubTransactions,
    saveSubTransaction,
    deleteSubTransaction,
    getSubTransactionsByParentId,
    type SubTransaction,
} from '../utils/subTransactionStorage';

describe('SubTransaction Storage Service', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    describe('saveSubTransaction', () => {
        it('should save a new sub-transaction', () => {
            const newSubTx: SubTransaction = {
                id: 'sub-1',
                parentId: 'tx-1',
                description: 'Milk',
                amount: 45.0,
                // category is optional
            };

            saveSubTransaction(newSubTx);

            const stored = JSON.parse(localStorage.getItem('jarwise_sub_transactions') || '[]');
            expect(stored).toHaveLength(1);
            expect(stored[0]).toEqual(newSubTx);
        });

        it('should append to existing sub-transactions', () => {
            const existingSubTx: SubTransaction = {
                id: 'sub-1',
                parentId: 'tx-1',
                description: 'Milk',
                amount: 45.0,
            };
            localStorage.setItem('jarwise_sub_transactions', JSON.stringify([existingSubTx]));

            const newSubTx: SubTransaction = {
                id: 'sub-2',
                parentId: 'tx-1',
                description: 'Bread',
                amount: 35.0,
            };

            saveSubTransaction(newSubTx);

            const stored = JSON.parse(localStorage.getItem('jarwise_sub_transactions') || '[]');
            expect(stored).toHaveLength(2);
        });
    });

    describe('getSubTransactions', () => {
        it('should return all sub-transactions', () => {
            const mockData: SubTransaction[] = [
                { id: 'sub-1', parentId: 'tx-1', description: 'Item 1', amount: 10 },
                { id: 'sub-2', parentId: 'tx-2', description: 'Item 2', amount: 20 },
            ];
            localStorage.setItem('jarwise_sub_transactions', JSON.stringify(mockData));

            const result = getSubTransactions();
            expect(result).toEqual(mockData);
        });

        it('should return empty array if storage is empty', () => {
            const result = getSubTransactions();
            expect(result).toEqual([]);
        });
    });

    describe('getSubTransactionsByParentId', () => {
        it('should return only sub-transactions for the given parent ID', () => {
            const mockData: SubTransaction[] = [
                { id: 'sub-1', parentId: 'tx-1', description: 'Item 1', amount: 10 },
                { id: 'sub-2', parentId: 'tx-2', description: 'Item 2', amount: 20 },
                { id: 'sub-3', parentId: 'tx-1', description: 'Item 3', amount: 30 },
            ];
            localStorage.setItem('jarwise_sub_transactions', JSON.stringify(mockData));

            const result = getSubTransactionsByParentId('tx-1');
            expect(result).toHaveLength(2);
            expect(result.map(i => i.id)).toContain('sub-1');
            expect(result.map(i => i.id)).toContain('sub-3');
            expect(result.map(i => i.id)).not.toContain('sub-2');
        });
    });

    describe('deleteSubTransaction', () => {
        it('should remove the specified sub-transaction', () => {
            const mockData: SubTransaction[] = [
                { id: 'sub-1', parentId: 'tx-1', description: 'Item 1', amount: 10 },
                { id: 'sub-2', parentId: 'tx-1', description: 'Item 2', amount: 20 },
            ];
            localStorage.setItem('jarwise_sub_transactions', JSON.stringify(mockData));

            deleteSubTransaction('sub-1');

            const stored = JSON.parse(localStorage.getItem('jarwise_sub_transactions') || '[]');
            expect(stored).toHaveLength(1);
            expect(stored[0].id).toBe('sub-2');
        });
    });
});
