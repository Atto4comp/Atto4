// app/admin/scripts/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { getScriptsByStatus, updateScript } from '@/lib/firebase/firestore';
import { OriginalScriptDoc } from '@/lib/types/originals';
import { Check, X, FileText } from 'lucide-react';

export default function AdminScriptsPage() {
    const [scripts, setScripts] = useState<OriginalScriptDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadScripts();
    }, []);

    const loadScripts = async () => {
        try {
            const data = await getScriptsByStatus('pending');
            setScripts(data);
        } catch (error) {
            console.error('Error loading scripts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (scriptId: string) => {
        setProcessingId(scriptId);
        try {
            await updateScript(scriptId, { status: 'approved' });
            setScripts(scripts.filter(s => s.id !== scriptId));
        } catch (error) {
            console.error('Error approving script:', error);
            alert('Failed to approve script');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (scriptId: string, reason: string) => {
        setProcessingId(scriptId);
        try {
            await updateScript(scriptId, {
                status: 'rejected',
                adminNotes: reason
            });
            setScripts(scripts.filter(s => s.id !== scriptId));
        } catch (error) {
            console.error('Error rejecting script:', error);
            alert('Failed to reject script');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <ProtectedRoute requireAuth requireRole="admin">
            <div className="min-h-screen bg-black py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Review Scripts</h1>
                        <p className="text-gray-400">Review pending script submissions</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                        </div>
                    ) : scripts.length === 0 ? (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                            <FileText className="mx-auto mb-4 text-gray-600" size={48} />
                            <h3 className="text-xl font-bold text-white mb-2">No Pending Scripts</h3>
                            <p className="text-gray-400">All caught up! No scripts awaiting review.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {scripts.map((script) => (
                                <div
                                    key={script.id}
                                    className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                                >
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-bold text-white mb-2">{script.title}</h3>
                                        <p className="text-gray-400 mb-3">{script.logline}</p>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full">
                                                {script.genre}
                                            </span>
                                            {script.pagesEstimate && (
                                                <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full">
                                                    {script.pagesEstimate} pages
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Writer: <span className="text-gray-400">{script.writerName}</span>
                                        </p>
                                    </div>

                                    {script.notesForProducer && (
                                        <div className="mb-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                                            <p className="text-sm font-medium text-gray-300 mb-1">Writer&apos;s Notes:</p>
                                            <p className="text-sm text-gray-400">{script.notesForProducer}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(script.id)}
                                            disabled={processingId === script.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                                        >
                                            <Check size={18} />
                                            {processingId === script.id ? 'Processing...' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                const reason = prompt('Reason for rejection (will be shown to writer):');
                                                if (reason) handleReject(script.id, reason);
                                            }}
                                            disabled={processingId === script.id}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
