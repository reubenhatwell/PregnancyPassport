import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountCleanupTool } from "@/components/admin/account-cleanup";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not logged in or not an admin
  React.useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return null; // Will redirect due to the useEffect above
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

      <Tabs defaultValue="system">
        <TabsList className="mb-6">
          <TabsTrigger value="system">System Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-xl font-semibold">System Tools</h2>
              </CardHeader>
              <CardContent>
                <AccountCleanupTool />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold">User Management</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                User management features will be implemented in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}