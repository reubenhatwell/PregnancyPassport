import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, LoginData, RegisterData } from "@/types";
import { initSessionTimeoutMonitor } from "../lib/session-timeout";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Initialize session timeout monitoring when user is logged in
  useEffect(() => {
    let cleanupFunction: (() => void) | undefined;
    
    if (user) {
      // User is logged in, start monitoring for session timeout
      // Default timeout is 30 minutes, can be customized
      cleanupFunction = initSessionTimeoutMonitor();
    }
    
    // Cleanup when component unmounts or user logs out
    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [user]);
  
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Redirect to appropriate dashboard based on user role
      if (user.role === "patient") {
        window.location.href = "/patient-dashboard";
      } else if (user.role === "clinician") {
        window.location.href = "/clinician-dashboard";
      }
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Redirect to appropriate dashboard based on user role
      if (user.role === "patient") {
        window.location.href = "/patient-dashboard";
      } else if (user.role === "clinician") {
        window.location.href = "/clinician-dashboard";
      }
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Session timeout settings
  const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  // Set up session timeout tracking
  useEffect(() => {
    if (!user) return; // Only track for logged-in users
    
    let inactivityTimer: number;
    
    // Function to reset the inactivity timer
    const resetInactivityTimer = () => {
      window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(() => {
        // Log user out after inactivity period
        toast({
          title: "Session expired",
          description: "Your session has expired due to inactivity. Please log in again.",
          variant: "default",
        });
        
        // Use custom mutation for session timeout to track it specifically
        // We'll send a different endpoint that will log this as a timeout rather than regular logout
        const timeoutLogout = async () => {
          try {
            // Log this as a session timeout instead of normal logout
            await apiRequest("POST", "/api/session-timeout");
            // Then perform normal logout action
            logoutMutation.mutate();
          } catch (err) {
            // If the timeout endpoint fails, still do the regular logout
            logoutMutation.mutate();
          }
        };
        
        timeoutLogout();
      }, INACTIVE_TIMEOUT);
    };
    
    // Set initial timer
    resetInactivityTimer();
    
    // Events to track user activity
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click'
    ];
    
    // Event listener for user activity
    const handleUserActivity = () => {
      resetInactivityTimer();
    };
    
    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });
    
    // Clean up
    return () => {
      window.clearTimeout(inactivityTimer);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user, toast, logoutMutation]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
