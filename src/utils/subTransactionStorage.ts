/**
 * Sub-Transaction Storage Service
 * 
 * Handles localStorage persistence for sub-transactions (items within a slip).
 */

export interface SubTransaction {
    id: string;
    parentId: string;
    description: string;
    amount: number;
    category?: string;
}

const STORAGE_KEY = 'jarwise_sub_transactions';

/**
 * Get all sub-transactions from localStorage
 */
export function getSubTransactions(): SubTransaction[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            console.warn('Invalid sub-transactions data in localStorage');
            return [];
        }

        return parsed;
    } catch (error) {
        console.warn('Failed to parse sub-transactions from localStorage:', error);
        return [];
    }
}

/**
 * Get sub-transactions for a specific parent transaction
 */
export function getSubTransactionsByParentId(parentId: string): SubTransaction[] {
    const all = getSubTransactions();
    return all.filter(item => item.parentId === parentId);
}

/**
 * Save a new sub-transaction or update existing one
 * (Currently acts as create/append, but id collision would just duplicate with this logic 
 * unless we check. For now, we append as per tests.)
 */
export function saveSubTransaction(subTx: SubTransaction): void {
    const existing = getSubTransactions();
    // Simple append for now
    const updated = [...existing, subTx];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Delete a sub-transaction by ID
 */
export function deleteSubTransaction(id: string): void {
    const existing = getSubTransactions();
    const updated = existing.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
