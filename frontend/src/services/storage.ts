import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { storage, auth } from '../config/firebase';

/**
 * Ensures the user is authenticated (either with phone or anonymously)
 * This is required for Firebase Storage to work properly
 */
async function ensureAuthenticated(): Promise<void> {
  // Check if user is already authenticated
  if (auth.currentUser) {
    return;
  }

  // If not authenticated, sign in anonymously
  try {
    await signInAnonymously(auth);
    console.log('Signed in anonymously for Firebase Storage access');
  } catch (error) {
    console.error('Failed to sign in anonymously:', error);
    throw new Error('Authentication required for file upload');
  }
}

/**
 * Upload an image to Firebase Storage for a specific event's album
 * @param eventId - The event ID
 * @param file - The image file to upload
 * @param fileName - Optional custom filename (will be sanitized)
 * @returns The download URL of the uploaded image
 */
export async function uploadAlbumImage(
  eventId: string,
  file: File,
  fileName?: string
): Promise<string> {
  try {
    // Ensure user is authenticated (phone or anonymous)
    await ensureAuthenticated();

    // Debug: Log file information
    console.log('Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // Generate a unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = fileName
      ? fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
      : file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;

    // Create a reference to the storage location
    // Path: events/{eventId}/album/{uniqueFileName}
    const storageRef = ref(storage, `events/${eventId}/album/${uniqueFileName}`);

    // Set metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    };

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file, metadata);

    console.log('Upload complete. Bytes transferred:', snapshot.metadata.size);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

/**
 * Delete an image from Firebase Storage
 * @param imageUrl - The full download URL of the image to delete
 */
export async function deleteAlbumImage(imageUrl: string): Promise<void> {
  try {
    // Ensure user is authenticated (phone or anonymous)
    await ensureAuthenticated();
    // Extract the path from the download URL
    // Firebase Storage URLs have format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?...
    const urlParts = imageUrl.split('/o/');
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL');
    }

    const pathWithParams = urlParts[1];
    const path = decodeURIComponent(pathWithParams.split('?')[0]);

    // Create a reference to the file
    const imageRef = ref(storage, path);

    // Delete the file
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image from Firebase Storage:', error);
    throw new Error('Failed to delete image. Please try again.');
  }
}

/**
 * Upload multiple images to Firebase Storage
 * @param eventId - The event ID
 * @param files - Array of image files to upload
 * @returns Array of download URLs
 */
export async function uploadMultipleAlbumImages(
  eventId: string,
  files: File[]
): Promise<string[]> {
  try {
    const uploadPromises = files.map(file => uploadAlbumImage(eventId, file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}
