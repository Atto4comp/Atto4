// lib/hooks/useUserRole.ts
'use client';

import { useAuth } from './useAuth';
import { UserRole } from '../types/originals';

/**
 * Custom hook to check user roles and permissions
 */
export function useUserRole() {
    const { userDoc, isAdmin, isCreator } = useAuth();

    const hasRole = (role: UserRole): boolean => {
        return userDoc?.role === role;
    };

    const canSubmitScripts = (): boolean => {
        return isCreator;
    };

    const canManageProjects = (): boolean => {
        return isAdmin;
    };

    const canReviewScripts = (): boolean => {
        return isAdmin;
    };

    return {
        role: userDoc?.role,
        isAdmin,
        isCreator,
        hasRole,
        canSubmitScripts,
        canManageProjects,
        canReviewScripts,
    };
}
