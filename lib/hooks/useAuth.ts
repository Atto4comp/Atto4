// lib/hooks/useAuth.ts
'use client';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to access authentication context
 * @returns Authentication context with user, userDoc, loading, isAdmin, isCreator
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
