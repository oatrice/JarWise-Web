import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Calendar, Wallet } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { getJarDetails } from '../utils/constants';
import type { Transaction } from '../utils/transactionStorage';

interface TransactionDetailProps {
    transactionId: string;
    allTransactions: Transaction[];
    onBack: () => void;
    onNavigateLinked: (id: string) => void;
}

export default function TransactionDetail({
    transactionId,
    allTransactions,
    onBack,
    onNavigateLinked
}: TransactionDetailProps) {
    const { formatAmount } = useCurrency();

    const transaction = allTransactions.find(t => t.id === transactionId);

    if (!transaction) {
        return <div className="p-8 text-center text-gray-500">Transaction not found</div>;
    }

    const linkedTransaction = transaction.relatedTransactionId
        ? allTransactions.find(t => t.id === transaction.relatedTransactionId)
        : null;

    const jar = getJarDetails(transaction.jarId);

    return (
        <div className="min-h-screen bg-gray-950 font-sans text-gray-100 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-400" />
                </button>
                <h1 className="text-lg font-semibold text-gray-100">Details</h1>
                <div className="w-10" />
            </header>

            <main className="px-6 py-8 space-y-6">
                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-gray-900 border border-gray-800 flex flex-col items-center text-center space-y-4 shadow-xl"
                >
                    <div className="h-16 w-16 rounded-2xl bg-gray-800 flex items-center justify-center text-3xl shadow-inner border border-gray-700">
                        {jar.icon}
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-100 mb-1">{transaction.note || jar.name}</h2>
                        <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</p>
                    </div>

                    <div className={`text-4xl font-bold tracking-tight ${transaction.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)}
                    </div>

                    <div className="flex gap-2 text-sm text-gray-400 bg-gray-950 px-3 py-1.5 rounded-full border border-gray-800">
                        <Wallet size={14} className="mt-0.5" />
                        {transaction.walletId ? (
                            <span>Wallet ID: {transaction.walletId}</span>
                        ) : (
                            <span>No Wallet</span>
                        )}
                        {/* In real app, look up Wallet Name */}
                    </div>
                </motion.div>

                {/* Linked Transaction Section */}
                {linkedTransaction && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl border border-blue-500/30 bg-blue-500/5 overflow-hidden"
                    >
                        <div className="px-5 py-3 border-b border-blue-500/20 bg-blue-500/10 flex items-center gap-2">
                            <ExternalLink size={16} className="text-blue-400" />
                            <h3 className="text-sm font-semibold text-blue-100">Linked Transaction</h3>
                        </div>
                        <div
                            onClick={() => onNavigateLinked(linkedTransaction.id)}
                            className="p-4 flex items-center justify-between hover:bg-blue-500/5 transition-colors cursor-pointer group"
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-200 group-hover:text-blue-300 transition-colors">
                                    {linkedTransaction.note || 'Linked Transfer'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {linkedTransaction.type === 'expense' ? 'Outbound' : 'Inbound'}
                                </span>
                            </div>
                            <div className={`font-semibold ${linkedTransaction.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                                {linkedTransaction.type === 'expense' ? '-' : '+'}{formatAmount(linkedTransaction.amount)}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Additional Info / Note */}
                <div className="p-5 rounded-2xl bg-gray-900/50 border border-gray-800 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                        <Calendar size={16} />
                        <span>Created on {new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                    {transaction.note && (
                        <div className="pt-3 border-t border-gray-800">
                            <p className="text-sm text-gray-300 italic">"{transaction.note}"</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
