import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

/**
 * Redirect Page Component
 * 
 * This component handles redirection based on user role after authentication.
 * It ensures users are sent to the appropriate dashboard/directory.
 */
export default function RedirectPage() {
  const [_, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    // Only redirect once we have the user data and have confirmed they're logged in
    if (!isLoading && user) {
      if (user.role === "patient") {
        navigate("/patient-dashboard", { replace: true });
      } else if (user.role === "clinician") {
        navigate("/patient-directory", { replace: true });
      } else {
        // Default fallback
        navigate("/", { replace: true });
      }
    } else if (!isLoading && !user) {
      // If not logged in, redirect to login page
      navigate("/auth-page", { replace: true });
    }
  }, [user, isLoading, navigate]);
  
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-lg text-foreground/70">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}