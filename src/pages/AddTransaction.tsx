import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Wallet } from 'lucide-react';

interface AddTransactionProps {
    onBack: () => void;
    onSave: (transaction: any) => void;
}

const JARS = [
    { id: 'necessities', name: 'Necessities', color: 'bg-blue-500', icon: '🏠' },
    { id: 'education', name: 'Education', color: 'bg-green-500', icon: '📚' },
    { id: 'savings', name: 'Savings', color: 'bg-yellow-500', icon: '🐷' },
    { id: 'play', name: 'Play', color: 'bg-pink-500', icon: '🎮' },
    { id: 'investment', name: 'Investment', color: 'bg-purple-500', icon: '📈' },
    { id: 'give', name: 'Give', color: 'bg-red-500', icon: '🎁' },
];

export default function AddTransaction({ onBack, onSave }: AddTransactionProps) {
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [selectedJar, setSelectedJar] = useState(JARS[0].id);

    const handleSave = () => {
        if (!amount || parseFloat(amount) <= 0) return;

        onSave({
            id: Date.now().toString(),
            amount: parseFloat(amount),
            jarId: selectedJar,
            note,
            date: new Date(),
            type: 'expense' // Default to expense for now
        });
        onBack();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-400" />
                </button>
                <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Add Transaction
                </h1>
                <div className="w-10" /> {/* Spacer */}
            </header>

            <main className="px-4 py-6 space-y-8">
                {/* Amount Input */}
                <section className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">$</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            autoFocus
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-6 pl-10 pr-4 text-3xl font-bold text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono"
                        />
                    </div>
                </section>

                {/* Jar Selector */}
                <section className="space-y-3">
                    <label className="text-sm font-medium text-gray-400">Select Jar</label>
                    <div className="grid grid-cols-2 gap-3">
                        {JARS.map((jar) => (
                            <motion.button
                                key={jar.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedJar(jar.id)}
                                className={`p-4 rounded-xl border transition-all relative overflow-hidden ${selectedJar === jar.id
                                    ? 'bg-gray-800 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
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
            </main>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 left-0 right-0 px-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${amount && parseFloat(amount) > 0
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-900/20'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <Save className="w-5 h-5" />
                    Save Transaction
                </motion.button>
            </div>
        </div>
    );
}
