import type { Transaction } from '../utils/mockData';
import { ArrowRight } from 'lucide-react';

interface TransactionCardProps {
    transaction: Transaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
    const Icon = transaction.icon;

    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/40 border border-gray-800/50 hover:bg-gray-800/40 transition-colors group cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${transaction.color}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{transaction.merchant}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{transaction.category}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-700" />
                        <span>{transaction.date}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-200">-${transaction.amount.toFixed(2)}</span>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-gray-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
            </div>
        </div>
    )
}
