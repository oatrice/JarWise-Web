import type { Transaction } from '../utils/transactionStorage';
import { ArrowRight } from 'lucide-react';
import { getJarDetails } from '../utils/constants';

interface TransactionCardProps {
    transaction: Transaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
    const jar = getJarDetails(transaction.jarId);

    // Format date roughly like "Today, 10:43 AM" or "Jan 16, 2026"
    const dateObj = new Date(transaction.date);
    const dateStr = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    }).format(dateObj);

    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/40 border border-gray-800/50 hover:bg-gray-800/40 transition-colors group cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl text-xl bg-gray-800/50 flex items-center justify-center`}>
                    {jar.icon}
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                        {transaction.note || jar.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={transaction.type === 'expense' ? 'text-red-400' : 'text-green-400'}>
                            {transaction.type === 'expense' ? 'Expense' : 'Income'}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-700" />
                        <span>{dateStr}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <span className={`font-semibold ${transaction.type === 'expense' ? 'text-gray-200' : 'text-green-400'}`}>
                    {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                </span>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-gray-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
            </div>
        </div>
    )
}
