import React, { useState } from 'react';
import { ArrowLeft, List, X, Check, Calendar, Wallet, Image as ImageIcon, FolderHeart, Smartphone } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { saveTransaction } from '../utils/transactionStorage';

interface ImportSlipProps {
    onBack: () => void;
}

const MOCK_IMAGES = Array(12).fill(null).map((_, i) => ({
    id: i,
    color: ['bg-blue-900', 'bg-green-900', 'bg-purple-900', 'bg-red-900'][i % 4],
    timestamp: new Date(Date.now() - i * 3600000),
}));

const ImportSlip: React.FC<ImportSlipProps> = ({ onBack }) => {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [showAlbums, setShowAlbums] = useState(false);
    const { formatAmount } = useCurrency();

    // Mock data for the review dialog
    const mockParsedData = {
        amount: 500.00,
        bank: 'KBank',
        date: new Date(),
        jar: 'Necessities'
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-lg font-semibold text-white">Import Slips</h1>
                    <span className="text-xs text-gray-400">Recent Images</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {/* Placeholder for scanning indicator if needed */}
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-2">
                <div className="grid grid-cols-3 gap-1">
                    {MOCK_IMAGES.map((img) => (
                        <button
                            key={img.id}
                            onClick={() => setSelectedImage(img.id)}
                            className={`aspect-square w-full ${img.color} rounded-lg relative overflow-hidden active:scale-95 transition-transform hover:opacity-80`}
                        >
                            {/* Mock Image Content */}
                            <div className="absolute inset-0 flex items-center justify-center text-white/20">
                                <span className="text-xs">IMG_{img.id}</span>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="p-8 text-center text-gray-500 text-sm">
                    No more recent images
                </div>
            </div>

            {/* Floating Action Button (FAB) relative to screen */}
            <div className="absolute bottom-6 right-6 z-40">
                <button
                    onClick={() => setShowAlbums(true)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-3 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                    <List size={20} />
                    <span className="font-medium">Albums</span>
                </button>
            </div>

            {/* Review Dialog Overlay */}
            {selectedImage !== null && (
                <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 rounded-2xl w-full max-w-sm flex flex-col shadow-2xl border border-gray-800 overflow-hidden">
                        {/* Dialog Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <button onClick={() => setSelectedImage(null)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                            <span className="font-semibold text-white">Review Slip</span>
                            <button
                                onClick={() => {
                                    // Create transaction object
                                    const newTransaction: any = {
                                        id: `tx-${Date.now()}`,
                                        amount: mockParsedData.amount,
                                        jarId: mockParsedData.jar.toLowerCase(), // simple mock mapping
                                        date: mockParsedData.date.toISOString(),
                                        type: 'expense',
                                        note: mockParsedData.bank,
                                        status: 'completed'
                                    };

                                    saveTransaction(newTransaction);
                                    alert(`Approved and Saved: ${mockParsedData.bank} - ${formatAmount(mockParsedData.amount)}`);
                                    setSelectedImage(null);
                                }}
                                className="text-primary-400 hover:text-primary-300"
                            >
                                <Check size={24} />
                            </button>
                        </div>

                        {/* Dialog Content */}
                        <div className="p-0 overflow-y-auto max-h-[70vh]">
                            {/* Mock Image Preview */}
                            <div className={`w-full h-64 ${MOCK_IMAGES[selectedImage].color} flex items-center justify-center`}>
                                <span className="text-white/30 text-xl">Slip Preview</span>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Amount Field */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Amount</label>
                                    <div className="bg-gray-800 rounded-lg p-3 text-white font-mono text-lg border border-gray-700">
                                        {mockParsedData.amount.toFixed(2)}
                                    </div>
                                </div>

                                {/* Bank Field */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Bank</label>
                                    <div className="bg-gray-800 rounded-lg p-3 text-white flex items-center gap-2 border border-gray-700">
                                        <div className="w-6 h-6 rounded bg-green-500/20 text-green-500 flex items-center justify-center text-xs">K</div>
                                        {mockParsedData.bank}
                                    </div>
                                </div>

                                {/* Date Field */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Date</label>
                                    <div className="bg-gray-800 rounded-lg p-3 text-white flex items-center gap-2 border border-gray-700">
                                        <Calendar size={16} className="text-gray-400" />
                                        {mockParsedData.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>

                                {/* Confidence Score */}
                                <div className="text-xs text-green-400 flex items-center gap-1">
                                    <span>Confidence: 95%</span>
                                </div>

                                {/* Jar Selection */}
                                <div className="space-y-1 pt-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Jar / Account</label>
                                    <div className="bg-gray-800 rounded-lg p-3 text-white flex items-center justify-between border border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Wallet size={18} className="text-purple-400" />
                                            <span>{mockParsedData.jar}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">▼</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        const draftTransaction: any = {
                                            id: `draft-${selectedImage}`,
                                            amount: mockParsedData.amount,
                                            jarId: mockParsedData.jar.toLowerCase(),
                                            date: mockParsedData.date.toISOString(),
                                            type: 'expense',
                                            note: mockParsedData.bank,
                                            status: 'draft'
                                        };

                                        saveTransaction(draftTransaction);
                                        alert("Draft Saved to Dashboard!");
                                        setSelectedImage(null);
                                    }}
                                    className="w-full py-3 mt-4 rounded-xl font-medium text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
                                >
                                    Save as Draft
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Albums Dialog */}
            {showAlbums && (
                <div className="fixed inset-0 z-[70] bg-black/80 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl border-t sm:border border-gray-800 overflow-hidden max-h-[80vh]">
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <h2 className="text-lg font-semibold text-white">Select Album</h2>
                            <button onClick={() => setShowAlbums(false)} className="text-gray-400 hover:text-white bg-gray-800 p-1 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-2 space-y-1">
                            {[
                                { name: 'Recents', count: 1245, icon: ImageIcon, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                                { name: 'Favorites', count: 42, icon: FolderHeart, color: 'text-red-400', bg: 'bg-red-500/10' },
                                { name: 'Banking', count: 156, icon: Wallet, color: 'text-green-400', bg: 'bg-green-500/10' },
                                { name: 'Screenshots', count: 89, icon: Smartphone, color: 'text-gray-400', bg: 'bg-gray-500/10' },
                                { name: 'Downloads', count: 23, icon: ArrowLeft, color: 'text-purple-400', bg: 'bg-purple-500/10' }, // Reusing ArrowLeft as generic download icon mock
                            ].map((album) => (
                                <button
                                    key={album.name}
                                    onClick={() => setShowAlbums(false)}
                                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-800 rounded-xl transition-colors group"
                                >
                                    <div className={`w-12 h-12 rounded-lg ${album.bg} ${album.color} flex items-center justify-center`}>
                                        <album.icon size={24} />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-white font-medium group-hover:text-primary-400 transition-colors">{album.name}</span>
                                        <span className="text-xs text-gray-500">{album.count.toLocaleString()} items</span>
                                    </div>
                                    <div className="ml-auto text-gray-600">
                                        <span className="text-xs">Select</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportSlip;
