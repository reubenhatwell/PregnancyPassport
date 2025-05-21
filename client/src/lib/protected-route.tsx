import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Redirect, Route, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles = ["patient", "clinician", "admin"],
}: {
  path: string;
  component: () => React.JSX.Element;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check if current user has access to this route
  const hasAccess = user && allowedRoles.includes(user.role);

  // Handle redirection with informative toast
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "default",
      });
    } else if (!isLoading && user && !hasAccess) {
      toast({
        title: "Access Restricted",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      
      // Redirect to appropriate dashboard based on role
      if (user.role === "patient") {
        setLocation("/patient-dashboard");
      } else if (user.role === "clinician") {
        setLocation("/patient-directory");
      }
    }
  }, [isLoading, user, hasAccess, toast, setLocation]);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-4" />
          <p className="text-primary-600">Loading your information...</p>
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth-page" />
      </Route>
    );
  }

  if (!hasAccess) {
    return (
      <Route path={path}>
        <Redirect to={user.role === "clinician" ? "/patient-directory" : "/patient-dashboard"} />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
