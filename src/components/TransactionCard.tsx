import type { Transaction } from '../utils/transactionStorage';
import { ArrowRight, ArrowRightLeft } from 'lucide-react';
import { getJarDetails, getWalletDetails } from '../utils/constants';
import { useCurrency } from '../context/CurrencyContext';

interface TransactionCardProps {
    transaction: Transaction;
    showDate?: boolean;
    onClick?: () => void;
    isTransfer?: boolean;
    linkedTransaction?: Transaction; // The counterpart transaction for transfers
}

export default function TransactionCard({ transaction, showDate = true, onClick, isTransfer = false, linkedTransaction }: TransactionCardProps) {
    const { formatAmount } = useCurrency();
    const jar = getJarDetails(transaction.jarId);

    // Format date roughly like "Today, 10:43 AM" or "Jan 16, 2026"
    let dateStr = transaction.date;
    try {
        const dateObj = new Date(transaction.date);
        if (!isNaN(dateObj.getTime())) {
            dateStr = new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            }).format(dateObj);
        }
    } catch {
        // Fallback to raw string if parsing fails
        console.error("Invalid date:", transaction.date);
    }

    // Display Logic: 
    // Title: Note (primary) -> Jar Name (fallback)
    // Subtitle: Jar Name (if Note exists) -> Date
    let title = transaction.note || jar.name;
    let subtitle = transaction.note ? jar.name : '';

    if (isTransfer) {
        const fromWallet = transaction.walletId ? getWalletDetails(transaction.walletId) : null;
        const toWallet = linkedTransaction?.walletId ? getWalletDetails(linkedTransaction.walletId) : null;
        if (fromWallet && toWallet) {
            title = `${fromWallet.name} → ${toWallet.name}`;
        } else if (fromWallet) {
            title = `Transfer from ${fromWallet.name}`;
        } else {
            title = 'Transfer';
        }
        subtitle = 'Transfer';
    }

    return (
        <div onClick={onClick} className={`flex items-center justify-between p-4 rounded-xl border transition-colors group cursor-pointer ${transaction.status === 'draft' ? 'bg-yellow-900/20 border-yellow-500/30 hover:bg-yellow-900/30' : 'bg-gray-900/40 border-gray-800/50 hover:bg-gray-800/40'}`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl text-xl ${isTransfer ? 'bg-blue-900/30 text-blue-400' : 'bg-gray-800/50'} flex items-center justify-center`}>
                    {isTransfer ? <ArrowRightLeft size={20} /> : jar.icon}
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors flex items-center gap-2">
                        {title}
                        {transaction.status === 'draft' && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Draft</span>}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {subtitle && (
                            <>
                                <span className="font-medium text-gray-400">{subtitle}</span>
                                {showDate && <span className="h-1 w-1 rounded-full bg-gray-700" />}
                            </>
                        )}
                        {showDate && <span>{dateStr}</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <span className={`font-semibold ${isTransfer ? 'text-blue-400' : (transaction.type === 'expense' ? 'text-red-400' : 'text-emerald-400')}`}>
                    {formatAmount(transaction.amount)}
                </span>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-gray-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
            </div>
        </div>
    )
}
