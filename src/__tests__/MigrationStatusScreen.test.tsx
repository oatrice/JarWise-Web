import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import MigrationStatusScreen from '../pages/MigrationStatusScreen';

const apiFetchMock = vi.fn();

vi.mock('../lib/api', () => ({
    apiFetch: (...args: unknown[]) => apiFetchMock(...args),
    ApiError: class ApiError extends Error {
        status: number;

        constructor(message: string, status: number) {
            super(message);
            this.status = status;
        }
    },
}));

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <div {...props}>{children}</div>
        ),
    },
}));

describe('MigrationStatusScreen', () => {
    beforeEach(() => {
        apiFetchMock.mockReset();
    });

    it('shows a readable duplicate preview with overflow summary instead of rendering every duplicate item', async () => {
        apiFetchMock.mockResolvedValue({
            jobId: 'job-1',
            phase: 'duplicate_blocked',
            message: 'Duplicate data was detected for this account.',
            canConfirmImport: false,
            counts: {
                wallets: 3,
                jars: 2,
                transactions: 10,
                totalIncome: 1200,
                totalExpense: 500,
            },
            duplicateSummary: {
                wallets: [
                    { displayName: 'Cash', matchedBy: 'source_id', sourceId: 'w1' },
                    { displayName: 'Kbank LTSS2', matchedBy: 'source_id', sourceId: 'w2' },
                    { displayName: 'True money', matchedBy: 'source_id', sourceId: 'w3' },
                ],
                jars: [
                    { displayName: 'Food', matchedBy: 'source_id', sourceId: 'j1' },
                    { displayName: 'Salary', matchedBy: 'source_id', sourceId: 'j2' },
                ],
                transactions: Array.from({ length: 10 }, (_, index) => ({
                    displayName: `Transaction ${index + 1}`,
                    matchedBy: 'source_id',
                    sourceId: `tx-${index + 1}`,
                })),
            },
        });

        render(<MigrationStatusScreen onBack={vi.fn()} onDone={vi.fn()} jobId="job-1" />);

        expect(await screen.findByText('Duplicate Data Detected')).toBeInTheDocument();
        expect(screen.getByText('Cash')).toBeInTheDocument();
        expect(screen.getByText('Kbank LTSS2')).toBeInTheDocument();
        expect(screen.getByText('Showing 8 of 10 duplicates')).toBeInTheDocument();
        expect(screen.getByText('+ 2 more duplicated transactions in this account')).toBeInTheDocument();
        expect(screen.queryByText('Transaction 9')).not.toBeInTheDocument();
        expect(screen.queryByText('Transaction 10')).not.toBeInTheDocument();
    });
});
