// components/auth/SignUpForm.tsx
'use client';

import React, { useState } from 'react';
import { signUpWithEmail } from '@/lib/firebase/auth';
import { createUser } from '@/lib/firebase/firestore';
import { UserRole } from '@/lib/types/originals';

interface SignUpFormProps {
    onSuccess?: () => void;
    onSwitchToSignIn?: () => void;
}

export default function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState<UserRole>('regular');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('🔵 Starting signup process...');
            console.log('📧 Email:', email);
            console.log('👤 Display Name:', displayName);
            console.log('🎭 Role:', role);

            // Create Firebase auth user
            console.log('🔐 Creating Firebase Auth user...');
            const userCredential = await signUpWithEmail(email, password);
            console.log('✅ Auth user created:', userCredential.user.uid);

            // Create Firestore user document
            console.log('📝 Creating Firestore user document...');
            await createUser(userCredential.user.uid, {
                displayName,
                email,
                role,
            });
            console.log('✅ Firestore user document created!');

            onSuccess?.();
        } catch (err: any) {
            console.error('❌ Sign up error:', err);
            console.error('Error code:', err.code);
            console.error('Error message:', err.message);
            setError(err.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                </label>
                <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your Name"
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                    Account Type
                </label>
                <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="regular">Regular User (Watch & Rate)</option>
                    <option value="creator">Creator (Submit Scripts)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    {role === 'creator'
                        ? 'You can submit original scripts for review'
                        : 'You can watch and rate Atto4 Originals'}
                </p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
                {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="text-center text-sm text-gray-400">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToSignIn}
                    className="text-blue-500 hover:text-blue-400 underline"
                >
                    Sign In
                </button>
            </div>
        </form>
    );
}
