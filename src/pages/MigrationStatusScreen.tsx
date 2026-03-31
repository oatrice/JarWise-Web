import React, { useEffect, useEffectEvent, useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle, XCircle, AlertTriangle, Database, Wallet, PiggyBank, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { ApiError, apiFetch } from '../lib/api';
import type { MigrationJobStatus, MigrationDuplicateItem } from '../types/migration';

interface MigrationStatusScreenProps {
    onBack: () => void;
    onDone: () => void | Promise<void>;
    jobId: string | null;
}

const POLLING_PHASES = new Set(['validating', 'importing']);
const DUPLICATE_PREVIEW_LIMITS: Record<string, number> = {
    Wallets: 6,
    Jars: 6,
    Transactions: 8,
};

const formatCurrency = (amount: number) =>
    amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MigrationStatusScreen: React.FC<MigrationStatusScreenProps> = ({ onBack, onDone, jobId }) => {
    const [job, setJob] = useState<MigrationJobStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const pollingPhase = job?.phase;

    const fetchJob = useEffectEvent(async () => {
        if (!jobId) {
            setLoading(false);
            setError('Migration job is missing. Please upload your files again.');
            return;
        }

        try {
            const response = await apiFetch<MigrationJobStatus>(`/migrations/money-manager/jobs/${jobId}`);
            setJob(response);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load migration status');
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        void fetchJob();
    }, [jobId]);

    useEffect(() => {
        if (!pollingPhase || !POLLING_PHASES.has(pollingPhase)) {
            return;
        }

        const timer = window.setInterval(() => {
            void fetchJob();
        }, 1500);

        return () => window.clearInterval(timer);
    }, [pollingPhase]);

    const handleConfirm = async () => {
        if (!jobId || confirming) {
            return;
        }

        setConfirming(true);
        try {
            const response = await apiFetch<MigrationJobStatus>(`/migrations/money-manager/jobs/${jobId}/confirm`, {
                method: 'POST',
            });
            setJob(response);
            setError(null);
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Failed to confirm migration import';
            setError(message);
        } finally {
            setConfirming(false);
        }
    };

    const renderDuplicateList = (label: string, items: MigrationDuplicateItem[]) => {
        if (!items.length) {
            return null;
        }

        const previewLimit = DUPLICATE_PREVIEW_LIMITS[label] ?? 6;
        const previewItems = items.slice(0, previewLimit);
        const hiddenCount = items.length - previewItems.length;

        return (
            <div className="space-y-3 rounded-2xl border border-red-900/40 bg-red-950/20 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h5 className="text-xs uppercase tracking-wider text-red-300 font-semibold">{label}</h5>
                        <p className="text-sm text-red-100 mt-1">
                            {hiddenCount > 0
                                ? `Showing ${previewItems.length} of ${items.length} duplicates`
                                : `${items.length} duplicate${items.length === 1 ? '' : 's'} found`}
                        </p>
                    </div>
                    <span className="rounded-full border border-red-900/40 bg-red-950/40 px-3 py-1 text-xs font-semibold text-red-200">
                        {items.length}
                    </span>
                </div>
                <div className="space-y-2">
                    {previewItems.map((item, index) => (
                        <div key={`${label}-${item.sourceId ?? item.fingerprint ?? index}`} className="p-3 rounded-xl bg-red-950/40 border border-red-900/40">
                            <p className="text-sm text-white font-medium">{item.displayName || item.sourceId || 'Duplicate item'}</p>
                            <p className="text-xs text-red-200/70 mt-1">
                                Matched by {item.matchedBy === 'fingerprint' ? 'content fingerprint' : 'source id'}
                                {item.sourceId ? ` • ${item.sourceId}` : ''}
                            </p>
                        </div>
                    ))}
                </div>
                {hiddenCount > 0 && (
                    <p className="text-xs text-red-200/70">
                        + {hiddenCount.toLocaleString()} more duplicated {label.toLowerCase()} in this account
                    </p>
                )}
            </div>
        );
    };

    const renderValidationErrors = () => {
        if (!job?.validationErrors?.length) {
            return null;
        }

        return (
            <div className="space-y-3">
                {job.validationErrors.map((validationError, index) => (
                    <div key={`${validationError.code}-${index}`} className="p-4 rounded-xl bg-red-950/40 border border-red-900/50">
                        <p className="text-sm text-white font-medium">{validationError.message}</p>
                        <p className="text-xs text-red-200/70 mt-1">{validationError.code}</p>
                    </div>
                ))}
            </div>
        );
    };

    const renderCounts = () => {
        if (!job?.counts) {
            return null;
        }

        return (
            <>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <Wallet size={16} />
                            <span className="text-xs font-semibold uppercase">Wallets</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{job.counts.wallets}</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <PiggyBank size={16} />
                            <span className="text-xs font-semibold uppercase">Jars</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{job.counts.jars}</p>
                    </div>
                    <div className="col-span-2 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <Receipt size={16} />
                            <span className="text-xs font-semibold uppercase">Transactions</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{job.counts.transactions}</p>
                    </div>
                </div>

                <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">Total Verified</h4>
                    <div className="flex justify-between items-end border-b border-blue-500/10 pb-3">
                        <span className="text-gray-400 text-sm">Income</span>
                        <span className="text-green-400 font-mono font-medium">+ {formatCurrency(job.counts.totalIncome)}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-gray-400 text-sm">Expenses</span>
                        <span className="text-red-400 font-mono font-medium">- {formatCurrency(job.counts.totalExpense)}</span>
                    </div>
                </div>
            </>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    <Loader2 size={64} className="text-blue-500 animate-spin" />
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-white">Loading migration job...</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto">Please wait while we load the latest migration status.</p>
                    </div>
                </div>
            );
        }

        if (error && !job) {
            return (
                <div className="space-y-6 pt-8">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                            <XCircle size={40} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Unable to load migration</h3>
                        <p className="text-red-200/80 text-sm max-w-xs">{error}</p>
                    </div>
                </div>
            );
        }

        switch (job?.phase) {
            case 'validating':
            case 'importing':
                return (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                            <Loader2 size={64} className="text-blue-500 animate-spin relative z-10" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-white">
                                {job.phase === 'validating' ? 'Analyzing data...' : 'Importing data...'}
                            </h3>
                            <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                {job.message || (job.phase === 'validating'
                                    ? 'Cross-checking your Money Manager files.'
                                    : 'Writing your validated data into JarWise.')}
                            </p>
                        </div>
                    </div>
                );

            case 'preview_ready':
                return (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex flex-col items-center text-center space-y-2 mb-8">
                            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                                <CheckCircle size={32} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Validation Successful</h3>
                            <p className="text-gray-400 text-sm">{job.message || 'Your files match and are ready to import.'}</p>
                        </div>
                        {renderCounts()}
                    </motion.div>
                );

            case 'duplicate_blocked':
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 pt-8">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="h-20 w-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 border border-yellow-500/20">
                                <AlertTriangle size={40} className="text-yellow-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Duplicate Data Detected</h3>
                            <p className="text-yellow-100/80 text-sm max-w-xs">
                                {job.message || 'This account already imported some of the selected Money Manager data.'}
                            </p>
                        </div>
                        {renderCounts()}
                        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                            <p className="text-sm text-yellow-100">
                                The totals above describe the uploaded files. The duplicate preview below shows which items were already imported into this account.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {renderDuplicateList('Wallets', job.duplicateSummary?.wallets ?? [])}
                            {renderDuplicateList('Jars', job.duplicateSummary?.jars ?? [])}
                            {renderDuplicateList('Transactions', job.duplicateSummary?.transactions ?? [])}
                        </div>
                    </motion.div>
                );

            case 'failed':
            case 'expired':
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 pt-8">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                                <XCircle size={40} className="text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">
                                {job.phase === 'expired' ? 'Migration Expired' : 'Validation Failed'}
                            </h3>
                            <p className="text-red-200/80 text-sm max-w-xs">{error || job.message || 'We could not continue with this migration.'}</p>
                        </div>
                        {renderValidationErrors()}
                    </motion.div>
                );

            case 'completed':
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/20 blur-[60px] rounded-full"></div>
                            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center shadow-lg relative z-10">
                                <CheckCircle size={48} className="text-white" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-3xl font-bold text-white">All Done!</h3>
                            <p className="text-gray-400 max-w-xs mx-auto">
                                {job.message || 'Your Money Manager history has been migrated to JarWise.'}
                            </p>
                        </div>

                        {renderCounts()}

                        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 w-full">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Database size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-gray-500">Data Updated</p>
                                    <p className="text-sm font-semibold text-white">Import completed successfully</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            default:
                return (
                    <div className="space-y-6 pt-8">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                                <XCircle size={40} className="text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Unknown migration state</h3>
                            <p className="text-red-200/80 text-sm max-w-xs">{job?.message || 'Please try again from the upload screen.'}</p>
                        </div>
                    </div>
                );
        }
    };

    const currentPhase = job?.phase;
    const showBackButton = currentPhase !== 'completed' && currentPhase !== 'importing' && currentPhase !== 'validating';

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
            <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 p-4">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    {showBackButton && (
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <h1 className="text-lg font-semibold text-white">
                        {currentPhase === 'completed' ? 'Import Complete' : 'Migration Status'}
                    </h1>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-lg mx-auto w-full flex flex-col justify-center min-h-[60vh]">
                {renderContent()}
            </main>

            <footer className="p-6 border-t border-gray-800 bg-gray-950/80 backdrop-blur-xl">
                <div className="max-w-lg mx-auto space-y-4">
                    {job?.phase === 'preview_ready' && (
                        <button
                            onClick={() => {
                                void handleConfirm();
                            }}
                            disabled={confirming}
                            className="w-full py-4 rounded-xl font-bold text-base bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                {confirming && <Loader2 size={18} className="animate-spin" />}
                                {confirming ? 'Starting import...' : 'Confirm Import'}
                            </span>
                        </button>
                    )}

                    {(job?.phase === 'failed' || job?.phase === 'expired' || job?.phase === 'duplicate_blocked' || (error && !job)) && (
                        <button
                            onClick={onBack}
                            className="w-full py-4 rounded-xl font-bold text-base bg-gray-800 text-white hover:bg-gray-700 active:scale-[0.98] transition-all"
                        >
                            Back to Upload
                        </button>
                    )}

                    {job?.phase === 'completed' && (
                        <button
                            onClick={async () => {
                                if (finishing) {
                                    return;
                                }

                                setFinishing(true);
                                try {
                                    await onDone();
                                } finally {
                                    setFinishing(false);
                                }
                            }}
                            disabled={finishing}
                            className="w-full py-4 rounded-xl font-bold text-base bg-gray-100 text-gray-900 hover:bg-white active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                {finishing && <Loader2 size={18} className="animate-spin" />}
                                {finishing ? 'Refreshing dashboard...' : 'Go to Dashboard'}
                            </span>
                        </button>
                    )}

                    {error && job && (
                        <p className="text-center text-xs text-red-300/80">{error}</p>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default MigrationStatusScreen;
