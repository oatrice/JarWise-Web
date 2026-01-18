import type { Transaction } from '../utils/transactionStorage';
import { ArrowRight } from 'lucide-react';
import { getJarDetails } from '../utils/constants';
import { useCurrency } from '../context/CurrencyContext';

interface TransactionCardProps {
    transaction: Transaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
    const { formatAmount } = useCurrency();
    const jar = getJarDetails(transaction.jarId);

    // Format date roughly like "Today, 10:43 AM" or "Jan 16, 2026"
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
    // const jar = getJarDetails(transaction.jarId); // Keep jar details for potential future use or if title/subtitle logic changes
    const title = transaction.note || jar.name;
    const subtitle = transaction.note ? jar.name : '';

    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/40 border border-gray-800/50 hover:bg-gray-800/40 transition-colors group cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl text-xl bg-gray-800/50 flex items-center justify-center`}>
                    {/* Assuming Icon is imported or jar.icon is used */}
                    {jar.icon}
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                        {title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {subtitle && (
                            <>
                                <span className="font-medium text-gray-400">{subtitle}</span>
                                <span className="h-1 w-1 rounded-full bg-gray-700" />
                            </>
                        )}
                        <span>{dateStr}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <span className={`font-semibold ${transaction.type === 'expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)}
                </span>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-gray-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
            </div>
        </div>
    )
}
