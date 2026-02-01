// app/admin/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuth } from '@/lib/hooks/useAuth';
import { getScriptsByStatus, getAllProjects } from '@/lib/firebase/firestore';
import Link from 'next/link';
import { FileText, Film, Shield, BarChart } from 'lucide-react';

export default function AdminDashboardPage() {
    const { isAdmin } = useAuth();
    const [stats, setStats] = useState({
        pendingScripts: 0,
        totalProjects: 0,
    });

    useEffect(() => {
        if (isAdmin) {
            loadStats();
        }
    }, [isAdmin]);

    const loadStats = async () => {
        try {
            const pending = await getScriptsByStatus('pending');
            const projects = await getAllProjects();
            setStats({
                pendingScripts: pending.length,
                totalProjects: projects.length,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    return (
        <ProtectedRoute requireAuth requireRole="admin">
            <div className="min-h-screen bg-black py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="text-purple-500" size={32} />
                            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
                        </div>
                        <p className="text-gray-400">Manage scripts, projects, and Atto4 Originals</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <FileText className="text-yellow-500" size={32} />
                                <span className="text-3xl font-bold text-white">{stats.pendingScripts}</span>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1">Pending Scripts</h3>
                            <p className="text-sm text-gray-400">Awaiting review</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Film className="text-purple-500" size={32} />
                                <span className="text-3xl font-bold text-white">{stats.totalProjects}</span>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1">Total Projects</h3>
                            <p className="text-sm text-gray-400">All stages</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link
                            href="/admin/scripts"
                            className="group bg-gray-900 border border-gray-800 hover:border-yellow-500/50 rounded-xl p-8 transition-all"
                        >
                            <FileText className="text-yellow-500 mb-4 group-hover:scale-110 transition-transform" size={40} />
                            <h3 className="text-xl font-bold text-white mb-2">Review Scripts</h3>
                            <p className="text-gray-400">Review pending script submissions and approve for production</p>
                            {stats.pendingScripts > 0 && (
                                <div className="mt-4 inline-block px-3 py-1 bg-yellow-500/20 text-yellow-500 text-sm font-medium rounded-full">
                                    {stats.pendingScripts} pending
                                </div>
                            )}
                        </Link>

                        <Link
                            href="/admin/projects"
                            className="group bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-xl p-8 transition-all"
                        >
                            <Film className="text-purple-500 mb-4 group-hover:scale-110 transition-transform" size={40} />
                            <h3 className="text-xl font-bold text-white mb-2">Manage Projects</h3>
                            <p className="text-gray-400">Create and manage Atto4 Originals projects</p>
                        </Link>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
