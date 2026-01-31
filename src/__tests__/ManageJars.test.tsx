import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ManageJars from '../pages/ManageJars';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
            <div {...props}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('ManageJars', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders the Manage Jars header', () => {
            render(<ManageJars onClose={mockOnClose} />);
            expect(screen.getByText('Manage Jars')).toBeInTheDocument();
        });

        it('renders all 6 jars', () => {
            render(<ManageJars onClose={mockOnClose} />);
            // Default jars from mockData
            expect(screen.getByText('Necessities')).toBeInTheDocument();
            expect(screen.getByText('Financial Freedom')).toBeInTheDocument();
            expect(screen.getByText('Play')).toBeInTheDocument();
            expect(screen.getByText('Education')).toBeInTheDocument();
            expect(screen.getByText('Long-term Savings')).toBeInTheDocument();
            expect(screen.getByText('Give')).toBeInTheDocument();
        });

        it('shows Total Allocation indicator', () => {
            render(<ManageJars onClose={mockOnClose} />);
            expect(screen.getByText('Total Allocation')).toBeInTheDocument();
        });

        it('renders Save and Reset buttons', () => {
            render(<ManageJars onClose={mockOnClose} />);
            expect(screen.getByText('Save')).toBeInTheDocument();
            expect(screen.getByText('Reset')).toBeInTheDocument();
        });
    });

    describe('Validation', () => {
        it('shows 100% as valid (green)', () => {
            render(<ManageJars onClose={mockOnClose} />);
            // Default total should be 100%
            const totalText = screen.getByText('100%');
            expect(totalText).toHaveClass('text-green-400');
        });

        it('Save button is enabled when total is 100%', () => {
            render(<ManageJars onClose={mockOnClose} />);
            const saveButton = screen.getByText('Save').closest('button');
            expect(saveButton).not.toBeDisabled();
        });
    });

    describe('User Interactions', () => {
        it('calls onClose when back arrow is clicked', () => {
            render(<ManageJars onClose={mockOnClose} />);
            // Get first button (back arrow)
            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[0]); // First button is the back arrow
            expect(mockOnClose).toHaveBeenCalled();
        });

        it('expands jar edit panel when jar is clicked', () => {
            render(<ManageJars onClose={mockOnClose} />);
            // Click on Necessities jar
            const necessitiesJar = screen.getByText('Necessities').closest('div[class*="rounded-2xl"]');
            if (necessitiesJar) {
                fireEvent.click(necessitiesJar);
            }
            // Name input should appear
            expect(screen.getByText('Name')).toBeInTheDocument();
            expect(screen.getByText('Color')).toBeInTheDocument();
            expect(screen.getByText('Icon')).toBeInTheDocument();
        });

        it('shows Reset confirmation modal when Reset is clicked', () => {
            render(<ManageJars onClose={mockOnClose} />);
            const resetButton = screen.getByText('Reset');
            fireEvent.click(resetButton);
            expect(screen.getByText('Reset to Default?')).toBeInTheDocument();
        });
    });

    describe('Edit Functionality', () => {
        it('updates jar name when edited', () => {
            render(<ManageJars onClose={mockOnClose} />);
            // Click to expand
            const necessitiesJar = screen.getByText('Necessities').closest('div[class*="rounded-2xl"]');
            if (necessitiesJar) {
                fireEvent.click(necessitiesJar);
            }
            // Find input and change value
            const nameInput = screen.getByDisplayValue('Necessities');
            fireEvent.change(nameInput, { target: { value: 'Bills' } });
            expect(screen.getByDisplayValue('Bills')).toBeInTheDocument();
        });
    });

    describe('Save Functionality', () => {
        it('calls onClose when Save is clicked and total is 100%', () => {
            render(<ManageJars onClose={mockOnClose} />);
            const saveButton = screen.getByText('Save').closest('button');
            if (saveButton) {
                fireEvent.click(saveButton);
            }
            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
