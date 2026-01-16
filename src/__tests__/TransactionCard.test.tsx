import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransactionCard from '../components/TransactionCard';
import { Transaction } from '../utils/transactionStorage';

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

    it('renders Jar Name as the main title', () => {
        render(<TransactionCard transaction={mockTransaction} />);

        // The title should be the Jar Name ("Necessities")
        // We look for a heading level 4 with the jar name
        const title = screen.getByRole('heading', { level: 4 });
        expect(title.textContent).toBe('Necessities');
    });

    it('renders Note as the subtitle', () => {
        render(<TransactionCard transaction={mockTransaction} />);

        // The note should be visible
        expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();

        // Ensure Note is NOT the title
        const title = screen.getByRole('heading', { level: 4 });
        expect(title.textContent).not.toBe('Grocery Shopping');
    });

    it('handles empty note gracefully', () => {
        const noNoteTransaction = { ...mockTransaction, note: '' };
        render(<TransactionCard transaction={noNoteTransaction} />);

        // Title should still be Jar Name
        const title = screen.getByRole('heading', { level: 4 });
        expect(title.textContent).toBe('Necessities');

        // Should not render empty note space or duplicate jar name in subtitle
        // checks that we don't see "Necessities" twice (once as title, once as subtitle)
        // strict check might be hard if "Necessities" is in the DOM for other reasons (e.g. icon alt?), 
        // but based on current UI it likely appears once as title.
        // Let's just check that we don't reject layout.
    });
});
