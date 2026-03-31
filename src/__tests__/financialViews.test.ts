import { describe, expect, it } from 'vitest';
import type { ApiJar, ApiWallet } from '../lib/api';
import type { Transaction } from '../utils/transactionStorage';
import {
    deriveDashboardJars,
    deriveManageJars,
    deriveTotalBalance,
    deriveWalletViews,
} from '../utils/importedViews';

describe('importedViews', () => {
    const wallets: ApiWallet[] = [
        { id: 'wallet-1', name: 'Cash', currency: 'THB', balance: 0, type: 'general' },
        { id: 'wallet-2', name: 'Bank', currency: 'THB', balance: 0, type: 'general' },
    ];

    const jars: ApiJar[] = [
        { id: 'jar-income', name: 'Salary', type: 'income' },
        { id: 'jar-expense', name: 'Food', type: 'expense' },
    ];

    const transactions: Transaction[] = [
        {
            id: 'tx-income',
            amount: 1000,
            jarId: 'jar-income',
            walletId: 'wallet-1',
            date: '2026-01-01T00:00:00.000Z',
            type: 'income',
        },
        {
            id: 'tx-expense',
            amount: 250,
            jarId: 'jar-expense',
            walletId: 'wallet-1',
            date: '2026-01-02T00:00:00.000Z',
            type: 'expense',
        },
        {
            id: 'tx-transfer',
            amount: 50,
            walletId: 'wallet-1',
            toWalletId: 'wallet-2',
            date: '2026-01-03T00:00:00.000Z',
            type: 'transfer',
        },
        {
            id: 'tx-transfer-unknown-destination',
            amount: 25,
            walletId: 'wallet-1',
            date: '2026-01-04T00:00:00.000Z',
            type: 'transfer',
        },
    ];

    it('derives wallet balances from imported transactions when persisted balances are zero', () => {
        const derivedWallets = deriveWalletViews(wallets, transactions);

        expect(derivedWallets).toEqual([
            expect.objectContaining({ id: 'wallet-1', name: 'Cash', balance: 700 }),
            expect.objectContaining({ id: 'wallet-2', name: 'Bank', balance: 50 }),
        ]);
        expect(deriveTotalBalance(derivedWallets)).toBe(750);
    });

    it('derives dashboard jars and management percentages from imported transactions', () => {
        const dashboardJars = deriveDashboardJars(jars, transactions, 6);
        const manageJars = deriveManageJars(jars, transactions);

        expect(dashboardJars.map((jar) => ({ name: jar.name, current: jar.current }))).toEqual([
            { name: 'Salary', current: 1000 },
            { name: 'Food', current: 250 },
        ]);

        expect(manageJars.map((jar) => ({ name: jar.name, percentage: jar.percentage }))).toEqual([
            { name: 'Salary', percentage: 80 },
            { name: 'Food', percentage: 20 },
        ]);
    });
});
