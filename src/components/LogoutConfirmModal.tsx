import React from 'react';
import { LogOut, Trash2, X } from 'lucide-react';

interface LogoutConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogoutKeepData: () => void;
    onLogoutDeleteData: () => void;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
    isOpen,
    onClose,
    onLogoutKeepData,
    onLogoutDeleteData,
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
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                        <LogOut size={32} className="text-red-400" />
                    </div>

                    <h2 className="text-xl font-semibold text-white mb-2">
                        Log Out
                    </h2>

                    <p className="text-gray-400 text-sm mb-6">
                        Would you also like to delete all local data from this device?
                    </p>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={onLogoutDeleteData}
                            className="w-full py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} />
                            Log out & Delete Data
                        </button>
                        <button
                            onClick={onLogoutKeepData}
                            className="w-full py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium transition-colors"
                        >
                            Log out & Keep Data
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2 px-4 text-gray-500 hover:text-gray-400 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmModal;
