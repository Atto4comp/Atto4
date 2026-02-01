// lib/firebase/firestore.ts
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    DocumentData,
    QueryConstraint,
    Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
    UserDoc,
    OriginalScriptDoc,
    OriginalProjectDoc,
    OriginalRatingDoc,
    UserRole,
    ScriptStatus,
} from '../types/originals';

// ========== USERS ==========

export async function createUser(uid: string, data: Omit<UserDoc, 'uid' | 'joinedAt'>): Promise<void> {
    const userDoc: UserDoc = {
        uid,
        ...data,
        joinedAt: Date.now(),
    };
    await setDoc(doc(db, 'users', uid), userDoc);
}

export async function getUser(uid: string): Promise<UserDoc | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserDoc) : null;
}

export async function updateUser(uid: string, data: Partial<UserDoc>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), data);
}

// ========== SCRIPTS ==========

export async function createScript(
    scriptId: string,
    data: Omit<OriginalScriptDoc, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
    const scriptDoc: OriginalScriptDoc = {
        id: scriptId,
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    await setDoc(doc(db, 'originalScripts', scriptId), scriptDoc);
}

export async function getScript(scriptId: string): Promise<OriginalScriptDoc | null> {
    const docRef = doc(db, 'originalScripts', scriptId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as OriginalScriptDoc) : null;
}

export async function updateScript(scriptId: string, data: Partial<OriginalScriptDoc>): Promise<void> {
    await updateDoc(doc(db, 'originalScripts', scriptId), {
        ...data,
        updatedAt: Date.now(),
    });
}

export async function deleteScript(scriptId: string): Promise<void> {
    await deleteDoc(doc(db, 'originalScripts', scriptId));
}

export async function getScriptsByWriter(writerId: string): Promise<OriginalScriptDoc[]> {
    const q = query(
        collection(db, 'originalScripts'),
        where('writerId', '==', writerId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as OriginalScriptDoc);
}

export async function getScriptsByStatus(status: ScriptStatus): Promise<OriginalScriptDoc[]> {
    const q = query(
        collection(db, 'originalScripts'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as OriginalScriptDoc);
}

// ========== PROJECTS ==========

export async function createProject(
    projectId: string,
    data: Omit<OriginalProjectDoc, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
    const projectDoc: OriginalProjectDoc = {
        id: projectId,
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    await setDoc(doc(db, 'originalProjects', projectId), projectDoc);
}

export async function getProject(projectId: string): Promise<OriginalProjectDoc | null> {
    const docRef = doc(db, 'originalProjects', projectId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as OriginalProjectDoc) : null;
}

export async function updateProject(projectId: string, data: Partial<OriginalProjectDoc>): Promise<void> {
    await updateDoc(doc(db, 'originalProjects', projectId), {
        ...data,
        updatedAt: Date.now(),
    });
}

export async function deleteProject(projectId: string): Promise<void> {
    await deleteDoc(doc(db, 'originalProjects', projectId));
}

export async function getAllProjects(): Promise<OriginalProjectDoc[]> {
    const q = query(collection(db, 'originalProjects'), orderBy('publicRanking', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as OriginalProjectDoc);
}

export async function getReleasedProjects(): Promise<OriginalProjectDoc[]> {
    const q = query(
        collection(db, 'originalProjects'),
        where('status', '==', 'released'),
        orderBy('publicRanking', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as OriginalProjectDoc);
}

export async function getFeaturedProjects(): Promise<OriginalProjectDoc[]> {
    const q = query(
        collection(db, 'originalProjects'),
        where('featured', '==', true),
        where('status', '==', 'released'),
        orderBy('publicRanking', 'desc'),
        limit(5)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as OriginalProjectDoc);
}

// ========== RATINGS ==========

export async function createOrUpdateRating(
    projectId: string,
    userId: string,
    writingScore: number,
    displayScore: number,
    cinematographyScore: number
): Promise<void> {
    const ratingId = `${projectId}_${userId}`;
    const existingRating = await getRating(ratingId);

    const ratingDoc: OriginalRatingDoc = {
        id: ratingId,
        projectId,
        userId,
        writingScore,
        displayScore,
        cinematographyScore,
        createdAt: existingRating?.createdAt || Date.now(),
        updatedAt: Date.now(),
    };

    await setDoc(doc(db, 'originalRatings', ratingId), ratingDoc);
}

export async function getRating(ratingId: string): Promise<OriginalRatingDoc | null> {
    const docRef = doc(db, 'originalRatings', ratingId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as OriginalRatingDoc) : null;
}

export async function getUserRatingForProject(
    projectId: string,
    userId: string
): Promise<OriginalRatingDoc | null> {
    const ratingId = `${projectId}_${userId}`;
    return getRating(ratingId);
}

export async function getProjectRatings(projectId: string): Promise<OriginalRatingDoc[]> {
    const q = query(collection(db, 'originalRatings'), where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as OriginalRatingDoc);
}
