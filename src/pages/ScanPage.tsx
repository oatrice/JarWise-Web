import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { getCameraConfig } from '../utils/camera';
import { ChevronLeft } from 'lucide-react';

interface ScanPageProps {
    onClose: () => void;
    onScan: (data: string) => void;
}

export default function ScanPage({ onClose, onScan }: ScanPageProps) {
    const [error, setError] = useState('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const config = getCameraConfig(isMobile);

        // Initial Cleanup for React Strict Mode
        const readerElement = document.getElementById('reader');
        if (readerElement) readerElement.innerHTML = '';

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const startScanner = async () => {
            try {
                await html5QrCode.start(
                    config.facingMode === 'user' ? { facingMode: "user" } : { facingMode: { exact: "environment" } },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: window.innerWidth / window.innerHeight // Fullscreen aspect ratio
                    },
                    (decodedText) => {
                        if (isMounted.current) onScan(decodedText);
                    },
                    (errorMessage) => {
                        // ignore
                    }
                );
            } catch (err) {
                console.error("Camera failed to start", err);
                if (isMounted.current) setError("Could not access camera. Please check permissions.");
            }
        };

        startScanner();

        return () => {
            isMounted.current = false;
            if (html5QrCode.isScanning) {
                html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
            } else {
                // clear() might be void in some versions
                try { html5QrCode.clear(); } catch (e) { }
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
            {/* Header / Back Button */}
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex items-center bg-gradient-to-b from-black/60 to-transparent">
                <button
                    onClick={onClose}
                    className="flex items-center justify-center h-12 w-12 text-white bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={28} />
                </button>
                <div className="ml-4 flex flex-col">
                    <h2 className="text-lg font-semibold text-white drop-shadow-md">Scan QR Code</h2>
                    <p className="text-xs text-white/70">Align code within frame</p>
                </div>
            </div>

            {/* Scanner Container */}
            <div className="flex-1 w-full h-full relative bg-black">
                {/* Reader Area */}
                <div id="reader" className="w-full h-full absolute inset-0 [&>video]:object-cover [&>video]:w-full [&>video]:h-full"></div>

                {/* Custom Overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-72 h-72 rounded-3xl relative">
                        {/* Corners */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>

                        {/* Scanning Line Animation */}
                        <div className="absolute inset-x-4 top-0 h-[2px] bg-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite_alternate]" />
                    </div>
                </div>
            </div>

            {error && (
                <div className="absolute bottom-12 left-6 right-6 p-4 bg-red-500/90 text-white text-center rounded-2xl backdrop-blur-md z-20 border border-red-400/30 font-medium">
                    {error}
                </div>
            )}

            {/* Global Style for the Scan Animation */}
            <style>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
            `}</style>
        </div>
    );
}
