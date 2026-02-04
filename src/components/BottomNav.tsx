import { motion } from 'framer-motion';
import { LayoutGrid, History, Plus, Wallet, User } from 'lucide-react';

type Page = 'dashboard' | 'history' | 'scan' | 'add-transaction' | 'wallets' | 'profile';

interface BottomNavProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
    visible?: boolean;
}

export default function BottomNav({ activePage, onNavigate, visible = true }: BottomNavProps) {
    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: visible ? 0 : 200 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90%] sm:max-w-md lg:hidden"
        >
            <div className="flex items-center justify-between px-6 py-3 rounded-full bg-gray-900/90 backdrop-blur-xl border border-gray-800 shadow-2xl ring-1 ring-white/10">
                <button
                    onClick={() => onNavigate('dashboard')}
                    className={`flex flex-col items-center gap-1 ${activePage === 'dashboard' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'} transition-colors`}
                >
                    <LayoutGrid size={24} className={activePage === 'dashboard' ? 'fill-blue-400/20' : ''} />
                </button>
                <button
                    onClick={() => onNavigate('history')}
                    className={`flex flex-col items-center gap-1 ${activePage === 'history' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'} transition-colors`}
                >
                    <History size={24} />
                </button>
                <button
                    onClick={() => onNavigate('add-transaction')}
                    className="relative -top flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/40 border-4 border-gray-950 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={28} />
                </button>
                <button
                    onClick={() => onNavigate('wallets')}
                    className={`flex flex-col items-center gap-1 ${activePage === 'wallets' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'} transition-colors`}
                >
                    <Wallet size={24} />
                </button>
                <button
                    onClick={() => onNavigate('profile')}
                    className={`flex flex-col items-center gap-1 ${activePage === 'profile' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'} transition-colors`}
                >
                    <User size={24} />
                </button>
            </div>
        </motion.div>
    );
}
