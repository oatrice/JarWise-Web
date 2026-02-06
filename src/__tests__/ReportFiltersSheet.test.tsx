import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReportFiltersSheet from '../components/ReportFiltersSheet';

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <div {...props}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

const jarOptions = [
    { id: 'jar-1', name: 'Jar One' },
    { id: 'jar-2', name: 'Jar Two' },
];

const walletOptions = [
    { id: 'wallet-1', name: 'Wallet One' },
    { id: 'wallet-2', name: 'Wallet Two' },
];

const getDropdownButton = (label: string) => {
    const labelNode = screen.getByText(label);
    const wrapper = labelNode.parentElement;
    if (!wrapper) {
        throw new Error(`Missing wrapper for ${label} dropdown`);
    }
    const button = wrapper.querySelector('button');
    if (!button) {
        throw new Error(`Missing button for ${label} dropdown`);
    }
    return button;
};

const getDropdownContainer = (placeholder: string) => {
    const searchInput = screen.getByPlaceholderText(placeholder);
    const dropdownContainer = searchInput.closest('div')?.parentElement;
    if (!dropdownContainer) {
        throw new Error(`Missing dropdown container for ${placeholder}`);
    }
    return dropdownContainer;
};

const getOptionButton = (optionName: string, placeholder: string) => {
    const dropdownContainer = getDropdownContainer(placeholder);
    const optionLabel = within(dropdownContainer).getByText(optionName);
    const button = optionLabel.closest('button');
    if (!button) {
        throw new Error(`Missing option button for ${optionName}`);
    }
    return button;
};

describe('ReportFiltersSheet', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('discard draft changes when closed without applying', () => {
        const onApply = vi.fn();
        const onClose = vi.fn();

        const { rerender } = render(
            <ReportFiltersSheet
                open
                jarOptions={jarOptions}
                walletOptions={walletOptions}
                selectedJarIds={['jar-1']}
                selectedWalletIds={['wallet-1']}
                onApply={onApply}
                onClose={onClose}
            />
        );

        fireEvent.click(getDropdownButton('Jars'));
        fireEvent.click(getOptionButton('Jar One', 'Search Jars'));
        fireEvent.click(getOptionButton('Jar Two', 'Search Jars'));

        fireEvent.click(screen.getByRole('button', { name: /close filters/i }));
        expect(onApply).not.toHaveBeenCalled();

        rerender(
            <ReportFiltersSheet
                open={false}
                jarOptions={jarOptions}
                walletOptions={walletOptions}
                selectedJarIds={['jar-1']}
                selectedWalletIds={['wallet-1']}
                onApply={onApply}
                onClose={onClose}
            />
        );

        rerender(
            <ReportFiltersSheet
                open
                jarOptions={jarOptions}
                walletOptions={walletOptions}
                selectedJarIds={['jar-1']}
                selectedWalletIds={['wallet-1']}
                onApply={onApply}
                onClose={onClose}
            />
        );

        fireEvent.click(getDropdownButton('Jars'));
        const jarOneCheckbox = within(getOptionButton('Jar One', 'Search Jars')).getByRole('checkbox');
        const jarTwoCheckbox = within(getOptionButton('Jar Two', 'Search Jars')).getByRole('checkbox');

        expect(jarOneCheckbox).toBeChecked();
        expect(jarTwoCheckbox).not.toBeChecked();
    });

    it('clears all filters then applies empty selections', () => {
        const onApply = vi.fn();

        render(
            <ReportFiltersSheet
                open
                jarOptions={jarOptions}
                walletOptions={walletOptions}
                selectedJarIds={['jar-1']}
                selectedWalletIds={['wallet-2']}
                onApply={onApply}
                onClose={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /clear/i }));
        fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

        expect(onApply).toHaveBeenCalledWith([], []);
    });

    it('reopens with the latest applied filters', () => {
        const onApply = vi.fn();

        const { rerender } = render(
            <ReportFiltersSheet
                open
                jarOptions={jarOptions}
                walletOptions={walletOptions}
                selectedJarIds={[]}
                selectedWalletIds={[]}
                onApply={onApply}
                onClose={vi.fn()}
            />
        );

        fireEvent.click(getDropdownButton('Jars'));
        fireEvent.click(getOptionButton('Jar One', 'Search Jars'));
        fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

        expect(onApply).toHaveBeenCalledWith(['jar-1'], []);

        rerender(
            <ReportFiltersSheet
                open={false}
                jarOptions={jarOptions}
                walletOptions={walletOptions}
                selectedJarIds={['jar-1']}
                selectedWalletIds={[]}
                onApply={onApply}
                onClose={vi.fn()}
            />
        );

        rerender(
            <ReportFiltersSheet
                open
                jarOptions={jarOptions}
                walletOptions={walletOptions}
                selectedJarIds={['jar-1']}
                selectedWalletIds={[]}
                onApply={onApply}
                onClose={vi.fn()}
            />
        );

        fireEvent.click(getDropdownButton('Jars'));
        const jarOneCheckbox = within(getOptionButton('Jar One', 'Search Jars')).getByRole('checkbox');
        expect(jarOneCheckbox).toBeChecked();
    });
});
