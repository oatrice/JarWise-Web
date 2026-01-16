import { motion } from 'framer-motion';
import { transactions } from '../utils/generatedMockData';
import TransactionCard from '../components/TransactionCard';
import { ArrowLeft, Filter, Search, Calendar } from 'lucide-react';

interface TransactionHistoryProps {
    onBack: () => void;
}

export default function TransactionHistory({ onBack }: TransactionHistoryProps) {
    // Group transactions by date (for demo, we'll show all)
    const groupedTransactions = {
        'Today': transactions.filter(t => t.date.includes('Today')),
        'Yesterday': transactions.filter(t => t.date.includes('Yesterday')),
        'Older': transactions.filter(t => !t.date.includes('Today') && !t.date.includes('Yesterday')),
    };

    return (
        <div className="min-h-screen bg-gray-950 font-sans text-gray-100">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
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
                            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white transition-colors hover:border-gray-700">
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

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
                                -${Math.abs(transactions.reduce((acc, t) => acc + t.amount, 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Transactions</p>
                            <p className="text-xl font-bold text-gray-100">{transactions.length}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Transaction Groups */}
                {Object.entries(groupedTransactions).map(([date, txns]) => (
                    txns.length > 0 && (
                        <motion.section
                            key={date}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="text-sm font-medium text-gray-500 mb-3">{date}</h3>
                            <div className="space-y-3">
                                {txns.map((t) => (
                                    <TransactionCard key={t.id} transaction={t} />
                                ))}
                            </div>
                        </motion.section>
                    )
                ))}

                {/* Empty State */}
                {transactions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                            <Search size={32} className="text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-300 mb-1">No transactions yet</h3>
                        <p className="text-sm text-gray-500">Your transaction history will appear here</p>
                    </div>
                )}
            </main>
        </div>
    );
}
