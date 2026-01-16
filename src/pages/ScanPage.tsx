import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { ChevronLeft, RefreshCcw } from 'lucide-react';
import { getCameraConfig } from '../utils/camera';

interface ScanPageProps {
    onClose: () => void;
    onScan: (data: string) => void;
}

export default function ScanPage({ onClose, onScan }: ScanPageProps) {
    const webcamRef = useRef<Webcam>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

    useEffect(() => {
        const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setIsMobile(checkMobile);
        // Default to environment for mobile, user for PC
        setFacingMode(checkMobile ? 'environment' : 'user');
    }, []);

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            onScan(imageSrc);
        }
    }, [webcamRef, onScan]);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: facingMode
    };

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
                <button
                    onClick={onClose}
                    className="flex items-center justify-center h-12 w-12 text-white bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={28} />
                </button>
                <div className="flex flex-col items-end">
                    <h2 className="text-lg font-semibold text-white drop-shadow-md">Scan Slip</h2>
                    <p className="text-xs text-white/70">Take a photo of the slip</p>
                </div>
            </div>

            {/* Camera Area */}
            <div className="flex-1 w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Focus Frame Overlay (Aesthetics) */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-[80%] aspect-[3/4] max-w-sm border-2 border-white/30 rounded-3xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl -mt-[2px] -ml-[2px]" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl -mt-[2px] -mr-[2px]" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl -mb-[2px] -ml-[2px]" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl -mb-[2px] -mr-[2px]" />
                    </div>
                </div>
            </div>

            {/* Footer / Controls */}
            <div className="absolute bottom-0 w-full p-8 pb-12 z-20 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-12">
                {/* Toggle Camera (Visible only if mobile or relevant) */}
                <button
                    onClick={toggleCamera}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all active:scale-95"
                >
                    <RefreshCcw size={24} />
                </button>

                {/* Shutter Button */}
                <button
                    onClick={capture}
                    className="h-20 w-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95 group shadow-lg shadow-black/50"
                >
                    <div className="h-16 w-16 rounded-full bg-white group-active:scale-90 transition-transform" />
                </button>

                {/* Placeholder for balance */}
                <div className="w-12 h-12" />
            </div>
        </div>
    );
}
