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
      console.log("Redirecting user with role:", user.role);
      
      if (user.role === "patient") {
        console.log("Patient detected - redirecting to patient dashboard");
        // Use window.location for a full page refresh to ensure clean state
        window.location.href = "/patient-dashboard";
      } else if (user.role === "clinician") {
        console.log("Clinician detected - redirecting to patient directory");
        window.location.href = "/patient-directory";
      } else {
        // Default fallback
        console.log("Unknown role - redirecting to home");
        window.location.href = "/";
      }
    } else if (!isLoading && !user) {
      // If not logged in, redirect to login page
      console.log("User not logged in - redirecting to auth page");
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