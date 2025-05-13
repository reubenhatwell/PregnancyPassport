import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  UserRound,
  Loader2,
  Calendar
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  
  // Fetch pregnancy data for patient-specific settings
  const { data: pregnancy } = useQuery({
    queryKey: ["/api/pregnancy"],
    enabled: user?.role === "patient",
  });
  
  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: z.infer<typeof profileSchema>) => {
      const res = await apiRequest("PATCH", "/api/user/profile", profileData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: z.infer<typeof passwordSchema>) => {
      const res = await apiRequest("POST", "/api/user/change-password", passwordData);
      return await res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to change password",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };
  
  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    changePasswordMutation.mutate(data);
  };
  
  const userInitials = user 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "??";

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={user ? `${user.firstName} ${user.lastName}` : ""} />
      
      <div className="flex-grow flex">
        <Sidebar activePage="settings" userRole={user?.role || "patient"} />
        
        <div className="flex-1 overflow-auto focus:outline-none pb-16 md:pb-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Settings</h1>
            
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="account">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Lock className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="privacy">
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Privacy</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Account Settings */}
              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account profile information and email address
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Profile Picture</h3>
                        <p className="text-sm text-gray-500">
                          This will be displayed on your profile
                        </p>
                        <div className="flex space-x-2">
                          <Button variant="outline" disabled>
                            Change
                          </Button>
                          <Button variant="outline" disabled>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-2">
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                {/* Account Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Type</CardTitle>
                    <CardDescription>
                      Your current account type and role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${user?.role === 'patient' ? 'bg-secondary-100' : 'bg-primary-100'}`}>
                        <UserRound className={`h-6 w-6 ${user?.role === 'patient' ? 'text-secondary-600' : 'text-primary-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{user?.role === 'patient' ? 'Patient Account' : 'Clinician Account'}</p>
                        <p className="text-sm text-gray-500">
                          {user?.role === 'patient' 
                            ? 'Access to your pregnancy journey and health records' 
                            : 'Access to patient records and clinical tools'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Pregnancy Information (Patient only) */}
                {user?.role === 'patient' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pregnancy Information</CardTitle>
                      <CardDescription>
                        Your pregnancy details and due date
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-primary-100">
                          <Calendar className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium">Due Date</p>
                          <p className="text-sm text-gray-500">
                            {pregnancy ? new Date(pregnancy.dueDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Loading...'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-600">
                          To update your pregnancy information, please contact your healthcare provider.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 8 characters long
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-2">
                          <Button 
                            type="submit" 
                            disabled={changePasswordMutation.isPending}
                          >
                            {changePasswordMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Change Password"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-medium">SMS Authentication</h4>
                        <p className="text-sm text-gray-500">
                          Receive a code via SMS to verify your identity
                        </p>
                      </div>
                      <Switch disabled />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-medium">Authentication App</h4>
                        <p className="text-sm text-gray-500">
                          Use an authentication app to generate verification codes
                        </p>
                      </div>
                      <Switch disabled />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-600">
                        Two-factor authentication will be available in a future update.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how you receive notifications and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Email Notifications</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-medium">Appointment Reminders</h4>
                            <p className="text-xs text-gray-500">
                              Receive reminders about upcoming appointments
                            </p>
                          </div>
                          <Switch defaultChecked disabled />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-medium">New Test Results</h4>
                            <p className="text-xs text-gray-500">
                              Get notified when new test results are available
                            </p>
                          </div>
                          <Switch defaultChecked disabled />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-medium">Messages</h4>
                            <p className="text-xs text-gray-500">
                              Receive email when you get a new message
                            </p>
                          </div>
                          <Switch defaultChecked disabled />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-medium">Educational Content</h4>
                            <p className="text-xs text-gray-500">
                              Weekly pregnancy information and tips
                            </p>
                          </div>
                          <Switch disabled />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Push Notifications</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-medium">Enable Push Notifications</h4>
                            <p className="text-xs text-gray-500">
                              Receive notifications on your device
                            </p>
                          </div>
                          <Switch disabled />
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-600">
                          Push notifications will be available in a future update.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button disabled>Save Notification Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Privacy Settings */}
              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Sharing</CardTitle>
                    <CardDescription>
                      Control how your data is used and shared
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-medium">Share with Healthcare Team</h4>
                          <p className="text-xs text-gray-500">
                            Allow your healthcare providers to access your pregnancy data
                          </p>
                        </div>
                        <Switch defaultChecked disabled />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-medium">Anonymous Research Data</h4>
                          <p className="text-xs text-gray-500">
                            Share anonymized data to help improve maternal healthcare
                          </p>
                        </div>
                        <Switch disabled />
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-600">
                          Your data privacy is important to us. All information is protected in accordance with health privacy laws.
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-base font-medium">Data Management</h3>
                      <p className="text-sm text-gray-500">
                        Options for managing your personal data
                      </p>
                      
                      <div className="pt-2 space-y-2">
                        <Button variant="outline" className="w-full sm:w-auto" disabled>
                          Request Data Export
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50" 
                          disabled
                        >
                          Delete Account
                        </Button>
                      </div>
                      
                      <p className="text-xs text-gray-500 pt-2">
                        Note: Account deletion will permanently remove all your data and cannot be undone.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <MobileNavigation activePage="settings" />
    </div>
  );
}
