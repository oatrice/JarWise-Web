import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Coins, DollarSign, Wallet, CloudUpload, LogOut } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import type { CurrencyCode } from '../context/CurrencyContext';
import SyncStatusIndicator from '../components/SyncStatusIndicator';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import type { SyncStatus } from '../hooks/useAuthMock';

interface SettingsOverlayProps {
    onBack: () => void;
    // Mock auth props
    isLoggedIn?: boolean;
    userName?: string;
    userAvatar?: string;
    syncStatus?: SyncStatus;
    lastBackupTime?: Date | null;
    onBackupNow?: () => void;
    onLogout?: (deleteData: boolean) => void;
}

import ManageWallets from './ManageWallets';

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
    onBack,
    isLoggedIn = true,
    userName = 'Anna Smith',
    userAvatar = 'https://ui-avatars.com/api/?name=Anna+Smith&background=6366f1&color=fff&size=128',
    syncStatus = 'success',
    lastBackupTime = new Date(),
    onBackupNow,
    onLogout,
}) => {
    const { currency, setCurrency } = useCurrency();
    const [showCurrencySelection, setShowCurrencySelection] = useState(false);
    const [showManageWallets, setShowManageWallets] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const currencies: { code: CurrencyCode; name: string; symbol: string; flag: string }[] = [
        { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
        { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
        { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
        { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    ];

    if (showManageWallets) {
        return <ManageWallets onClose={() => setShowManageWallets(false)} />;
    }

    if (showCurrencySelection) {
        return (
            <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="flex items-center gap-4 p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
                    <button
                        onClick={() => setShowCurrencySelection(false)}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-semibold text-white">Select Currency</h1>
                </div>

                {/* List */}
                <div className="p-4 space-y-2">
                    {currencies.map((c) => (
                        <button
                            key={c.code}
                            onClick={() => {
                                setCurrency(c.code);
                                setShowCurrencySelection(false);
                            }}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${currency === c.code
                                ? 'bg-primary-500/10 border-primary-500/50 text-primary-400'
                                : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{c.flag}</span>
                                <div className="flex flex-col items-start">
                                    <span className="font-medium text-white">{c.code}</span>
                                    <span className="text-xs opacity-70">{c.name}</span>
                                </div>
                            </div>
                            {currency === c.code && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-semibold text-white">Settings</h1>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">

                {/* Profile Section (Google Login Mock) */}
                {isLoggedIn && (
                    <section className="space-y-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Profile</h3>
                        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden p-4">
                            <div className="flex items-center gap-4 mb-4">
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    className="w-14 h-14 rounded-full border-2 border-gray-700"
                                />
                                <div>
                                    <p className="text-white font-semibold">{userName}</p>
                                    <SyncStatusIndicator status={syncStatus} lastBackupTime={lastBackupTime} />
                                </div>
                            </div>

                            {/* Backup Button */}
                            <button
                                onClick={onBackupNow}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium transition-colors mb-3"
                            >
                                <CloudUpload size={18} />
                                Back up now
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white font-medium transition-colors"
                            >
                                <LogOut size={18} />
                                Log out
                            </button>
                        </div>
                    </section>
                )}

                {/* Account Section */}
                <section className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Accounts</h3>
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                        <button
                            onClick={() => setShowManageWallets(true)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-3 text-white">
                                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                                    <Wallet size={20} />
                                </div>
                                <span className="font-medium">Manage Wallets</span>
                            </div>
                            < ChevronRight size={18} className="text-gray-500" />
                        </button>
                    </div>
                </section>

                {/* General Section */}
                <section className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">General</h3>
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                        <button
                            onClick={() => setShowCurrencySelection(true)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-3 text-white">
                                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                                    <Coins size={20} />
                                </div>
                                <span className="font-medium">Currency</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <span>{currency}</span>
                                <ChevronRight size={18} />
                            </div>
                        </button>
                    </div>
                </section>

                {/* Appearance Section (Mock) */}
                <section className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Appearance</h3>
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                        {/* Mock Theme Setting */}
                        <button className="w-full flex items-center justify-between p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center gap-3 text-white">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                    <Wallet size={20} /> {/* Reusing Wallet icon as placeholder */}
                                </div>
                                <span className="font-medium">App Theme</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <span>Dark</span>
                                <ChevronRight size={18} />
                            </div>
                        </button>
                    </div>
                </section>

                {/* About Section (Mock) */}
                <section className="space-y-3">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center gap-3 text-white">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    <DollarSign size={20} /> {/* Placeholder */}
                                </div>
                                <span className="font-medium">About JarWise</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <span className="text-xs">v1.0.0</span>
                                <ChevronRight size={18} />
                            </div>
                        </button>
                    </div>
                </section>

                <div className="pt-8 text-center">
                    <p className="text-xs text-gray-600">JarWise Mobile Web</p>
                </div>

            </div>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onLogoutKeepData={() => {
                    setShowLogoutModal(false);
                    onLogout?.(false);
                }}
                onLogoutDeleteData={() => {
                    setShowLogoutModal(false);
                    onLogout?.(true);
                }}
            />
        </div>
    );
};

export default SettingsOverlay;
