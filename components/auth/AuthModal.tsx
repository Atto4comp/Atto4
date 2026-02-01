// components/auth/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
    const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);

    if (!isOpen) return null;

    const handleSuccess = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Content */}
                <div className="p-8">
                    {mode === 'signin' ? (
                        <SignInForm
                            onSuccess={handleSuccess}
                            onSwitchToSignUp={() => setMode('signup')}
                        />
                    ) : (
                        <SignUpForm
                            onSuccess={handleSuccess}
                            onSwitchToSignIn={() => setMode('signin')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
