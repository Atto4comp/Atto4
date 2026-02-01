// app/originals/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { getReleasedProjects } from '@/lib/firebase/firestore';
import { OriginalProjectDoc } from '@/lib/types/originals';
import Link from 'next/link';
import { Sparkles, Star } from 'lucide-react';

export default function OriginalsPage() {
    const [projects, setProjects] = useState<OriginalProjectDoc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await getReleasedProjects();
            setProjects(data);
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
                        <Sparkles className="text-purple-400" size={20} />
                        <span className="text-purple-400 font-medium text-sm">Atto4 Originals</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Original Content.<br />Created by Creators.
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                        Discover exclusive short films and series created from scripts submitted by talented writers like you.
                        Each piece is produced, directed, and brought to life by the Atto4 team.
                    </p>
                    <Link
                        href="/submit-script"
                        className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                    >
                        Submit Your Script
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                        <Sparkles className="mx-auto mb-4 text-gray-600" size={48} />
                        <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
                        <p className="text-gray-400">The first Atto4 Originals are currently in production. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/originals/${project.id}`}
                                className="group"
                            >
                                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
                                    {/* Poster */}
                                    <div className="relative aspect-[2/3] bg-gray-800">
                                        {project.posterUrl ? (
                                            <img
                                                src={project.posterUrl}
                                                alt={project.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Sparkles className="text-gray-700" size={48} />
                                            </div>
                                        )}
                                        {project.featured && (
                                            <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full flex items-center gap-1">
                                                <Star size={12} fill="currentColor" />
                                                Featured
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                                            {project.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">{project.logline}</p>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded">
                                                {project.genre}
                                            </span>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <Star size={14} fill="currentColor" />
                                                <span className="font-medium">{project.scores.overall.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
