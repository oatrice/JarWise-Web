import { motion } from 'framer-motion';
import { jars, transactions } from '../utils/mockData';
import JarCard from '../components/JarCard';
import TransactionCard from '../components/TransactionCard';
import { Flame, Bell, Search, Plus } from 'lucide-react';

export default function Dashboard() {
    const totalBalance = jars.reduce((acc, jar) => acc + jar.current, 0);

    return (
        <div className="min-h-screen bg-gray-950 pb-24 font-sans text-gray-100 selection:bg-blue-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
                <div className="mx-auto max-w-md px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-[2px]">
                                <img src="https://ui-avatars.com/api/?name=User&background=0D0D0D&color=fff" alt="User" className="h-full w-full rounded-full border-2 border-gray-950" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Welcome back</p>
                                <h2 className="text-sm font-semibold text-gray-100">Oatrice</h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white transition-colors hover:border-gray-700">
                                <Search size={20} />
                            </button>
                            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white transition-colors hover:border-gray-700">
                                <Bell size={20} />
                                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-900" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <p className="mb-1 text-sm font-medium text-gray-400">Total Balance</p>
                            <motion.h1
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-4xl font-bold tracking-tight text-white"
                            >
                                ${totalBalance.toLocaleString()}
                            </motion.h1>
                        </div>
                        <div className="mb-1 flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                            <Flame size={16} className="text-orange-500 fill-orange-500 animate-[pulse_3s_ease-in-out_infinite]" />
                            <span className="text-sm font-bold text-orange-400">5 Day Streak!</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-md px-6 py-8 space-y-8">
                {/* Jars Grid */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-100">Your Jars</h3>
                        <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">View All</button>
                    </div>
                    <div className="grid gap-4">
                        {jars.map((jar, index) => (
                            <JarCard key={jar.id} jar={jar} index={index} />
                        ))}
                    </div>
                </section>

                {/* Recent Transactions */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-100">Recent Activity</h3>
                    </div>
                    <div className="space-y-3">
                        {transactions.map((t) => (
                            <TransactionCard key={t.id} transaction={t} />
                        ))}
                    </div>
                </section>
            </main>

            {/* FAB */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="fixed bottom-6 right-6 z-50"
            >
                <button className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/40 text-white hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all">
                    <Plus size={28} />
                </button>
            </motion.div>
        </div>
    );
}
