import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Wallet, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { WALLETS } from '../utils/constants';

interface TransferFormProps {
    onSave: (data: { amount: number; fromWalletId: string; toWalletId: string; date: string; note: string }) => Promise<void>;
}

export default function TransferForm({ onSave }: TransferFormProps) {
    const [amount, setAmount] = useState('');
    const [fromWalletId, setFromWalletId] = useState<string | null>(null);
    const [toWalletId, setToWalletId] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [date, setDate] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });

    const [touched, setTouched] = useState({ amount: false, fromWallet: false, toWallet: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const errors: { amount?: string; fromWallet?: string; toWallet?: string } = {};

        if (!amount || parseFloat(amount) <= 0) errors.amount = 'Please enter a valid amount';
        if (!fromWalletId) errors.fromWallet = 'Select source wallet';
        if (!toWalletId) errors.toWallet = 'Select destination wallet';
        if (fromWalletId && toWalletId && fromWalletId === toWalletId) errors.toWallet = 'Cannot transfer to same wallet';

        return errors;
    };

    const errors = validate();
    const isFormValid = Object.keys(errors).length === 0;

    const handleSave = async () => {
        setTouched({ amount: true, fromWallet: true, toWallet: true });

        if (!isFormValid) return;

        setIsSubmitting(true);
        await onSave({
            amount: parseFloat(amount),
            fromWalletId: fromWalletId!,
            toWalletId: toWalletId!,
            date,
            note
        });
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-8">
            {/* Amount Input */}
            <section className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Amount to Transfer</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">฿</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onBlur={() => setTouched(prev => ({ ...prev, amount: true }))}
                        placeholder="0.00"
                        className={`w-full bg-gray-800/50 border rounded-2xl py-6 pl-10 pr-4 text-3xl font-bold text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all font-mono ${touched.amount && errors.amount
                            ? 'border-red-500 focus:ring-red-500/50'
                            : 'border-gray-700 focus:ring-blue-500/50'
                            }`}
                    />
                </div>
                <AnimatePresence>
                    {touched.amount && errors.amount && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 text-red-400 text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {errors.amount}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Date & Time Picker */}
            <section className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Date & Time</label>
                <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                    style={{ colorScheme: 'dark' }}
                />
            </section>

            {/* From Wallet */}
            <section className="space-y-3">
                <label className="text-sm font-medium text-gray-400">From (Source)</label>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {WALLETS.map((wallet) => (
                        <motion.button
                            key={wallet.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFromWalletId(wallet.id)}
                            className={`flex-shrink-0 relative w-32 h-24 rounded-2xl p-3 border transition-all flex flex-col justify-between overflow-hidden ${fromWalletId === wallet.id
                                ? 'bg-gray-800 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                : 'bg-gray-800/30 border-gray-800 hover:bg-gray-800/50'
                                }`}
                        >
                            <div className="z-10 text-3xl">{wallet.icon}</div>
                            <div className={`z-10 text-sm font-medium text-left ${fromWalletId === wallet.id ? 'text-white' : 'text-gray-400'}`}>
                                {wallet.name}
                            </div>
                            {fromWalletId === wallet.id && (
                                <div className={`absolute inset-0 opacity-10 bg-red-500`} />
                            )}
                        </motion.button>
                    ))}
                </div>
                {touched.fromWallet && errors.fromWallet && <div className="text-red-400 text-sm flex gap-2 items-center"><AlertCircle size={14} />{errors.fromWallet}</div>}
            </section>

            {/* Arrow Indicator */}
            <div className="flex justify-center -my-2">
                <div className="bg-gray-800 p-2 rounded-full border border-gray-700">
                    <ArrowRight className="text-gray-400" />
                </div>
            </div>

            {/* To Wallet */}
            <section className="space-y-3">
                <label className="text-sm font-medium text-gray-400">To (Destination)</label>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {WALLETS.map((wallet) => (
                        <motion.button
                            key={wallet.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setToWalletId(wallet.id)}
                            className={`flex-shrink-0 relative w-32 h-24 rounded-2xl p-3 border transition-all flex flex-col justify-between overflow-hidden ${toWalletId === wallet.id
                                ? 'bg-gray-800 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                : 'bg-gray-800/30 border-gray-800 hover:bg-gray-800/50'
                                }`}
                        >
                            <div className="z-10 text-3xl">{wallet.icon}</div>
                            <div className={`z-10 text-sm font-medium text-left ${toWalletId === wallet.id ? 'text-white' : 'text-gray-400'}`}>
                                {wallet.name}
                            </div>
                            {toWalletId === wallet.id && (
                                <div className={`absolute inset-0 opacity-10 bg-green-500`} />
                            )}
                        </motion.button>
                    ))}
                </div>
                {touched.toWallet && errors.toWallet && <div className="text-red-400 text-sm flex gap-2 items-center"><AlertCircle size={14} />{errors.toWallet}</div>}
            </section>

            {/* Note Input */}
            <section className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Note (Optional)</label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Wallet className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Transfer details..."
                        className="w-full bg-gray-800/30 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                    />
                </div>
            </section>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 left-0 right-0 px-4">
                <motion.button
                    whileHover={isFormValid && !isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={isFormValid && !isSubmitting ? { scale: 0.95 } : {}}
                    onClick={handleSave}
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${isFormValid && !isSubmitting
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-blue-900/20'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing Transfer...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Confirm Transfer
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
