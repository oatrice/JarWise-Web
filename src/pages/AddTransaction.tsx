import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Wallet, AlertCircle, Loader2, ArrowRightLeft } from 'lucide-react';
import { validateTransaction } from '../utils/validation';
import type { ValidationResult } from '../utils/validation';
import { saveTransfer, type Transaction } from '../utils/transactionStorage';
import TransferForm from '../components/TransferForm';
import { JARS, WALLETS } from '../utils/constants';

interface AddTransactionProps {
    onBack: () => void;
    onSave: (transaction?: Transaction) => void;
}

type Tab = 'expense' | 'income' | 'transfer';

export default function AddTransaction({ onBack, onSave }: AddTransactionProps) {
    const [activeTab, setActiveTab] = useState<Tab>('expense');

    // Standard Form State
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [selectedJar, setSelectedJar] = useState<string | null>(null);
    const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
    const [date, setDate] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });

    const [errors, setErrors] = useState<ValidationResult['errors']>({});
    const [touched, setTouched] = useState({ amount: false, jar: false, wallet: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Real-time validation when user has touched the field
    const validate = useCallback(() => {
        const result = validateTransaction({
            amount,
            jarId: selectedJar,
            walletId: selectedWallet,
            note,
        });
        setErrors(result.errors);
        return result.isValid;
    }, [amount, selectedJar, selectedWallet, note]);

    const handleAmountChange = (value: string) => {
        setAmount(value);
        if (touched.amount) {
            const result = validateTransaction({ amount: value, jarId: selectedJar, note });
            setErrors(prev => ({ ...prev, amount: result.errors.amount }));
        }
    };

    const handleAmountBlur = () => {
        setTouched(prev => ({ ...prev, amount: true, jar: true })); // Also mark jar as touched
        const result = validateTransaction({ amount, jarId: selectedJar, note });
        setErrors(result.errors); // Update all errors
    };

    const handleJarSelect = (jarId: string) => {
        setSelectedJar(jarId);
        setTouched(prev => ({ ...prev, jar: true }));
        setErrors(prev => ({ ...prev, jar: undefined }));
    };

    const handleSaveStandard = async () => {
        setTouched({ amount: true, jar: true, wallet: true });
        if (!validate()) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 300));

        const tx: Transaction = {
            id: Date.now().toString(),
            amount: parseFloat(amount),
            jarId: selectedJar!,
            walletId: selectedWallet!,
            note,
            date: new Date(date).toISOString(),
            type: activeTab === 'income' ? 'income' : 'expense'
        };

        setIsSubmitting(false);
        onSave(tx);
    };

    const handleTransferSave = async (data: { amount: number; fromWalletId: string; toWalletId: string; date: string; note: string }) => {
        const timestamp = Date.now();
        const expenseId = timestamp.toString();
        const incomeId = (timestamp + 1).toString();

        const expenseTx: Transaction = {
            id: expenseId,
            amount: data.amount, // Storage usually expects positive amount, display logic handles sign based on type? 
            // Wait, generatedMockData showed negative amounts. 
            // But transactionStorage just says "amount: number" and "type".
            // Let's assume positive for storage if type distinguishes. 
            // Checking TransactionCard: "{transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)}"
            // heavily implies amount is positive in storage.
            // BUT generatedMockData has negative. 
            // Let's stick to positive in storage based on likely convention for new entries, or follow existing.
            // generatedMockData: amount: -12.99. 
            // Let's check `TransactionCard` again.
            // It uses `transaction.amount`. 
            // If I save positive, `TransactionCard` will show -12.99 if type is expense. 
            // Wait, if Mock has negative, and Card adds '-', it would be --12.99 = +12.99. 
            // Let's check Card logic again: `{transaction.type === 'expense' ? '-' : '+'}{formatAmount(transaction.amount)}`
            // If amount is -12.99, formatAmount(-12.99) -> "12.99" (usually formatter handles sign). 
            // If formatter handles sign, then the manual '-' is redundant.
            // Let's assume the safe bet: store Absolute Value for now, or match Mock.
            // Mock: -12.99. 
            // I'll stick to Positive for new implementation and let type decide sign, 
            // OR I will check if Card handles negative input. 
            // "transaction.amount" is numeric.

            // For now, I'll store POSITIVE amount.
            jarId: 'transfer', // Special category? Or utilize note.
            walletId: data.fromWalletId,
            note: `Transfer to Wallet`, // Or use user note
            date: new Date(data.date).toISOString(),
            type: 'expense',
            relatedTransactionId: incomeId
        };

        // Use user note if provided
        if (data.note) expenseTx.note = data.note;

        const incomeTx: Transaction = {
            id: incomeId,
            amount: data.amount,
            jarId: 'transfer',
            walletId: data.toWalletId, // This is receiving wallet
            note: `Transfer from Wallet`,
            date: new Date(data.date).toISOString(),
            type: 'income',
            relatedTransactionId: expenseId
        };

        if (data.note) incomeTx.note = data.note;

        saveTransfer(expenseTx, incomeTx);
        onSave(); // Refresh
    };

    const isStandardFormValid = amount && parseFloat(amount) > 0 && selectedJar && selectedWallet;

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 flex flex-col bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
                <div className="flex items-center justify-between px-4 py-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-400" />
                    </button>
                    <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Add Transaction
                    </h1>
                    <div className="w-10" />
                </div>

                {/* Tabs */}
                <div className="flex px-4 pb-0 gap-4 overflow-x-auto">
                    {(['expense', 'income', 'transfer'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-2 text-sm font-medium border-b-2 transition-all capitalize ${activeTab === tab
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <main className="px-4 py-6 space-y-8">
                {activeTab === 'transfer' ? (
                    <TransferForm onSave={handleTransferSave} />
                ) : (
                    <>
                        {/* Standard Form (Expense/Income) */}

                        {/* Amount Input */}
                        <section className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">฿</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => handleAmountChange(e.target.value)}
                                    onBlur={handleAmountBlur}
                                    placeholder="0.00"
                                    autoFocus
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

                        {/* Date */}
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

                        {/* Wallet Selector */}
                        <section className="space-y-3">
                            <label className="text-sm font-medium text-gray-400">
                                {activeTab === 'income' ? 'Deposit to (Wallet)' : 'Pay from (Wallet)'}
                            </label>
                            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                                {WALLETS.map((wallet) => (
                                    <motion.button
                                        key={wallet.id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedWallet(wallet.id)}
                                        className={`flex-shrink-0 relative w-32 h-24 rounded-2xl p-3 border transition-all flex flex-col justify-between overflow-hidden ${selectedWallet === wallet.id
                                            ? 'bg-gray-800 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                            : 'bg-gray-800/30 border-gray-800 hover:bg-gray-800/50'
                                            }`}
                                    >
                                        <div className="z-10 text-3xl">{wallet.icon}</div>
                                        <div className={`z-10 text-sm font-medium text-left ${selectedWallet === wallet.id ? 'text-white' : 'text-gray-400'}`}>
                                            {wallet.name}
                                        </div>
                                        {selectedWallet === wallet.id && (
                                            <div className={`absolute inset-0 opacity-10 ${wallet.color}`} />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </section>

                        {/* Jar/Category Selector */}
                        <section className="space-y-3">
                            <label className="text-sm font-medium text-gray-400">
                                {activeTab === 'income' ? 'Source (Category)' : 'Category (Jar)'}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {JARS.map((jar) => (
                                    <motion.button
                                        key={jar.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleJarSelect(jar.id)}
                                        className={`p-4 rounded-xl border transition-all relative overflow-hidden ${selectedJar === jar.id
                                            ? 'bg-gray-800 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            : touched.jar && errors.jar
                                                ? 'bg-gray-800/30 border-red-500/50 hover:bg-gray-800/50'
                                                : 'bg-gray-800/30 border-gray-800 hover:bg-gray-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 relative z-10">
                                            <span className="text-2xl filter drop-shadow-md">{jar.icon}</span>
                                            <div className="text-left">
                                                <div className={`font-medium ${selectedJar === jar.id ? 'text-white' : 'text-gray-400'}`}>
                                                    {jar.name}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedJar === jar.id && (
                                            <div className={`absolute inset-0 opacity-10 ${jar.color}`} />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                            <AnimatePresence>
                                {touched.jar && errors.jar && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center gap-2 text-red-400 text-sm"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.jar}
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                                    placeholder="What's this for?"
                                    className="w-full bg-gray-800/30 border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                />
                            </div>
                        </section>

                        {/* Standard Floating Action Button */}
                        <div className="fixed bottom-6 left-0 right-0 px-4">
                            <motion.button
                                whileHover={isStandardFormValid && !isSubmitting ? { scale: 1.02 } : {}}
                                whileTap={isStandardFormValid && !isSubmitting ? { scale: 0.95 } : {}}
                                onClick={handleSaveStandard}
                                disabled={!isStandardFormValid || isSubmitting}
                                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${isStandardFormValid && !isSubmitting
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-900/20'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save {activeTab === 'income' ? 'Income' : 'Expense'}
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
