import { db } from "./db";
import { users, sessions } from "@shared/schema";
import { findFirebaseUserByEmail, deleteFirebaseUser } from "./firebase-service";
import { eq } from "drizzle-orm";

/**
 * Utility function to delete all user accounts and associated data
 * This should be used with caution as it permanently removes data
 */
export async function deleteAllAccounts() {
  try {
    console.log("Starting account cleanup process");
    
    // 1. Get all user emails to delete from Firebase
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users to delete`);
    
    // 2. Delete users from Firebase (if they exist)
    for (const user of allUsers) {
      try {
        if (user.email) {
          const firebaseUser = await findFirebaseUserByEmail(user.email);
          if (firebaseUser) {
            await deleteFirebaseUser(firebaseUser.uid);
            console.log(`Deleted Firebase user: ${user.email}`);
          }
        }
      } catch (error) {
        console.error(`Error deleting Firebase user ${user.email}:`, error);
        // Continue with other users even if one fails
      }
    }
    
    // 3. Delete all sessions
    await db.delete(sessions);
    console.log("Deleted all sessions");
    
    // 4. Delete all users from our database
    await db.delete(users);
    console.log("Deleted all users from database");
    
    return { success: true, message: "All accounts and related data deleted successfully" };
  } catch (error) {
    console.error("Error during account cleanup:", error);
    return { success: false, message: "Error deleting accounts: " + (error as Error).message };
  }
}