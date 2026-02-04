import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileType, CheckCircle, AlertCircle } from 'lucide-react';

interface MigrationUploadScreenProps {
    onBack: () => void;
    onNavigate: (page: 'migration-status') => void;
}

const MigrationUploadScreen: React.FC<MigrationUploadScreenProps> = ({ onBack, onNavigate }) => {
    const [mmbakFile, setMmbakFile] = useState<File | null>(null);
    const [xlsFile, setXlsFile] = useState<File | null>(null);

    const mmbakInputRef = useRef<HTMLInputElement>(null);
    const xlsInputRef = useRef<HTMLInputElement>(null);

    const handleMmbakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMmbakFile(e.target.files[0]);
        }
    };

    const handleXlsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setXlsFile(e.target.files[0]);
        }
    };

    const isReady = mmbakFile && xlsFile;

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 p-4">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-semibold text-white">Data Migration</h1>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-lg mx-auto w-full space-y-8">
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">Import from Money Manager</h2>
                    <p className="text-gray-400 text-sm">
                        Upload your backup files to migrate your transaction history to JarWise.
                    </p>
                </div>

                {/* Upload Sections */}
                <div className="space-y-6">
                    {/* Mmbak File */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">Database Backup (.mmbak)</label>
                            {mmbakFile && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Ready</span>}
                        </div>

                        <div
                            onClick={() => mmbakInputRef.current?.click()}
                            className={`group cursor-pointer relative border-2 border-dashed rounded-2xl p-6 transition-all ${mmbakFile ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-800 hover:border-gray-700 hover:bg-gray-900/50'
                                }`}
                        >
                            <input
                                type="file"
                                ref={mmbakInputRef}
                                onChange={handleMmbakChange}
                                accept=".mmbak"
                                className="hidden"
                            />

                            <div className="flex flex-col items-center text-center gap-3">
                                <div className={`p-3 rounded-full ${mmbakFile ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-gray-300'}`}>
                                    <FileType size={24} />
                                </div>
                                <div>
                                    {mmbakFile ? (
                                        <>
                                            <p className="font-medium text-blue-100 break-all">{mmbakFile.name}</p>
                                            <p className="text-xs text-blue-300/60 mt-1">{(mmbakFile.size / 1024).toFixed(1)} KB</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-medium text-gray-300">Select .mmbak file</p>
                                            <p className="text-xs text-gray-500 mt-1">Found in Backup Settings</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* XLS File */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">Excel Report (.xls)</label>
                            {xlsFile && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Ready</span>}
                        </div>

                        <div
                            onClick={() => xlsInputRef.current?.click()}
                            className={`group cursor-pointer relative border-2 border-dashed rounded-2xl p-6 transition-all ${xlsFile ? 'border-green-500/50 bg-green-500/5' : 'border-gray-800 hover:border-gray-700 hover:bg-gray-900/50'
                                }`}
                        >
                            <input
                                type="file"
                                ref={xlsInputRef}
                                onChange={handleXlsChange}
                                accept=".xls,.xlsx"
                                className="hidden"
                            />

                            <div className="flex flex-col items-center text-center gap-3">
                                <div className={`p-3 rounded-full ${xlsFile ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-gray-300'}`}>
                                    <Upload size={24} />
                                </div>
                                <div>
                                    {xlsFile ? (
                                        <>
                                            <p className="font-medium text-green-100 break-all">{xlsFile.name}</p>
                                            <p className="text-xs text-green-300/60 mt-1">{(xlsFile.size / 1024).toFixed(1)} KB</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-medium text-gray-300">Select .xls file</p>
                                            <p className="text-xs text-gray-500 mt-1">Exported report for validation</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Alert */}
                <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-800/50 flex gap-3 items-start">
                    <AlertCircle size={18} className="text-blue-400 mt-0.5 shrink-0" />
                    <div className="text-sm text-blue-200/80">
                        <p>We need both files to safely migrate your data.</p>
                        <ul className="list-disc pl-4 mt-2 space-y-1 text-xs opacity-80">
                            <li><strong>.mmbak</strong> contains your full history.</li>
                            <li><strong>.xls</strong> is used to verify the totals match.</li>
                        </ul>
                    </div>
                </div>

            </main>

            {/* Footer / Action */}
            <footer className="p-6 border-t border-gray-800 bg-gray-950/80 backdrop-blur-xl">
                <div className="max-w-lg mx-auto">
                    <button
                        disabled={!isReady}
                        onClick={() => onNavigate('migration-status')}
                        className={`w-full py-4 rounded-xl font-bold text-base transition-all ${isReady
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 active:scale-[0.98]'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Upload and Continue
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default MigrationUploadScreen;
