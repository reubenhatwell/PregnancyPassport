import { apiRequest } from './queryClient';

const SESSION_ACTIVITY_KEY = 'lastUserActivity';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes by default

let timeoutHandle: number | null = null;
let isSessionExpired = false;

// Initialize the session timeout monitoring
export function initSessionTimeoutMonitor(customTimeout?: number) {
  const timeout = customTimeout || INACTIVITY_TIMEOUT;
  
  // Set the initial activity timestamp
  updateUserActivity();
  
  // Register event listeners for user activity
  window.addEventListener('mousemove', handleUserActivity);
  window.addEventListener('keypress', handleUserActivity);
  window.addEventListener('click', handleUserActivity);
  window.addEventListener('scroll', handleUserActivity);
  window.addEventListener('touchstart', handleUserActivity);
  
  // Start the check interval
  startSessionCheck(timeout);
  
  return () => {
    // Clean up function
    window.removeEventListener('mousemove', handleUserActivity);
    window.removeEventListener('keypress', handleUserActivity);
    window.removeEventListener('click', handleUserActivity);
    window.removeEventListener('scroll', handleUserActivity);
    window.removeEventListener('touchstart', handleUserActivity);
    
    if (timeoutHandle !== null) {
      window.clearTimeout(timeoutHandle);
    }
  };
}

// Update the user activity timestamp
function updateUserActivity() {
  localStorage.setItem(SESSION_ACTIVITY_KEY, Date.now().toString());
  
  // If session was expired and user is active again, refresh the page to get a new session
  if (isSessionExpired) {
    window.location.reload();
  }
}

// Handle any user activity
function handleUserActivity() {
  updateUserActivity();
}

// Start checking for session timeouts
function startSessionCheck(timeout: number) {
  // Check every minute
  timeoutHandle = window.setTimeout(() => {
    checkSessionTimeout(timeout);
    startSessionCheck(timeout);
  }, 60 * 1000);
}

// Check if the session has timed out
async function checkSessionTimeout(timeout: number) {
  const lastActivity = localStorage.getItem(SESSION_ACTIVITY_KEY);
  
  if (!lastActivity) {
    updateUserActivity();
    return;
  }
  
  const now = Date.now();
  const lastActivityTime = parseInt(lastActivity, 10);
  const timeSinceLastActivity = now - lastActivityTime;
  
  if (timeSinceLastActivity > timeout) {
    // Session has timed out
    isSessionExpired = true;
    
    try {
      // Try to log the session timeout to the server for audit purposes
      await apiRequest('POST', '/api/session-timeout', {});
    } catch (error) {
      console.error('Failed to log session timeout:', error);
    }
    
    // Display a timeout message to the user
    window.alert('Your session has expired due to inactivity. Please log in again.');
    
    // Redirect to login page
    window.location.href = '/login';
  }
}

// Get the remaining time before session expiry
export function getRemainingSessionTime(): number | null {
  const lastActivity = localStorage.getItem(SESSION_ACTIVITY_KEY);
  if (!lastActivity) return null;
  
  const lastActivityTime = parseInt(lastActivity, 10);
  const now = Date.now();
  const elapsed = now - lastActivityTime;
  
  return Math.max(0, INACTIVITY_TIMEOUT - elapsed);
}