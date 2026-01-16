
import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { getCameraConfig } from '../utils/camera';
import { X } from 'lucide-react';

interface ScanPageProps {
    onClose: () => void;
    onScan: (data: string) => void;
}

export default function ScanPage({ onClose, onScan }: ScanPageProps) {
    const [error, setError] = useState('');
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const config = getCameraConfig(isMobile);

        // Initialize scanner
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const startScanner = async () => {
            try {
                await html5QrCode.start(
                    // For PC: 'user', For Mobile: 'environment' (back camera)
                    config.facingMode === 'user' ? { facingMode: "user" } : { facingMode: { exact: "environment" } },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    (decodedText) => {
                        // Success
                        onScan(decodedText);
                        // Stop scanning on success? Or let parent handle?
                        // Usually better to stop to save battery, but wait for navigation.
                    },
                    (errorMessage) => {
                        // parse error, ignore
                    }
                );
            } catch (err) {
                console.error("Camera failed to start", err);
                // Fallback for PC if environment fails? (Though logic says PC uses user)
                setError("Could not access camera. Please allow permissions.");
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition"
            >
                <X size={24} />
            </button>

            <div className="w-full max-w-sm bg-white rounded-xl overflow-hidden shadow-2xl">
                <div id="reader" className="w-full h-full min-h-[300px]"></div>
            </div>

            <p className="text-white mt-8 text-center opacity-80">
                Align QR code / Slip within the frame to scan
            </p>

            {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200">
                    {error}
                </div>
            )}
        </div>
    );
}
