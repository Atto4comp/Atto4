// components/scripts/ScriptSubmissionForm.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createScript } from '@/lib/firebase/firestore';
import { uploadScriptPDF } from '@/lib/firebase/storage';
import { useRouter } from 'next/navigation';

const GENRES = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi',
    'Thriller', 'Mystery', 'Fantasy', 'Crime', 'Adventure', 'Other'
];

export default function ScriptSubmissionForm() {
    const { user, userDoc } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        logline: '',
        genre: 'Drama',
        pagesEstimate: '',
        notesForProducer: '',
    });
    const [scriptFile, setScriptFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userDoc) return;

        setError('');
        setLoading(true);

        try {
            // Validate file
            if (!scriptFile) {
                throw new Error('Please select a PDF file to upload');
            }

            if (scriptFile.size > 10 * 1024 * 1024) {
                throw new Error('File size must be less than 10MB');
            }

            // Generate script ID
            const scriptId = `${user.uid}_${Date.now()}`;

            // Upload PDF to storage
            await uploadScriptPDF(scriptFile, user.uid, scriptId);

            // Create script document in Firestore
            await createScript(scriptId, {
                title: formData.title,
                logline: formData.logline,
                genre: formData.genre,
                writerId: user.uid,
                writerName: userDoc.displayName,
                pagesEstimate: formData.pagesEstimate ? parseInt(formData.pagesEstimate) : undefined,
                scriptFilePath: `scripts/${user.uid}/${scriptId}.pdf`,
                notesForProducer: formData.notesForProducer,
                status: 'pending',
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/my-submissions');
            }, 2000);
        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.message || 'Failed to submit script. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-green-500/10 border border-green-500 text-green-500 px-6 py-8 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2">Script Submitted Successfully!</h3>
                <p>Redirecting to your submissions...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Script Title *
                </label>
                <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., The Last Stand"
                />
            </div>

            <div>
                <label htmlFor="logline" className="block text-sm font-medium text-gray-300 mb-2">
                    Logline *
                </label>
                <textarea
                    id="logline"
                    value={formData.logline}
                    onChange={(e) => setFormData({ ...formData, logline: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A one-sentence summary of your story..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-2">
                        Genre *
                    </label>
                    <select
                        id="genre"
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {GENRES.map((genre) => (
                            <option key={genre} value={genre}>{genre}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="pages" className="block text-sm font-medium text-gray-300 mb-2">
                        Estimated Pages
                    </label>
                    <input
                        id="pages"
                        type="number"
                        value={formData.pagesEstimate}
                        onChange={(e) => setFormData({ ...formData, pagesEstimate: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 15"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="scriptFile" className="block text-sm font-medium text-gray-300 mb-2">
                    Script File (PDF) *
                </label>
                <input
                    id="scriptFile"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setScriptFile(e.target.files?.[0] || null)}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                <p className="text-xs text-gray-500 mt-2">Max file size: 10MB</p>
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                    Notes for Producer (Optional)
                </label>
                <textarea
                    id="notes"
                    value={formData.notesForProducer}
                    onChange={(e) => setFormData({ ...formData, notesForProducer: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional information or notes..."
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
                {loading ? 'Submitting...' : 'Submit Script'}
            </button>
        </form>
    );
}
