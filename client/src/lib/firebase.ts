import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

// Use hard-coded values for debugging
const firebaseConfig = {
  apiKey: "AIzaSyAdaTVzJvdCxabk_t92QQs-zoDSeVDQbdM",
  authDomain: "pregnancypassport.firebaseapp.com",
  projectId: "pregnancypassport",
  storageBucket: "pregnancypassport.appspot.com",
  appId: "1:228649424721:web:e4bfef12345678abcdef",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Password reset function
export const sendPasswordReset = async (email: string): Promise<boolean> => {
  try {
    // Log the attempt for debugging
    console.log("Attempting to send password reset email to:", email);
    
    // Make a request to our server to check if email exists
    await fetch('/api/check-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    // Use firebase auth to send password reset email
    await sendPasswordResetEmail(auth, email, {
      // Use the action code settings to specify the URL to redirect to after password reset
      url: window.location.origin + '/auth-page?mode=resetPassword&email=' + encodeURIComponent(email),
      handleCodeInApp: true,
    });
    
    console.log("Password reset email sent successfully");
    return true;
  } catch (error: any) {
    // Improved error logging with more details
    console.error("Error sending password reset email:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // Firebase might throw even if the user doesn't exist, but we don't want to expose that info
    return false;
  }
};

export { auth };