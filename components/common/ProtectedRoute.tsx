// components/common/ProtectedRoute.tsx
'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/lib/types/originals';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAuth?: boolean;
    requireRole?: UserRole;
    fallback?: ReactNode;
}

export default function ProtectedRoute({
    children,
    requireAuth = true,
    requireRole,
    fallback,
}: ProtectedRouteProps) {
    const { user, userDoc, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (requireAuth && !user) {
        return (
            fallback || (
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
                        <p className="text-gray-400 mb-6">Please sign in to access this page.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            )
        );
    }

    if (requireRole && userDoc?.role !== requireRole) {
        return (
            fallback || (
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
                        <p className="text-gray-400 mb-6">
                            You don&apos;t have permission to access this page.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            )
        );
    }

    return <>{children}</>;
}
