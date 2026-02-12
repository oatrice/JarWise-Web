import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import MultiSelectDropdown, { type MultiSelectOption } from './MultiSelectDropdown';

interface ReportFiltersSheetProps {
    open: boolean;
    jarOptions: MultiSelectOption[];
    walletOptions: MultiSelectOption[];
    selectedJarIds: string[];
    selectedWalletIds: string[];
    onApply: (jarIds: string[], walletIds: string[]) => void;
    onClose: () => void;
}

export default function ReportFiltersSheet({
    open,
    jarOptions,
    walletOptions,
    selectedJarIds,
    selectedWalletIds,
    onApply,
    onClose,
}: ReportFiltersSheetProps) {
    const [draftJarIds, setDraftJarIds] = useState<string[]>(selectedJarIds);
    const [draftWalletIds, setDraftWalletIds] = useState<string[]>(selectedWalletIds);

    useEffect(() => {
        if (open) {
            setDraftJarIds(selectedJarIds);
            setDraftWalletIds(selectedWalletIds);
        }
    }, [open, selectedJarIds, selectedWalletIds]);

    const handleClear = () => {
        setDraftJarIds([]);
        setDraftWalletIds([]);
    };

    const handleApply = () => {
        onApply(draftJarIds, draftWalletIds);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-end justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60"
                        aria-label="Close filters"
                    />
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                        className="relative w-full max-w-md rounded-t-3xl border border-gray-800 bg-gray-950 px-6 pb-8 pt-6 shadow-2xl"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                                    <Filter size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Report Filters</h2>
                                    <p className="text-xs text-gray-500">Select jars and wallets for this view.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full border border-gray-800 bg-gray-900/70 p-2 text-gray-400 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <MultiSelectDropdown
                                label="Jars"
                                options={jarOptions}
                                selectedIds={draftJarIds}
                                onChange={setDraftJarIds}
                                placeholder="Select jars"
                            />
                            <MultiSelectDropdown
                                label="Wallets"
                                options={walletOptions}
                                selectedIds={draftWalletIds}
                                onChange={setDraftWalletIds}
                                placeholder="Select wallets"
                            />
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-4">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="rounded-full border border-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-700 hover:text-white"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={handleApply}
                                className="rounded-full bg-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
