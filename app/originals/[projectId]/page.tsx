// app/originals/[projectId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProject, getUserRatingForProject, createOrUpdateRating } from '@/lib/firebase/firestore';
import { OriginalProjectDoc } from '@/lib/types/originals';
import { useAuth } from '@/lib/hooks/useAuth';
import { Star, Film, User, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.projectId as string;
    const { user } = useAuth();

    const [project, setProject] = useState<OriginalProjectDoc | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState({ writing: 0, display: 0, cinematography: 0 });
    const [hasRated, setHasRated] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadProject();
    }, [projectId]);

    useEffect(() => {
        if (user && projectId) {
            loadUserRating();
        }
    }, [user, projectId]);

    const loadProject = async () => {
        try {
            const data = await getProject(projectId);
            setProject(data);
        } catch (error) {
            console.error('Error loading project:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserRating = async () => {
        if (!user) return;
        try {
            const rating = await getUserRatingForProject(projectId, user.uid);
            if (rating) {
                setUserRating({
                    writing: rating.writingScore,
                    display: rating.displayScore,
                    cinematography: rating.cinematographyScore,
                });
                setHasRated(true);
            }
        } catch (error) {
            console.error('Error loading user rating:', error);
        }
    };

    const handleSubmitRating = async () => {
        if (!user || userRating.writing === 0 || userRating.display === 0 || userRating.cinematography === 0) {
            alert('Please rate all three categories');
            return;
        }

        setSubmitting(true);
        try {
            await createOrUpdateRating(
                projectId,
                user.uid,
                userRating.writing,
                userRating.display,
                userRating.cinematography
            );
            setHasRated(true);
            alert('Rating submitted successfully!');
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Project Not Found</h2>
                    <Link href="/originals" className="text-purple-400 hover:underline">
                        ← Back to Originals
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Hero Section */}
            <div className="relative h-[60vh] bg-gradient-to-b from-gray-900 to-black">
                {project.bannerUrl ? (
                    <img
                        src={project.bannerUrl}
                        alt={project.title}
                        className="w-full h-full object-cover opacity-40"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 px-4 pb-8">
                    <div className="max-w-6xl mx-auto">
                        <Link href="/originals" className="text-purple-400 hover:underline mb-4 inline-block">
                            ← Back to Originals
                        </Link>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{project.title}</h1>
                        <p className="text-xl text-gray-300 mb-4 max-w-3xl">{project.logline}</p>
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full">
                                {project.genre}
                            </span>
                            <div className="flex items-center gap-2 text-yellow-500">
                                <Star size={20} fill="currentColor" />
                                <span className="text-xl font-bold">{project.scores.overall.toFixed(1)}</span>
                                <span className="text-gray-400 text-sm">/ 10</span>
                            </div>
                            {project.releasedAt && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar size={16} />
                                    <span className="text-sm">
                                        {new Date(project.releasedAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Video Player Placeholder */}
                        <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center border border-gray-800">
                            <div className="text-center">
                                <Film className="mx-auto mb-4 text-gray-600" size={64} />
                                <p className="text-gray-400">Video player integration coming soon</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    You can integrate with your existing video player or embed platform
                                </p>
                            </div>
                        </div>

                        {/* Scores Breakdown */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Scores Breakdown</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400">Writing</span>
                                        <span className="text-white font-bold">{project.scores.writing.toFixed(1)} / 10</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500"
                                            style={{ width: `${(project.scores.writing / 10) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400">Display & Performance</span>
                                        <span className="text-white font-bold">{project.scores.display.toFixed(1)} / 10</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${(project.scores.display / 10) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400">Cinematography</span>
                                        <span className="text-white font-bold">{project.scores.cinematography.toFixed(1)} / 10</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500"
                                            style={{ width: `${(project.scores.cinematography / 10) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Rate This Project */}
                        {user && (
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">
                                    {hasRated ? 'Your Rating' : 'Rate This Project'}
                                </h3>
                                <div className="space-y-4">
                                    {['writing', 'display', 'cinematography'].map((category) => (
                                        <div key={category}>
                                            <label className="block text-sm font-medium text-gray-400 mb-2 capitalize">
                                                {category === 'display' ? 'Display & Performance' : category}
                                            </label>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                                    <button
                                                        key={score}
                                                        onClick={() => !hasRated && setUserRating({ ...userRating, [category]: score })}
                                                        disabled={hasRated}
                                                        className={`flex-1 py-2 text-xs rounded transition-colors ${userRating[category as keyof typeof userRating] >= score
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                                            } ${hasRated ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                                    >
                                                        {score}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {!hasRated && (
                                        <button
                                            onClick={handleSubmitRating}
                                            disabled={submitting}
                                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                                        >
                                            {submitting ? 'Submitting...' : 'Submit Rating'}
                                        </button>
                                    )}
                                    {hasRated && (
                                        <p className="text-sm text-green-500 text-center">
                                            Thank you for rating this project!
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {!user && (
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                                <p className="text-gray-400 mb-4">Sign in to rate this project</p>
                                <Link
                                    href="/"
                                    className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}

                        {/* Credits */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Credits</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">Written by</p>
                                    <p className="text-white">Script Writer</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Produced by</p>
                                    <p className="text-white">Atto4 Productions</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Status</p>
                                    <p className="text-purple-400 capitalize">{project.status}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
