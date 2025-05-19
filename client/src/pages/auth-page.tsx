import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heart, User, Loader2 } from "lucide-react";
import { UserRole } from "@/types";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["patient", "clinician"]),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["patient", "clinician"]),
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation, isLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "patient" as UserRole,
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "patient" as UserRole,
    },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  const isPending = loginMutation.isPending || registerMutation.isPending || isLoading;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-heading text-primary-600">
              Digital Pregnancy Passport
            </CardTitle>
            <CardDescription>
              Your pregnancy journey in one secure place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Login as</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-1"
                            >
                              <div className={`flex items-center justify-center flex-1 space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors ${field.value === "patient" ? "bg-pink-50 border-pink-200" : "border-gray-200"}`}>
                                <RadioGroupItem value="patient" id="login-patient" className="sr-only" />
                                <Label htmlFor="login-patient" className="flex items-center cursor-pointer">
                                  <Heart className={`h-4 w-4 mr-2 ${field.value === "patient" ? "text-pink-500" : "text-rose-500"}`} />
                                  <span>Patient</span>
                                </Label>
                              </div>
                              <div className={`flex items-center justify-center flex-1 space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors ${field.value === "clinician" ? "bg-pink-50 border-pink-200" : "border-gray-200"}`}>
                                <RadioGroupItem value="clinician" id="login-clinician" className="sr-only" />
                                <Label htmlFor="login-clinician" className="flex items-center cursor-pointer">
                                  <User className={`h-4 w-4 mr-2 ${field.value === "clinician" ? "text-pink-500" : "text-primary-400"}`} />
                                  <span>Clinician</span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="remember-me" 
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <Label htmlFor="remember-me" className="text-sm text-gray-700">
                          Remember me
                        </Label>
                      </div>
                      <Button variant="link" className="p-0 h-auto text-primary-600 hover:text-primary-500">
                        Forgot password?
                      </Button>
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johndoe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Account Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-1"
                            >
                              <div className={`flex items-center justify-center flex-1 space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors ${field.value === "patient" ? "bg-pink-50 border-pink-200" : "border-gray-200"}`}>
                                <RadioGroupItem value="patient" id="patient" className="sr-only" />
                                <Label htmlFor="patient" className="flex items-center cursor-pointer">
                                  <Heart className={`h-4 w-4 mr-2 ${field.value === "patient" ? "text-pink-500" : "text-rose-500"}`} />
                                  <span>Patient</span>
                                </Label>
                              </div>
                              <div className={`flex items-center justify-center flex-1 space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors ${field.value === "clinician" ? "bg-pink-50 border-pink-200" : "border-gray-200"}`}>
                                <RadioGroupItem value="clinician" id="clinician" className="sr-only" />
                                <Label htmlFor="clinician" className="flex items-center cursor-pointer">
                                  <User className={`h-4 w-4 mr-2 ${field.value === "clinician" ? "text-pink-500" : "text-primary-400"}`} />
                                  <span>Clinician</span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="hidden md:flex flex-1 bg-primary-800 items-center justify-center p-8">
        <div className="max-w-md text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-4">
              Australia's First Digital Pregnancy Passport
            </h1>
            <p className="text-primary-100 text-lg">
              A secure, comprehensive digital platform connecting patients and clinicians for better pregnancy care.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-700 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Digital Records</h3>
                <p className="text-primary-100">Say goodbye to paper records that can be lost or damaged.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary-700 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Health Tracking</h3>
                <p className="text-primary-100">Monitor vital signs, test results, and pregnancy milestones.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-primary-700 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Better Communication</h3>
                <p className="text-primary-100">Direct messaging between patients and healthcare providers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
