/**
 * Transaction Storage Service
 * 
 * Handles localStorage persistence for transactions.
 */

export interface Transaction {
    id: string;
    amount: number;
    jarId: string;
    note?: string;
    date: string;
    type: 'income' | 'expense';
}

const STORAGE_KEY = 'jarwise_transactions';
const MAX_TRANSACTIONS = 100;

/**
 * Get all transactions from localStorage
 * Returns empty array if no transactions or invalid data
 */
export function getTransactions(): Transaction[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            console.warn('Invalid transactions data in localStorage');
            return [];
        }

        return parsed;
    } catch (error) {
        console.warn('Failed to parse transactions from localStorage:', error);
        return [];
    }
}

/**
 * Save a new transaction to localStorage
 * Adds to beginning of array (newest first)
 * Limits to MAX_TRANSACTIONS most recent
 */
export function saveTransaction(tx: Transaction): void {
    const existing = getTransactions();

    // Add new transaction at beginning (newest first)
    const updated = [tx, ...existing];

    // Limit to max transactions
    const limited = updated.slice(0, MAX_TRANSACTIONS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
}

/**
 * Clear all transactions from localStorage
 * Useful for testing or reset functionality
 */
export function clearTransactions(): void {
    localStorage.removeItem(STORAGE_KEY);
}
