// app/my-submissions/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuth } from '@/lib/hooks/useAuth';
import { getScriptsByWriter } from '@/lib/firebase/firestore';
import { OriginalScriptDoc } from '@/lib/types/originals';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, XCircle, Film } from 'lucide-react';

const STATUS_CONFIG = {
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending Review' },
    approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Approved' },
    rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Rejected' },
    in_production: { icon: Film, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'In Production' },
    released: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Released' },
};

export default function MySubmissionsPage() {
    const { user } = useAuth();
    const [scripts, setScripts] = useState<OriginalScriptDoc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadScripts();
        }
    }, [user]);

    const loadScripts = async () => {
        try {
            if (!user) return;
            const data = await getScriptsByWriter(user.uid);
            setScripts(data);
        } catch (error) {
            console.error('Error loading scripts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requireAuth>
            <div className="min-h-screen bg-black py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">My Submissions</h1>
                            <p className="text-gray-400">Track the status of your submitted scripts</p>
                        </div>
                        <Link
                            href="/submit-script"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Submit New Script
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : scripts.length === 0 ? (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                            <FileText className="mx-auto mb-4 text-gray-600" size={48} />
                            <h3 className="text-xl font-bold text-white mb-2">No Submissions Yet</h3>
                            <p className="text-gray-400 mb-6">You haven&apos;t submitted any scripts yet.</p>
                            <Link
                                href="/submit-script"
                                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Submit Your First Script
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {scripts.map((script) => {
                                const statusConfig = STATUS_CONFIG[script.status];
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div
                                        key={script.id}
                                        className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-2">{script.title}</h3>
                                                <p className="text-gray-400 text-sm mb-3">{script.logline}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                                                        {script.genre}
                                                    </span>
                                                    {script.pagesEstimate && (
                                                        <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                                                            {script.pagesEstimate} pages
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusConfig.bg}`}>
                                                <StatusIcon size={16} className={statusConfig.color} />
                                                <span className={`text-sm font-medium ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                        </div>

                                        {script.adminNotes && (
                                            <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                                                <p className="text-sm font-medium text-gray-300 mb-1">Admin Notes:</p>
                                                <p className="text-sm text-gray-400">{script.adminNotes}</p>
                                            </div>
                                        )}

                                        <div className="mt-4 text-xs text-gray-500">
                                            Submitted: {new Date(script.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
