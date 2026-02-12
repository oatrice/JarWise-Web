import { render, screen } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import TransactionCard from '../components/TransactionCard';
import type { Transaction } from '../utils/transactionStorage';
import { CurrencyProvider } from '../context/CurrencyContext';

const renderWithProviders = (ui: React.ReactElement) =>
    render(<CurrencyProvider>{ui}</CurrencyProvider>);

// Mock getJarDetails
vi.mock('../utils/constants', () => ({
    getJarDetails: (id: string) => ({
        id,
        name: 'Necessities',
        icon: '🏠',
        color: 'bg-blue-500'
    })
}));

describe('TransactionCard', () => {
    const mockTransaction: Transaction = {
        id: '123',
        amount: 100,
        jarId: 'necessities',
        date: '2026-01-16T10:00:00.000Z',
        note: 'Grocery Shopping',
        type: 'expense'
    };

    beforeEach(() => {
        localStorage.setItem('settings.currency', 'USD');
    });

    it('renders Note as the main title', () => {
        renderWithProviders(<TransactionCard transaction={mockTransaction} />);

        // The title should be the Note ("Grocery Shopping")
        const title = screen.getByRole('heading', { level: 4 });
        expect(title.textContent).toBe('Grocery Shopping');
    });

    it('renders Jar Name as the subtitle when note exists', () => {
        renderWithProviders(<TransactionCard transaction={mockTransaction} />);

        // The Jar Name should be visible but NOT as the title
        expect(screen.getByText('Necessities')).toBeInTheDocument();
        const title = screen.getByRole('heading', { level: 4 });
        expect(title.textContent).not.toBe('Necessities');
    });

    it('renders Jar Name as title if note is empty', () => {
        const noNoteTransaction = { ...mockTransaction, note: '' };
        renderWithProviders(<TransactionCard transaction={noNoteTransaction} />);

        // Title should fallback to Jar Name
        const title = screen.getByRole('heading', { level: 4 });
        expect(title.textContent).toBe('Necessities');
    });

    it('renders expense amount without - sign and in red', () => {
        const expenseTx = { ...mockTransaction, type: 'expense' as const, amount: 15.00 };
        renderWithProviders(<TransactionCard transaction={expenseTx} />);

        // Should display $15.00, NOT -$15.00
        const amountText = screen.getByText('$15.00');
        expect(amountText).toBeInTheDocument();
        expect(screen.queryByText('-$15.00')).not.toBeInTheDocument();

        // Check for red color class
        expect(amountText).toHaveClass('text-red-400');
    });

    it('renders income amount without + sign and in green', () => {
        const incomeTx = { ...mockTransaction, type: 'income' as const, amount: 500.00 };
        renderWithProviders(<TransactionCard transaction={incomeTx} />);

        // Should display $500.00, NOT +$500.00
        const amountText = screen.getByText('$500.00');
        expect(amountText).toBeInTheDocument();
        expect(screen.queryByText('+$500.00')).not.toBeInTheDocument();

        // Check for green color class
        expect(amountText).toHaveClass('text-emerald-400');
    });
});
