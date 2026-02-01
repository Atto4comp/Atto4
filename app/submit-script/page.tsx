// app/submit-script/page.tsx
'use client';

import React from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import ScriptSubmissionForm from '@/components/scripts/ScriptSubmissionForm';
import { useUserRole } from '@/lib/hooks/useUserRole';

export default function SubmitScriptPage() {
    const { canSubmitScripts } = useUserRole();

    return (
        <ProtectedRoute requireAuth>
            <div className="min-h-screen bg-black py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">Submit Your Script</h1>
                        <p className="text-gray-400">
                            {canSubmitScripts
                                ? 'Upload your original screenplay for review. If approved, we\'ll produce it as an Atto4 Original!'
                                : 'You need a creator account to submit scripts. Please sign out and create a new account with "Creator" role.'}
                        </p>
                    </div>

                    {canSubmitScripts ? (
                        <ScriptSubmissionForm />
                    ) : (
                        <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg">
                            <p className="font-medium">Access Denied</p>
                            <p className="text-sm mt-2">This page is only available to users with Creator accounts.</p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
