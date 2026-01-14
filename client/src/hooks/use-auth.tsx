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
import { supabase } from "@/lib/supabase";

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) throw error;
      // Trigger user fetch from API to sync/create local record
      const res = await apiRequest("GET", "/api/user");
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Redirect to appropriate dashboard based on user role
      if (user.role === "patient") {
        window.location.href = "/patient-dashboard";
      } else if (user.role === "clinician") {
        window.location.href = "/patient-directory";
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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut();
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onSuccess: () => {
      // Clear user data and redirect to login page
      queryClient.setQueryData(["/api/user"], null);
      window.location.href = "/auth-page";
      
      toast({
        title: "Logout successful",
        description: "You have been successfully logged out.",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
          },
        },
      });
      if (error) throw error;
      // After sign up, fetch user from API (auto-provisioned)
      const res = await apiRequest("GET", "/api/user");
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Redirect to appropriate dashboard based on user role
      if (user.role === "patient") {
        window.location.href = "/patient-dashboard";
      } else if (user.role === "clinician") {
        window.location.href = "/patient-directory";
      }
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
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
