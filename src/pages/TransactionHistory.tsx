import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import TransactionCard from '../components/TransactionCard';
import type { Transaction } from '../utils/transactionStorage';
import { ArrowLeft, Filter, Search, Calendar, Loader2 } from 'lucide-react';
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
type PeriodKey = 'this_month' | 'last_30_days' | 'this_year' | 'custom';

const PERIOD_LABELS: Record<PeriodKey, string> = {
    this_month: 'This Month',
    last_30_days: 'Last 30 Days',
    this_year: 'This Year',
    custom: 'Custom Range',
};

function startOfDay(value: Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
}

function endOfDay(value: Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);
}

function parseDateInput(value: string, boundary: 'start' | 'end') {
    if (!value) {
        return null;
    }

    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) {
        return null;
    }

    if (boundary === 'start') {
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    return new Date(year, month - 1, day, 23, 59, 59, 999);
}

function getPeriodRange(period: PeriodKey, customStart: string, customEnd: string, now: Date) {
    if (period === 'custom') {
        return {
            start: parseDateInput(customStart, 'start'),
            end: parseDateInput(customEnd, 'end'),
        };
    }

    if (period === 'this_month') {
        return {
            start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
            end: endOfDay(now),
        };
    }

    if (period === 'last_30_days') {
        const start = new Date(now);
        start.setDate(now.getDate() - 29);
        return {
            start: startOfDay(start),
            end: endOfDay(now),
        };
    }

    return {
        start: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),
        end: endOfDay(now),
    };
}

export default function TransactionHistory({ onBack, onNavigate, transactions, onTransactionClick }: TransactionHistoryProps) {
    const { formatAmount } = useCurrency();
    const isVisible = useScrollDirection();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedJarIds, setSelectedJarIds] = useState<string[]>([]);
    const [selectedWalletIds, setSelectedWalletIds] = useState<string[]>([]);
    const [activePeriod, setActivePeriod] = useState<PeriodKey>('this_month');
    const [periodPickerOpen, setPeriodPickerOpen] = useState(false);
    const [pickerPeriod, setPickerPeriod] = useState<PeriodKey>('this_month');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [pickerCustomStart, setPickerCustomStart] = useState('');
    const [pickerCustomEnd, setPickerCustomEnd] = useState('');
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_TRANSACTIONS);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const loadMoreTimerRef = useRef<number | null>(null);
    const loadingMoreRef = useRef(false);

    const hasActiveFilters = selectedJarIds.length > 0 || selectedWalletIds.length > 0;
    const transactionsById = useMemo(() => new Map(transactions.map((tx) => [tx.id, tx])), [transactions]);
    const periodRange = useMemo(
        () => getPeriodRange(activePeriod, customStart, customEnd, new Date()),
        [activePeriod, customEnd, customStart],
    );
    const pickerRange = useMemo(
        () => getPeriodRange(pickerPeriod, pickerCustomStart, pickerCustomEnd, new Date()),
        [pickerCustomEnd, pickerCustomStart, pickerPeriod],
    );
    const isPickerCustomRangeValid = pickerPeriod === 'custom'
        && !!pickerRange.start
        && !!pickerRange.end
        && pickerRange.start.getTime() <= pickerRange.end.getTime();

    const filteredTransactions = useMemo(() => {
        return transactions.filter((tx) => {
            const jarMatch = selectedJarIds.length === 0 || (!!tx.jarId && selectedJarIds.includes(tx.jarId));
            const walletMatch = selectedWalletIds.length === 0 || (tx.walletId && selectedWalletIds.includes(tx.walletId));
            if (!jarMatch || !walletMatch) {
                return false;
            }

            const transactionDate = new Date(tx.date);
            if (Number.isNaN(transactionDate.getTime())) {
                return false;
            }

            if (activePeriod === 'custom') {
                if (!periodRange.start || !periodRange.end) {
                    return false;
                }
                return transactionDate >= periodRange.start && transactionDate <= periodRange.end;
            }

            if (!periodRange.start || !periodRange.end) {
                return true;
            }

            return transactionDate >= periodRange.start && transactionDate <= periodRange.end;
        });
    }, [activePeriod, periodRange.end, periodRange.start, selectedJarIds, selectedWalletIds, transactions]);

    const filterResetKey = useMemo(() => (
        [
            selectedJarIds.join(','),
            selectedWalletIds.join(','),
            activePeriod,
            customStart,
            customEnd,
        ].join('|')
    ), [activePeriod, customEnd, customStart, selectedJarIds, selectedWalletIds]);

    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE_TRANSACTIONS);
        setLoadingMore(false);
        loadingMoreRef.current = false;
    }, [filterResetKey]);

    const visibleTransactions = filteredTransactions.slice(0, visibleCount);
    const remainingTransactions = Math.max(filteredTransactions.length - Math.min(visibleCount, filteredTransactions.length), 0);

    useEffect(() => {
        if (remainingTransactions <= 0 || !loadMoreRef.current || typeof IntersectionObserver === 'undefined') {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (!entry?.isIntersecting || loadMoreTimerRef.current !== null || loadingMoreRef.current) {
                return;
            }

            loadingMoreRef.current = true;
            setLoadingMore(true);
            loadMoreTimerRef.current = window.setTimeout(() => {
                setVisibleCount((current) => Math.min(current + TRANSACTION_PAGE_SIZE, filteredTransactions.length));
                setLoadingMore(false);
                loadingMoreRef.current = false;
                loadMoreTimerRef.current = null;
            }, 120);
        }, {
            rootMargin: '240px 0px',
            threshold: 0.1,
        });

        observer.observe(loadMoreRef.current);

        return () => {
            observer.disconnect();
            if (loadMoreTimerRef.current !== null) {
                window.clearTimeout(loadMoreTimerRef.current);
                loadMoreTimerRef.current = null;
            }
        };
    }, [filteredTransactions.length, remainingTransactions]);

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

    const openPeriodPicker = () => {
        setPickerPeriod(activePeriod);
        setPickerCustomStart(customStart);
        setPickerCustomEnd(customEnd);
        setPeriodPickerOpen(true);
    };

    const closePeriodPicker = () => {
        setPickerPeriod(activePeriod);
        setPickerCustomStart(customStart);
        setPickerCustomEnd(customEnd);
        setPeriodPickerOpen(false);
    };

    const applyPresetPeriod = (period: Exclude<PeriodKey, 'custom'>) => {
        setActivePeriod(period);
        setPickerPeriod(period);
        setPeriodPickerOpen(false);
    };

    const applyCustomRange = () => {
        if (!isPickerCustomRangeValid) {
            return;
        }

        setCustomStart(pickerCustomStart);
        setCustomEnd(pickerCustomEnd);
        setActivePeriod('custom');
        setPickerPeriod('custom');
        setPeriodPickerOpen(false);
    };

    const hasScopedEmptyState = filteredTransactions.length === 0 && transactions.length > 0;
    const emptyStateTitle = hasActiveFilters || hasScopedEmptyState ? 'No matches found' : 'No transactions yet';
    const emptyStateDescription = hasActiveFilters || hasScopedEmptyState
        ? 'Try adjusting your filters or period to see results.'
        : 'Your transaction history will appear here';

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
                            <span className="text-sm">{PERIOD_LABELS[activePeriod]}</span>
                        </div>
                        <button
                            onClick={() => {
                                if (periodPickerOpen) {
                                    closePeriodPicker();
                                    return;
                                }

                                openPeriodPicker();
                            }}
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Change Period
                        </button>
                    </div>

                    {periodPickerOpen && (
                        <div className="mb-4 rounded-2xl border border-gray-800/70 bg-gray-950/60 p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => applyPresetPeriod('this_month')}
                                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                                        pickerPeriod === 'this_month'
                                            ? 'border-blue-500 bg-blue-500/15 text-blue-200'
                                            : 'border-gray-800 bg-gray-900/60 text-gray-300 hover:border-gray-700 hover:text-white'
                                    }`}
                                >
                                    This Month
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyPresetPeriod('last_30_days')}
                                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                                        pickerPeriod === 'last_30_days'
                                            ? 'border-blue-500 bg-blue-500/15 text-blue-200'
                                            : 'border-gray-800 bg-gray-900/60 text-gray-300 hover:border-gray-700 hover:text-white'
                                    }`}
                                >
                                    Last 30 Days
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyPresetPeriod('this_year')}
                                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                                        pickerPeriod === 'this_year'
                                            ? 'border-blue-500 bg-blue-500/15 text-blue-200'
                                            : 'border-gray-800 bg-gray-900/60 text-gray-300 hover:border-gray-700 hover:text-white'
                                    }`}
                                >
                                    This Year
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPickerPeriod('custom')}
                                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                                        pickerPeriod === 'custom'
                                            ? 'border-blue-500 bg-blue-500/15 text-blue-200'
                                            : 'border-gray-800 bg-gray-900/60 text-gray-300 hover:border-gray-700 hover:text-white'
                                    }`}
                                >
                                    Custom Range
                                </button>
                            </div>

                            {pickerPeriod === 'custom' && (
                                <div className="space-y-3 rounded-2xl border border-gray-800/70 bg-gray-900/30 p-4">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label htmlFor="history-period-start" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Start Date
                                            </label>
                                            <input
                                                id="history-period-start"
                                                aria-label="Start Date"
                                                type="date"
                                                value={pickerCustomStart}
                                                onChange={(event) => setPickerCustomStart(event.target.value)}
                                                className="w-full rounded-xl border border-gray-800 bg-gray-950/70 px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="history-period-end" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                End Date
                                            </label>
                                            <input
                                                id="history-period-end"
                                                aria-label="End Date"
                                                type="date"
                                                value={pickerCustomEnd}
                                                onChange={(event) => setPickerCustomEnd(event.target.value)}
                                                className="w-full rounded-xl border border-gray-800 bg-gray-950/70 px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={closePeriodPicker}
                                            className="rounded-full border border-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-700 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={applyCustomRange}
                                            disabled={!isPickerCustomRangeValid}
                                            className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-500"
                                        >
                                            Apply Range
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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
                        <h3 className="text-lg font-medium text-gray-300 mb-1">{emptyStateTitle}</h3>
                        <p className="text-sm text-gray-500">{emptyStateDescription}</p>
                    </div>
                )}

                {remainingTransactions > 0 && (
                    <div className="space-y-3">
                        {loadingMore && (
                            <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-400">
                                <Loader2 size={16} className="animate-spin text-blue-400" />
                                <span>Loading more transactions...</span>
                            </div>
                        )}
                        <div
                            ref={loadMoreRef}
                            aria-hidden="true"
                            className="h-12 w-full"
                        />
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
