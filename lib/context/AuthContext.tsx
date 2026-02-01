// lib/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '../firebase/auth';
import { getUser } from '../firebase/firestore';
import { UserDoc } from '../types/originals';

interface AuthContextType {
    user: User | null;
    userDoc: UserDoc | null;
    loading: boolean;
    isAdmin: boolean;
    isCreator: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    userDoc: null,
    loading: true,
    isAdmin: false,
    isCreator: false,
});

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch user document from Firestore
                try {
                    const doc = await getUser(firebaseUser.uid);
                    setUserDoc(doc);
                } catch (error) {
                    console.error('Error fetching user document:', error);
                    setUserDoc(null);
                }
            } else {
                setUserDoc(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const isAdmin = userDoc?.role === 'admin';
    const isCreator = userDoc?.role === 'creator' || isAdmin;

    return (
        <AuthContext.Provider value={{ user, userDoc, loading, isAdmin, isCreator }}>
            {children}
        </AuthContext.Provider>
    );
}
