import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, CheckCircle, XCircle, AlertTriangle, Database, Wallet, PiggyBank, Receipt, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

type StatusState = 'uploading' | 'validating' | 'preview' | 'error' | 'importing' | 'success';

interface MigrationStatusScreenProps {
    onBack: () => void;
    onDone: () => void;
}

const MigrationStatusScreen: React.FC<MigrationStatusScreenProps> = ({ onBack, onDone }) => {
    const [status, setStatus] = useState<StatusState>('uploading');

    useEffect(() => {
        // Simulate initial flow
        if (status === 'uploading') {
            const timer = setTimeout(() => setStatus('validating'), 1500);
            return () => clearTimeout(timer);
        }
        if (status === 'validating') {
            const timer = setTimeout(() => setStatus('preview'), 2000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleConfirm = () => {
        setStatus('importing');
        setTimeout(() => {
            setStatus('success');
        }, 2500);
    };

    const handleSimulateError = () => {
        if (status === 'preview') {
            setStatus('error');
        } else {
            setStatus('uploading'); // Reset
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'uploading':
            case 'validating':
                return (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                            <Loader2 size={64} className="text-blue-500 animate-spin relative z-10" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-white">
                                {status === 'uploading' ? 'Uploading files...' : 'Analyzing data...'}
                            </h3>
                            <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                {status === 'uploading'
                                    ? 'Sending your backup securely to our server.'
                                    : 'Cross-referencing your .mmbak database with the report totals.'}
                            </p>
                        </div>
                    </div>
                );

            case 'preview':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col items-center text-center space-y-2 mb-8">
                            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                                <CheckCircle size={32} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Validation Successful</h3>
                            <p className="text-gray-400 text-sm">Your data matches perfectly. Ready to import.</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2 text-gray-500">
                                    <Wallet size={16} />
                                    <span className="text-xs font-semibold uppercase">Wallets</span>
                                </div>
                                <p className="text-2xl font-bold text-white">5</p>
                            </div>
                            <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2 text-gray-500">
                                    <PiggyBank size={16} />
                                    <span className="text-xs font-semibold uppercase">Jars (Categories)</span>
                                </div>
                                <p className="text-2xl font-bold text-white">12</p>
                            </div>
                            <div className="col-span-2 bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1 text-gray-500">
                                        <Receipt size={16} />
                                        <span className="text-xs font-semibold uppercase">Transactions</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">2,453</p>
                                </div>
                                <ChevronRight className="text-gray-700" />
                            </div>
                        </div>

                        {/* Totals Summary */}
                        <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-2xl space-y-3">
                            <h4 className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">Total Verified</h4>
                            <div className="flex justify-between items-end border-b border-blue-500/10 pb-3">
                                <span className="text-gray-400 text-sm">Income</span>
                                <span className="text-green-400 font-mono font-medium">+ $45,230.00</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-gray-400 text-sm">Expenses</span>
                                <span className="text-red-400 font-mono font-medium">- $12,450.50</span>
                            </div>
                        </div>
                    </motion.div>
                );

            case 'error':
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6 pt-8"
                    >
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                <XCircle size={40} className="text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Validation Failed</h3>
                            <p className="text-red-200/80 text-sm max-w-xs">
                                Totals in database do not match the Excel report.
                            </p>
                        </div>

                        <div className="bg-red-950/30 border border-red-900/50 p-6 rounded-2xl space-y-4">
                            <div className="flex items-center gap-3 text-red-400 mb-2">
                                <AlertTriangle size={20} />
                                <span className="font-semibold">Discrepancy Detected</span>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Database Income:</span>
                                    <span className="text-white font-mono">$45,230.00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Report Income:</span>
                                    <span className="text-white font-mono">$45,500.00</span>
                                </div>
                                <div className="h-px bg-red-800/50 my-2"></div>
                                <div className="flex justify-between text-red-400 font-bold">
                                    <span>Difference:</span>
                                    <span className="font-mono">-$270.00</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-center text-gray-500">
                            Please check if you uploaded the correct files from the same export session.
                        </p>
                    </motion.div>
                );

            case 'importing':
                return (
                    <div className="flex flex-col items-center justify-center py-12 space-y-8">
                        <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden max-w-xs">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2.5, ease: "easeInOut" }}
                                className="h-full bg-blue-500"
                            />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-white mb-1">Importing Data...</h3>
                            <p className="text-gray-500 text-xs">Writing 2,453 transactions to database.</p>
                        </div>
                    </div>
                );

            case 'success':
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-8 space-y-6"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/20 blur-[60px] rounded-full"></div>
                            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center shadow-lg relative z-10">
                                <CheckCircle size={48} className="text-white" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-3xl font-bold text-white">All Done!</h3>
                            <p className="text-gray-400 max-w-xs mx-auto">
                                Your history has been successfully migrated to JarWise.
                            </p>
                        </div>

                        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 w-full">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Database size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-gray-500">Data Updated</p>
                                    <p className="text-sm font-semibold text-white">Just now</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 p-4">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    {status !== 'success' && status !== 'importing' && (
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                            disabled={status === 'uploading' || status === 'validating'}
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <h1 className="text-lg font-semibold text-white">
                        {status === 'success' ? 'Import Complete' : 'Migration Status'}
                    </h1>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-lg mx-auto w-full flex flex-col justify-center min-h-[60vh]">
                {renderContent()}
            </main>

            {/* Footer Actions */}
            <footer className="p-6 border-t border-gray-800 bg-gray-950/80 backdrop-blur-xl">
                <div className="max-w-lg mx-auto space-y-4">
                    {status === 'preview' && (
                        <button
                            onClick={handleConfirm}
                            className="w-full py-4 rounded-xl font-bold text-base bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 active:scale-[0.98] transition-all"
                        >
                            Confirm Import
                        </button>
                    )}

                    {status === 'error' && (
                        <button
                            onClick={onBack}
                            className="w-full py-4 rounded-xl font-bold text-base bg-gray-800 text-white hover:bg-gray-700 active:scale-[0.98] transition-all"
                        >
                            Try Again
                        </button>
                    )}

                    {status === 'success' && (
                        <button
                            onClick={onDone}
                            className="w-full py-4 rounded-xl font-bold text-base bg-gray-100 text-gray-900 hover:bg-white active:scale-[0.98] transition-all"
                        >
                            Go to Dashboard
                        </button>
                    )}

                    {(status === 'preview' || status === 'error') && (
                        <button
                            onClick={handleSimulateError}
                            className="w-full text-center text-xs text-gray-600 hover:text-gray-400 py-2"
                        >
                            {status === 'error' ? 'Reset Mock State' : '[Debug] Simulate Validation Error'}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default MigrationStatusScreen;
