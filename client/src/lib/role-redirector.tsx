import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

/**
 * Component that handles role-based redirection after login
 * This ensures patients go to the right dashboard and clinicians
 * go to the patient directory
 */
export function useRoleRedirector() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // Redirect based on user role
    if (user.role === 'patient') {
      window.location.href = '/patient-dashboard';
    } else if (user.role === 'clinician') {
      window.location.href = '/patient-directory';
    } else {
      // Fallback for any other role
      window.location.href = '/redirect';
    }
  }, [user]);
  
  return null;
}