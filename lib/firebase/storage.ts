// lib/firebase/storage.ts
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    UploadResult,
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a script PDF file to Firebase Storage
 * @param file - The PDF file to upload
 * @param userId - The user ID of the uploader
 * @param scriptId - The unique script ID
 * @returns The download URL of the uploaded file
 */
export async function uploadScriptPDF(
    file: File,
    userId: string,
    scriptId: string
): Promise<string> {
    const filePath = `scripts/${userId}/${scriptId}.pdf`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
}

/**
 * Delete a script PDF from Firebase Storage
 * @param scriptFilePath - The storage path of the file
 */
export async function deleteScriptPDF(scriptFilePath: string): Promise<void> {
    const storageRef = ref(storage, scriptFilePath);
    await deleteObject(storageRef);
}

/**
 * Upload project media (poster, banner) to Firebase Storage
 * @param file - The image file to upload
 * @param projectId - The project ID
 * @param type - 'poster' or 'banner'
 * @returns The download URL of the uploaded file
 */
export async function uploadProjectMedia(
    file: File,
    projectId: string,
    type: 'poster' | 'banner'
): Promise<string> {
    const filePath = `projects/${projectId}/${type}.jpg`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
}

/**
 * Upload user avatar to Firebase Storage
 * @param file - The image file to upload
 * @param userId - The user ID
 * @returns The download URL of the uploaded file
 */
export async function uploadUserAvatar(
    file: File,
    userId: string
): Promise<string> {
    const filePath = `avatars/${userId}.jpg`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
}

/**
 * Get download URL for a file
 * @param filePath - The storage path of the file
 * @returns The download URL
 */
export async function getFileURL(filePath: string): Promise<string> {
    const storageRef = ref(storage, filePath);
    return getDownloadURL(storageRef);
}
