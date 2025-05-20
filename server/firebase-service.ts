import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
try {
  // Use project ID from environment variables or fallback to hardcoded value for development
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'pregnancypassport';
  
  initializeApp({
    projectId: projectId,
  });
  
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

const auth = getAuth();

/**
 * Create a new user in Firebase Authentication
 * @param email User's email address
 * @param password User's password
 * @param displayName User's display name (first name + last name)
 * @returns Firebase user record or null if operation fails
 */
export const createFirebaseUser = async (email: string, password: string, displayName?: string) => {
  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false, // Set to true if you want to skip email verification
    });
    
    console.log('Successfully created Firebase user:', userRecord.uid);
    return userRecord;
  } catch (error) {
    console.error('Error creating Firebase user:', error);
    return null;
  }
};

/**
 * Update an existing user in Firebase Authentication
 * @param uid Firebase user ID
 * @param updates Object containing fields to update
 * @returns Updated Firebase user record or null if operation fails
 */
export const updateFirebaseUser = async (uid: string, updates: any) => {
  try {
    const userRecord = await auth.updateUser(uid, updates);
    console.log('Successfully updated Firebase user:', userRecord.uid);
    return userRecord;
  } catch (error) {
    console.error('Error updating Firebase user:', error);
    return null;
  }
};

/**
 * Find a Firebase user by email
 * @param email User's email address
 * @returns Firebase user record or null if not found
 */
export const findFirebaseUserByEmail = async (email: string) => {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    console.error('Error finding Firebase user by email:', error);
    return null;
  }
};

/**
 * Delete a Firebase user by their user ID
 * @param uid Firebase user ID
 * @returns true if successful, false otherwise
 */
export const deleteFirebaseUser = async (uid: string) => {
  try {
    await auth.deleteUser(uid);
    console.log('Successfully deleted Firebase user:', uid);
    return true;
  } catch (error) {
    console.error('Error deleting Firebase user:', error);
    return false;
  }
};