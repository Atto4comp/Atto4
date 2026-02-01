// lib/firebase/auth.ts
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User,
    UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(
    email: string,
    password: string
): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in an existing user with email and password
 */
export async function signInWithEmail(
    email: string,
    password: string
): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
    return signOut(auth);
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}
