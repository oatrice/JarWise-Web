import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FolderOpen, Wallet as WalletIcon } from 'lucide-react';
import ManageWallets from '../pages/ManageWallets';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <div {...props}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('ManageWallets', () => {
    it('renders imported wallet data when provided', () => {
        render(
            <ManageWallets
                onClose={vi.fn()}
                initialWalletsData={[
                    {
                        id: 'wallet-kbank',
                        name: 'Kbank LTSS2',
                        balance: 7372.5,
                        color: 'text-blue-500',
                        icon: WalletIcon,
                        parentId: null,
                        level: 0,
                    },
                    {
                        id: 'wallet-cash',
                        name: 'Cash',
                        balance: 110,
                        color: 'text-green-500',
                        icon: FolderOpen,
                        parentId: null,
                        level: 0,
                    },
                ]}
            />,
        );

        expect(screen.getByText('Kbank LTSS2')).toBeInTheDocument();
        expect(screen.getByText('Cash')).toBeInTheDocument();
        expect(screen.getByText('$7,372.5')).toBeInTheDocument();
        expect(screen.queryByText('Main Wallet')).not.toBeInTheDocument();
    });

    it('refreshes the editable wallet list when imported wallet props change', () => {
        const { rerender } = render(
            <ManageWallets
                onClose={vi.fn()}
                initialWalletsData={[
                    {
                        id: 'wallet-1',
                        name: 'Cash',
                        balance: 110,
                        color: 'text-green-500',
                        icon: FolderOpen,
                        parentId: null,
                        level: 0,
                    },
                ]}
            />,
        );

        expect(screen.getByText('Cash')).toBeInTheDocument();
        expect(screen.queryByText('Emergency Fund')).not.toBeInTheDocument();

        rerender(
            <ManageWallets
                onClose={vi.fn()}
                initialWalletsData={[
                    {
                        id: 'wallet-2',
                        name: 'Emergency Fund',
                        balance: 3200,
                        color: 'text-blue-500',
                        icon: WalletIcon,
                        parentId: null,
                        level: 0,
                    },
                ]}
            />,
        );

        expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
        expect(screen.queryByText('Cash')).not.toBeInTheDocument();
    });
});
