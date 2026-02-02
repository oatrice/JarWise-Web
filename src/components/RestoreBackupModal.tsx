import React from 'react';
import { CloudDownload, X } from 'lucide-react';

interface RestoreBackupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRestore: () => void;
    onStartFresh: () => void;
    backupDate?: string;
}

const RestoreBackupModal: React.FC<RestoreBackupModalProps> = ({
    isOpen,
    onClose,
    onRestore,
    onStartFresh,
    backupDate = 'Today at 10:15 AM',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="p-6 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                        <CloudDownload size={32} className="text-blue-400" />
                    </div>

                    <h2 className="text-xl font-semibold text-white mb-2">
                        Backup Found
                    </h2>

                    <p className="text-gray-400 text-sm mb-1">
                        We found a backup from
                    </p>
                    <p className="text-white font-medium mb-6">
                        {backupDate}
                    </p>

                    <p className="text-gray-400 text-sm mb-6">
                        Would you like to restore your data?
                    </p>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={onRestore}
                            className="w-full py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                        >
                            Restore Data
                        </button>
                        <button
                            onClick={onStartFresh}
                            className="w-full py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium transition-colors"
                        >
                            Start Fresh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestoreBackupModal;
