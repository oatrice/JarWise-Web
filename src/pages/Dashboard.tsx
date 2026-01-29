import { motion } from 'framer-motion';
import { jars } from '../utils/generatedMockData';
import { getDrafts } from '../utils/transactionStorage';
import type { Transaction } from '../utils/transactionStorage';
import JarCard from '../components/JarCard';
import TransactionCard from '../components/TransactionCard';
import { Flame, Bell, Search, Plus, Settings, PieChart, LogOut, ScanBarcode, User, Wallet, Inbox, MoreVertical, CloudUpload, FileText, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import ScanPage from './ScanPage';
import ImportSlip from './ImportSlip';
import SettingsOverlay from './SettingsOverlay';
import BottomNav from '../components/BottomNav';

type Page = 'dashboard' | 'history' | 'scan' | 'add-transaction';

import { useCurrency, type CurrencyCode } from '../context/CurrencyContext';

interface DashboardProps {
    onNavigate: (page: Page) => void;
    transactions?: Transaction[];
}

export default function Dashboard({ onNavigate, transactions = [] }: DashboardProps) {
    const { currency, setCurrency, formatAmount } = useCurrency();
    const totalBalance = jars.reduce((acc, jar) => acc + jar.current, 0);
    const [showScanner, setShowScanner] = useState(false);
    const [showImportSlip, setShowImportSlip] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Get drafts
    const drafts = getDrafts();

    // Group transactions by date
    const groupedTransactions: { date: string; transactions: Transaction[] }[] = [];
    transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        let lastGroup = groupedTransactions[groupedTransactions.length - 1];
        if (!lastGroup || lastGroup.date !== dateStr) {
            lastGroup = { date: dateStr, transactions: [] };
            groupedTransactions.push(lastGroup);
        }
        lastGroup.transactions.push(transaction);
    });

    const handleScan = (data: string) => {
        console.log("Scanned:", data);
        alert(`Scanned Code: ${data}`);
        setShowScanner(false);
    };

    if (showScanner) {
        return <ScanPage onClose={() => setShowScanner(false)} onScan={handleScan} />;
    }

    if (showImportSlip) {
        return <ImportSlip onBack={() => setShowImportSlip(false)} />;
    }

    if (showSettings) {
        return <SettingsOverlay onBack={() => setShowSettings(false)} />;
    }

    return (
        <div className="min-h-screen bg-gray-950 font-sans text-gray-100 selection:bg-blue-500/30">

            {/* =========================================
                MOBILE VIEW (Reverted to 16804dc)
                Visible only on screens < lg
               ========================================= */}
            <div className="lg:hidden pb-24">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
                    <div className="mx-auto max-w-md px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-[2px]">
                                    <img src="https://ui-avatars.com/api/?name=User&background=0D0D0D&color=fff" alt="User" className="h-full w-full rounded-full border-2 border-gray-950" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Welcome back</p>
                                    <h2 className="text-sm font-semibold text-gray-100">Oatrice</h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowScanner(true)}
                                    data-testid="scan-btn-mobile"
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white transition-colors hover:border-gray-700"
                                >
                                    <ScanBarcode size={20} />
                                </button>
                                <button
                                    onClick={() => setShowImportSlip(true)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white transition-colors hover:border-gray-700"
                                >
                                    <CloudUpload size={20} />
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white transition-colors hover:border-gray-700"
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {isMobileMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
                                            <div className="p-1">
                                                <button className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-800 hover:bg-gray-700 border-b border-gray-700/50">
                                                    <span className="text-white">Notifications</span>
                                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsMobileMenuOpen(false);
                                                        setShowSettings(true);
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-white bg-gray-800 hover:bg-gray-700"
                                                >
                                                    Settings
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header >

                <main className="mx-auto max-w-md px-6 py-8 space-y-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="mb-1 text-sm font-medium text-gray-400">Total Balance</p>
                            <motion.h1
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-4xl font-bold tracking-tight text-white"
                            >
                                {formatAmount(totalBalance)}
                            </motion.h1>
                        </div>
                        <div className="mb-1 flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                            <Flame size={16} className="text-orange-500 fill-orange-500 animate-[pulse_3s_ease-in-out_infinite]" />
                            <span className="text-sm font-bold text-orange-400">5 Day Streak!</span>
                        </div>
                    </div>

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
                        {/* Drafts Section */}
                        {drafts.length > 0 && (
                            <div className="mb-6 animate-in slide-in-from-bottom duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                                        <FileText className="text-yellow-500" size={20} />
                                        <span>Drafts to Review</span>
                                        <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-0.5 rounded-full">{drafts.length}</span>
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {drafts.map((t) => (
                                        <div key={t.id} onClick={() => setShowImportSlip(true)}>
                                            <TransactionCard transaction={t} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-100">Recent Activity</h3>
                        </div>
                        <div className="space-y-3">
                            {groupedTransactions.length > 0 ? (
                                groupedTransactions.map((group) => (
                                    <div key={group.date} className="space-y-3">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mt-4 mb-2">
                                            {group.date}
                                        </h4>
                                        {group.transactions.map((t) => (
                                            <TransactionCard key={t.id} transaction={t} showDate={false} />
                                        ))}
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gray-900/20 border border-gray-800/50 text-gray-500">
                                    <div className="p-4 rounded-full bg-gray-800/50 mb-3">
                                        <Inbox className="w-8 h-8 opacity-50" />
                                    </div>
                                    <p className="font-medium">No transactions yet</p>
                                    <button
                                        onClick={() => onNavigate('add-transaction')}
                                        className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                                    >
                                        Add your first transaction
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </main>

                {/* Floating Bottom Nav (Mobile) */}
                <BottomNav activePage="dashboard" onNavigate={onNavigate} />
            </div>


            {/* =========================================
                DESKTOP VIEW (New Implementation)
                Visible only on screens >= lg
               ========================================= */}
            < div className="hidden lg:flex flex-1" >
                {/* Desktop Sidebar */}
                < aside className="flex flex-col w-64 h-screen sticky top-0 border-r border-gray-800 bg-gray-950/50 backdrop-blur-xl p-6" >
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                            J
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">JarWise</span>
                    </div>

                    <nav className="flex-1 space-y-2">
                        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-blue-600/10 text-blue-400 font-medium transition-colors border border-blue-600/20">
                            <LayoutGrid size={20} />
                            Dashboard
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-900 text-gray-400 hover:text-gray-100 font-medium transition-colors">
                            <PieChart size={20} />
                            Analytics
                        </button>
                        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-900 text-gray-400 hover:text-gray-100 font-medium transition-colors">
                            <Settings size={20} />
                            Settings
                        </button>
                    </nav>

                    <div className="mt-auto pt-6 border-t border-gray-800">
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-[2px]">
                                <img src="https://ui-avatars.com/api/?name=User&background=0D0D0D&color=fff" alt="User" className="h-full w-full rounded-full border-2 border-gray-950" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h2 className="text-sm font-semibold text-gray-100 truncate">Oatrice</h2>
                                <p className="text-xs text-gray-500 truncate">oatrice@example.com</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 w-full px-2 text-sm text-gray-500 hover:text-red-400 transition-colors">
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </aside >

                {/* Main Content Area */}
                < div className="flex-1 w-full relative" >
                    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b -0 lg:bg-transparent lg:border-b-0">
                        <div className="mx-auto max-w-7xl px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                                    <p className="text-gray-400 text-sm">Overview of your 6 jars financial freedom system</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => onNavigate('add-transaction')}
                                        className="hidden sm:flex h-10 px-4 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors gap-2 text-sm font-semibold shadow-lg shadow-blue-900/20"
                                    >
                                        <Plus size={18} />
                                        <span>Add</span>
                                    </button>
                                    <button
                                        onClick={() => setShowScanner(true)}
                                        data-testid="scan-btn-desktop"
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white transition-colors hover:border-gray-700"
                                    >
                                        <ScanBarcode size={20} />
                                    </button>
                                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white transition-colors hover:border-gray-700">
                                        <Search size={20} />
                                    </button>
                                    <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-400 hover:text-white transition-colors hover:border-gray-700">
                                        <Bell size={20} />
                                        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-900" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="mx-auto max-w-7xl px-8 py-8 space-y-8 pb-28">
                        {/* Fancy Balance Card */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-[2rem] bg-gradient-to-br from-blue-600/20 via-indigo-900/20 to-gray-900/50 border border-blue-500/20 relative overflow-hidden group">
                            {/* Background FX */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/30 transition-all duration-700" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-blue-200/60">Total Balance</p>
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                                            className="flex items-center gap-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-blue-500/20"
                                        >
                                            {currency} <span className="text-blue-400">▼</span>
                                        </button>
                                        {isCurrencyDropdownOpen && (
                                            <div className="absolute right-0 top-full mt-2 w-32 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
                                                {['THB', 'USD', 'EUR', 'JPY', 'GBP'].map((c) => (
                                                    <button
                                                        key={c}
                                                        onClick={() => {
                                                            setCurrency(c as CurrencyCode);
                                                            setIsCurrencyDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${currency === c ? 'text-blue-400 font-medium bg-blue-900/10' : 'text-gray-400'}`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <motion.h1
                                    key={currency} // Animate on change
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-5xl font-bold tracking-tight text-white mb-2"
                                >
                                    {formatAmount(totalBalance)}
                                </motion.h1>
                                <div className="flex items-center gap-2 text-sm text-blue-200/40">
                                    <span className="text-green-400 font-medium">+{formatAmount(1293)} (8.2%)</span>
                                    <span>vs last month</span>
                                </div>
                            </div>
                            <div className="relative z-10 flex items-center gap-1.5 rounded-full bg-orange-500/10 px-4 py-2 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)] backdrop-blur-md">
                                <Flame size={18} className="text-orange-500 fill-orange-500 animate-[pulse_3s_ease-in-out_infinite]" />
                                <span className="text-sm font-bold text-orange-400">5 Day Streak!</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-8 items-start">
                            {/* Left Column: Jars */}
                            <div className="col-span-8 flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                                        <LayoutGrid size={20} className="text-blue-500" />
                                        Your Jars
                                    </h3>
                                    <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">View All Analysis</button>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {jars.map((jar, index) => (
                                        <JarCard key={jar.id} jar={jar} index={index} />
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Transactions */}
                            <div className="col-span-4 sticky top-32 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-100">Recent Activity</h3>
                                    <button className="text-xs text-gray-500 hover:text-white transition-colors">See all</button>
                                </div>
                                <div className="space-y-3 bg-gray-900/20 p-4 rounded-3xl border border-gray-800/50 backdrop-blur-sm">
                                    {transactions.length > 0 ? (
                                        transactions.slice(0, 3).map((t) => (
                                            <TransactionCard key={t.id} transaction={t} />
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-gray-500 text-sm">No recent activity</div>
                                    )}
                                    <button className="w-full py-3 mt-2 rounded-xl text-sm text-gray-500 hover:bg-gray-800/50 transition-colors border border-dashed border-gray-800 hover:border-gray-700">
                                        View Full History
                                    </button>
                                </div>
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden text-center">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                    <h4 className="relative z-10 text-white font-bold text-lg mb-2">Upgrade to Pro</h4>
                                    <p className="relative z-10 text-blue-100 text-sm mb-4">Unlock advanced charts and unlimited jars.</p>
                                    <button className="relative z-10 bg-white text-blue-600 px-6 py-2 rounded-full font-bold text-sm shadow-xl hover:bg-blue-50 transition-colors">
                                        Upgrade Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div >
            </div >
        </div >
    );
}
