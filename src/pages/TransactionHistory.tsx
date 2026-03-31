import { startTransition, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import TransactionCard from '../components/TransactionCard';
import type { Transaction } from '../utils/transactionStorage';
import { ArrowLeft, Filter, Search, Calendar } from 'lucide-react';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { useCurrency } from '../context/CurrencyContext';
import ReportFiltersSheet from '../components/ReportFiltersSheet';
import { JARS, WALLETS } from '../utils/constants';
import type { Page } from '../types/navigation';

interface TransactionHistoryProps {
    onBack: () => void;
    onNavigate: (page: Page) => void;
    transactions: Transaction[];
    onTransactionClick?: (id: string) => void;
}

import BottomNav from '../components/BottomNav';

const INITIAL_VISIBLE_TRANSACTIONS = 100;
const TRANSACTION_PAGE_SIZE = 100;

export default function TransactionHistory({ onBack, onNavigate, transactions, onTransactionClick }: TransactionHistoryProps) {
    const { formatAmount } = useCurrency();
    const isVisible = useScrollDirection();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedJarIds, setSelectedJarIds] = useState<string[]>([]);
    const [selectedWalletIds, setSelectedWalletIds] = useState<string[]>([]);
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_TRANSACTIONS);

    const hasActiveFilters = selectedJarIds.length > 0 || selectedWalletIds.length > 0;
    const transactionsById = useMemo(() => new Map(transactions.map((tx) => [tx.id, tx])), [transactions]);

    const filteredTransactions = useMemo(() => {
        if (!hasActiveFilters) return transactions;
        return transactions.filter((tx) => {
            const jarMatch = selectedJarIds.length === 0 || (!!tx.jarId && selectedJarIds.includes(tx.jarId));
            const walletMatch = selectedWalletIds.length === 0 || (tx.walletId && selectedWalletIds.includes(tx.walletId));
            return jarMatch && walletMatch;
        });
    }, [hasActiveFilters, selectedJarIds, selectedWalletIds, transactions]);

    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE_TRANSACTIONS);
    }, [filteredTransactions.length]);

    const visibleTransactions = filteredTransactions.slice(0, visibleCount);
    const visibleTransactionCount = Math.min(visibleCount, filteredTransactions.length);
    const remainingTransactions = Math.max(filteredTransactions.length - visibleTransactionCount, 0);

    interface TransactionGroup {
        date: string;
        transactions: Transaction[];
        income: number;
        expense: number;
    }

    const groupedTransactions: TransactionGroup[] = [];

    visibleTransactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        let lastGroup = groupedTransactions[groupedTransactions.length - 1];
        if (!lastGroup || lastGroup.date !== dateStr) {
            lastGroup = { date: dateStr, transactions: [], income: 0, expense: 0 };
            groupedTransactions.push(lastGroup);
        }
        lastGroup.transactions.push(transaction);

        if (transaction.type === 'income') {
            lastGroup.income += transaction.amount;
        } else if (transaction.type === 'expense') {
            lastGroup.expense += transaction.amount;
        }
    });

    const totalSpent = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    return (
        <div className="min-h-screen bg-gray-950 font-sans text-gray-100">
            {/* Header */}
            <motion.header
                animate={{ y: isVisible ? 0 : -100 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800"
            >
                <div className="mx-auto max-w-md px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onBack}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white transition-colors hover:border-gray-700"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-lg font-semibold text-gray-100">Transaction History</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white transition-colors hover:border-gray-700">
                                <Search size={20} />
                            </button>
                            <button
                                onClick={() => setFiltersOpen(true)}
                                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white transition-colors hover:border-gray-700"
                            >
                                <Filter size={20} />
                                {hasActiveFilters && (
                                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-400" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <main className="mx-auto max-w-md px-6 py-6 pb-24 space-y-6">
                {/* Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-800/50 p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar size={16} />
                            <span className="text-sm">This Month</span>
                        </div>
                        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            Change Period
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                            <p className="text-xl font-bold text-red-400">
                                -${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Transactions</p>
                            <p className="text-xl font-bold text-gray-100">{filteredTransactions.length}</p>
                        </div>
                    </div>
                </motion.div>

                {filteredTransactions.length > INITIAL_VISIBLE_TRANSACTIONS && (
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-blue-100">
                                    Showing {visibleTransactionCount.toLocaleString()} of {filteredTransactions.length.toLocaleString()} transactions
                                </p>
                                <p className="text-xs text-blue-200/70 mt-1">
                                    Rendering recent transactions first to keep this screen responsive.
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider text-blue-300">Remaining</p>
                                <p className="text-lg font-bold text-white">{remainingTransactions.toLocaleString()}</p>
                            </div>
                        </div>
                        {remainingTransactions > 0 && (
                            <button
                                onClick={() => {
                                    startTransition(() => {
                                        setVisibleCount((current) => Math.min(current + TRANSACTION_PAGE_SIZE, filteredTransactions.length));
                                    });
                                }}
                                className="w-full rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-100 hover:bg-blue-500/20 transition-colors"
                            >
                                Load {Math.min(remainingTransactions, TRANSACTION_PAGE_SIZE).toLocaleString()} more transactions
                            </button>
                        )}
                    </div>
                )}

                {/* Transaction Groups */}
                {groupedTransactions.map((group) => {
                    // Filter out the income side of transfers (we show the expense side as the "transfer" entry)
                    const visibleTransactions = group.transactions.filter(t => !(t.type === 'income' && t.relatedTransactionId));

                    return (
                        <motion.section
                            key={group.date}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-500">{group.date}</h3>
                                <div className="flex items-center gap-3 text-xs font-medium">
                                    {group.income > 0 && <span className="text-blue-400">+{formatAmount(group.income)}</span>}
                                    {group.expense > 0 && <span className="text-red-400">-{formatAmount(group.expense)}</span>}
                                </div>
                            </div>
                            <div className="space-y-3">
                                {visibleTransactions.map((t) => {
                                    const linkedTx = t.relatedTransactionId ? transactionsById.get(t.relatedTransactionId) : undefined;
                                    return (
                                        <TransactionCard
                                            key={t.id}
                                            transaction={t}
                                            showDate={false}
                                            onClick={() => onTransactionClick?.(t.id)}
                                            isTransfer={t.type === 'transfer' || !!t.relatedTransactionId}
                                            linkedTransaction={linkedTx}
                                        />
                                    );
                                })}
                            </div>
                        </motion.section>
                    );
                })}

                {/* Empty State */}
                {filteredTransactions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                            <Search size={32} className="text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-300 mb-1">
                            {hasActiveFilters ? 'No matches found' : 'No transactions yet'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {hasActiveFilters ? 'Try adjusting your filters to see results.' : 'Your transaction history will appear here'}
                        </p>
                    </div>
                )}
            </main>

            <BottomNav activePage="history" onNavigate={onNavigate} visible={isVisible} />

            <ReportFiltersSheet
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                jarOptions={JARS.map((jar) => ({ id: jar.id, name: jar.name }))}
                walletOptions={WALLETS.map((wallet) => ({ id: wallet.id, name: wallet.name }))}
                selectedJarIds={selectedJarIds}
                selectedWalletIds={selectedWalletIds}
                onApply={(jarIds, walletIds) => {
                    setSelectedJarIds(jarIds);
                    setSelectedWalletIds(walletIds);
                    setFiltersOpen(false);
                }}
            />
        </div>
    );
}
