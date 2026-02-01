// app/admin/projects/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { getAllProjects, createProject, updateProject, getScript } from '@/lib/firebase/firestore';
import { OriginalProjectDoc, OriginalScriptDoc, ProjectStatus } from '@/lib/types/originals';
import { Film, Plus, Edit } from 'lucide-react';

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<OriginalProjectDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await getAllProjects();
            setProjects(data);
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requireAuth requireRole="admin">
            <div className="min-h-screen bg-black py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Manage Projects</h1>
                            <p className="text-gray-400">Create and manage Atto4 Originals projects</p>
                        </div>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                            {showCreateForm ? 'Cancel' : 'Create Project'}
                        </button>
                    </div>

                    {showCreateForm && (
                        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Create New Project</h3>
                            <p className="text-gray-400 mb-4">
                                To create a new project, you need to approve a script first.
                                Go to <a href="/admin/scripts" className="text-purple-400 hover:underline">Review Scripts</a> to approve a submission.
                            </p>
                            <p className="text-sm text-gray-500">
                                Once approved, you can manually create the project entry in Firebase Console or use this interface (feature coming soon).
                            </p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                            <Film className="mx-auto mb-4 text-gray-600" size={48} />
                            <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
                            <p className="text-gray-400">Approve scripts to create your first project.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                                            <p className="text-gray-400 mb-3">{project.logline}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full">
                                                    {project.genre}
                                                </span>
                                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                                                    {project.status}
                                                </span>
                                                {project.featured && (
                                                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800/50 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Writing</p>
                                            <p className="text-lg font-bold text-white">{project.scores.writing.toFixed(1)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Display</p>
                                            <p className="text-lg font-bold text-white">{project.scores.display.toFixed(1)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Cinematography</p>
                                            <p className="text-lg font-bold text-white">{project.scores.cinematography.toFixed(1)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-3">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                                            <Edit size={16} />
                                            Edit (Coming Soon)
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
