// app/profile/page.tsx
'use client';

import React from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuth } from '@/lib/hooks/useAuth';
import { User, Mail, Shield, Award } from 'lucide-react';

export default function ProfilePage() {
    const { userDoc } = useAuth();

    if (!userDoc) return null;

    const getRoleBadge = (role: string) => {
        const config = {
            admin: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: Shield, label: 'Admin' },
            creator: { color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Award, label: 'Creator' },
            regular: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: User, label: 'Regular User' },
        };
        return config[role as keyof typeof config] || config.regular;
    };

    const badge = getRoleBadge(userDoc.role);
    const RoleIcon = badge.icon;

    return (
        <ProtectedRoute requireAuth>
            <div className="min-h-screen bg-black py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 border-b border-gray-800">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                                    {userDoc.displayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-white mb-2">{userDoc.displayName}</h1>
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full ${badge.color}`}>
                                        <RoleIcon size={16} />
                                        <span className="font-medium text-sm">{badge.label}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-8 space-y-6">
                            <div>
                                <div className="flex items-center gap-2 text-gray-400 mb-2">
                                    <Mail size={18} />
                                    <span className="text-sm font-medium">Email</span>
                                </div>
                                <p className="text-white">{userDoc.email}</p>
                            </div>

                            {userDoc.bio && (
                                <div>
                                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                                        <User size={18} />
                                        <span className="text-sm font-medium">Bio</span>
                                    </div>
                                    <p className="text-white">{userDoc.bio}</p>
                                </div>
                            )}

                            {userDoc.specialties && userDoc.specialties.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 text-gray-400 mb-3">
                                        <Award size={18} />
                                        <span className="text-sm font-medium">Specialties</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {userDoc.specialties.map((specialty, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full"
                                            >
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-gray-800">
                                <p className="text-sm text-gray-500">
                                    Member since {new Date(userDoc.joinedAt).toLocaleDateString('en-US', {
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
