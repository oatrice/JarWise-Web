import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Wallet as WalletIcon, FolderOpen, Trash2, X } from 'lucide-react';

import { wallets as initialWallets, type Wallet } from '../utils/generatedMockData';

interface ManageWalletsProps {
    onClose: () => void;
}

export default function ManageWallets({ onClose }: ManageWalletsProps) {
    const [wallets, setWallets] = useState<Wallet[]>(initialWallets);
    const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Group wallets for tree view
    const rootWallets = wallets.filter(w => w.parentId === null);
    const getChildren = (parentId: string) => wallets.filter(w => w.parentId === parentId);

    const updateWallet = (id: string, updates: Partial<Wallet>) => {
        setWallets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    };

    const handleAddWallet = (newWallet: Omit<Wallet, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setWallets([...wallets, { ...newWallet, id }]);
        setShowAddModal(false);
    };

    const handleDelete = (id: string) => {
        const hasChildren = wallets.some(w => w.parentId === id);
        if (hasChildren) {
            alert("Cannot delete a wallet that has sub-accounts. Please move or delete them first.");
            return;
        }
        if (confirm("Are you sure you want to delete this wallet?")) {
            setWallets(prev => prev.filter(w => w.id !== id));
            setSelectedWalletId(null);
        }
    };

    const renderWalletItem = (wallet: Wallet, depth: number = 0) => {
        const isSelected = selectedWalletId === wallet.id;
        const Icon = wallet.icon;

        return (
            <div key={wallet.id} className="mb-3 relative">
                {/* Vertical Line from previous sibling to this one (if not first child) */}
                {depth > 0 && (
                    <div className="absolute -left-4 top-0 bottom-1/2 w-px bg-gray-700" />
                )}

                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedWalletId(isSelected ? null : wallet.id)}
                    className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-gray-800/80 border-gray-600' : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                        }`}
                    style={{ marginLeft: `${depth * 32}px` }}
                >
                    <div className="flex items-center gap-4">
                        {/* Horizontal Connector (Curve) */}
                        {depth > 0 && (
                            <div className="absolute -left-8 top-1/2 w-8 h-px bg-gray-700" />
                        )}

                        <div className={`p-3 rounded-xl bg-gray-800/80`}>
                            <Icon size={20} className={wallet.color} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                {wallet.name}
                                {depth > 0 && <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">Sub</span>}
                            </h3>
                            <p className="text-sm text-gray-500">${wallet.balance.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Editor Panel */}
                    <AnimatePresence>
                        {isSelected && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 mt-4 border-t border-gray-700 space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="text-xs font-medium text-gray-400 mb-2 block">Name</label>
                                        <input
                                            type="text"
                                            value={wallet.name}
                                            onChange={(e) => updateWallet(wallet.id, { name: e.target.value })}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none"
                                        />
                                    </div>

                                    {/* Parent Selector */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                                            <FolderOpen size={14} /> Parent Wallet
                                        </label>
                                        <select
                                            value={wallet.parentId || ""}
                                            onChange={(e) => {
                                                const newParentId = e.target.value || null;
                                                // Prevent self-selection
                                                if (newParentId === wallet.id) return;
                                                updateWallet(wallet.id, {
                                                    parentId: newParentId,
                                                    level: newParentId ? 1 : 0
                                                });
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none"
                                        >
                                            <option value="">(No Parent)</option>
                                            {rootWallets.filter(p => p.id !== wallet.id).map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(wallet.id); }}
                                            className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold flex items-center gap-1"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Render Children */}
                {getChildren(wallet.id).length > 0 && (
                    <div className="mt-2">
                        {getChildren(wallet.id).map(child => renderWalletItem(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl"
        >
            <div className="h-full overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-4 py-4">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                                <ArrowLeft size={20} className="text-gray-400" />
                            </button>
                            <h1 className="text-xl font-bold text-white">Manage Wallets</h1>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                        >
                            <Plus size={16} /> Add Wallet
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="max-w-2xl mx-auto px-4 py-6">
                    {rootWallets.map(w => renderWalletItem(w))}
                </div>
            </div>

            {/* Add Wallet Modal Placeholder - Can be separate component */}
            {showAddModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 w-full max-w-sm m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">New Wallet</h3>
                            <button onClick={() => setShowAddModal(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <input placeholder="Wallet Name" className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white" id="new-wallet-name" />
                            <select className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white" id="new-wallet-parent">
                                <option value="">No Parent</option>
                                {rootWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                            <button
                                onClick={() => {
                                    const nameInput = document.getElementById('new-wallet-name') as HTMLInputElement;
                                    const parentSelect = document.getElementById('new-wallet-parent') as HTMLSelectElement;
                                    if (nameInput.value) {
                                        handleAddWallet({
                                            name: nameInput.value,
                                            balance: 0,
                                            color: 'text-blue-500',
                                            icon: WalletIcon,
                                            parentId: parentSelect.value || null,
                                            level: parentSelect.value ? 1 : 0
                                        });
                                    }
                                }}
                                className="w-full bg-blue-500 py-3 rounded-xl font-bold text-white"
                            >
                                Create Wallet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
