import { describe, it, expect } from 'vitest';
import { jars, transactions } from '../utils/generatedMockData';
import type { Jar, Transaction } from '../utils/generatedMockData';

describe('Generated Mock Data Integration', () => {
    it('should export jars array with correct structure', () => {
        expect(jars).toBeDefined();
        expect(Array.isArray(jars)).toBe(true);
        expect(jars.length).toBeGreaterThan(0);

        // Verify first jar has required properties
        const firstJar = jars[0] as Jar;
        expect(firstJar).toHaveProperty('id');
        expect(firstJar).toHaveProperty('name');
        expect(firstJar).toHaveProperty('current');
        expect(firstJar).toHaveProperty('goal');
        expect(firstJar).toHaveProperty('level');
        expect(firstJar).toHaveProperty('color');
        expect(firstJar).toHaveProperty('icon');
    });

    it('should export transactions array with correct structure', () => {
        expect(transactions).toBeDefined();
        expect(Array.isArray(transactions)).toBe(true);
        expect(transactions.length).toBeGreaterThan(0);

        // Verify first transaction has required properties
        const firstTransaction = transactions[0] as Transaction;
        expect(firstTransaction).toHaveProperty('id');
        expect(firstTransaction).toHaveProperty('merchant');
        expect(firstTransaction).toHaveProperty('amount');
        expect(firstTransaction).toHaveProperty('category');
        expect(firstTransaction).toHaveProperty('icon');
    });

    it('should have LucideIcon type for jar icons', () => {
        const firstJar = jars[0];
        expect(typeof firstJar.icon).toBe('function');
    });

    it('should have LucideIcon type for transaction icons', () => {
        const firstTransaction = transactions[0];
        expect(typeof firstTransaction.icon).toBe('function');
    });
});
