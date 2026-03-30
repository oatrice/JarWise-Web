import React, { useEffect, useEffectEvent, useRef, useState } from 'react';
import { AlertCircle, Loader2, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

const LoginScreen: React.FC = () => {
    const auth = useAuth();
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const initializedClientIdRef = useRef<string | null>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const handleGoogleCredential = useEffectEvent(async (response: GoogleCredentialResponse) => {
        if (!response.credential) {
            return;
        }

        try {
            await auth.signInWithGoogle(response.credential);
        } catch {
            // Error state is surfaced via auth.error.
        }
    });

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            return;
        }

        const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-identity="true"]');
        if (existingScript) {
            if (window.google) {
                setScriptLoaded(true);
            } else {
                existingScript.addEventListener('load', () => setScriptLoaded(true), { once: true });
            }
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.googleIdentity = 'true';
        script.onload = () => setScriptLoaded(true);
        document.head.appendChild(script);

        return () => {
            script.onload = null;
        };
    }, []);

    useEffect(() => {
        if (!scriptLoaded || !googleButtonRef.current || !window.google || !GOOGLE_CLIENT_ID) {
            return;
        }

        if (initializedClientIdRef.current !== GOOGLE_CLIENT_ID) {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (response: GoogleCredentialResponse) => {
                    void handleGoogleCredential(response);
                },
            });
            initializedClientIdRef.current = GOOGLE_CLIENT_ID;
        }

        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            shape: 'pill',
            text: 'signin_with',
            width: 320,
        });

        return () => {
            if (googleButtonRef.current) {
                googleButtonRef.current.innerHTML = '';
            }
        };
    }, [scriptLoaded]);

    useEffect(() => {
        return () => {
            window.google?.accounts.id.cancel();
            initializedClientIdRef.current = null;
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                {/* Logo */}
                <div className="mb-8">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/20">
                        <Wallet size={48} className="text-white" />
                    </div>
                </div>

                {/* App Name */}
                <h1 className="text-4xl font-bold text-white mb-2">
                    JarWise
                </h1>
                <p className="text-gray-400 text-center mb-12">
                    Smart money management with jars
                </p>

                <div className="w-full max-w-sm space-y-4">
                    {!GOOGLE_CLIENT_ID && (
                        <div className="p-4 rounded-2xl border border-red-900/60 bg-red-950/40 text-red-100 text-sm flex items-start gap-3">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold">Google Sign-In is not configured</p>
                                <p className="text-red-200/80 text-xs mt-1">Set `VITE_GOOGLE_CLIENT_ID` to enable real sign-in.</p>
                            </div>
                        </div>
                    )}

                    {GOOGLE_CLIENT_ID && !scriptLoaded && (
                        <div className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-200">
                            <Loader2 size={18} className="animate-spin text-blue-400" />
                            <span className="text-sm">Loading Google Sign-In...</span>
                        </div>
                    )}

                    {GOOGLE_CLIENT_ID && <div ref={googleButtonRef} className="flex justify-center" />}

                    {auth.error && (
                        <div className="p-4 rounded-2xl border border-red-900/60 bg-red-950/40 text-red-100 text-sm">
                            {auth.error}
                        </div>
                    )}
                </div>

                {/* Privacy note */}
                <p className="mt-8 text-xs text-gray-600 text-center max-w-xs">
                    By signing in, you agree to our{' '}
                    <a href="/terms" className="text-blue-400 hover:text-blue-500 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-blue-400 hover:text-blue-500 hover:underline">Privacy Policy</a>
                </p>
            </div>

            {/* Footer */}
            <div className="p-6 text-center">
                <p className="text-xs text-gray-600">
                    Your data will be backed up to Google Drive
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;
