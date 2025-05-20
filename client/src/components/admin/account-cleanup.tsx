import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AccountCleanupTool() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteComplete, setDeleteComplete] = useState(false);
  const { toast } = useToast();

  const handleDeleteAllAccounts = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/admin/delete-all-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setDeleteComplete(true);
        toast({
          title: "Account Cleanup Successful",
          description: "All accounts and associated data have been deleted.",
        });
      } else {
        toast({
          title: "Account Cleanup Failed",
          description: result.message || "An error occurred during the cleanup process.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      console.error("Account cleanup error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-red-200 bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-medium text-gray-900">System Reset</h3>
      <p className="mb-4 text-sm text-gray-600">
        This tool will delete <strong>all user accounts</strong> and associated data from both 
        the database and Firebase Authentication. Use with extreme caution!
      </p>
      
      <div className="flex justify-end">
        <Button 
          variant="destructive" 
          onClick={() => setShowConfirmDialog(true)}
        >
          Delete All Accounts
        </Button>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {deleteComplete ? "Account Cleanup Complete" : "Warning: Confirm Account Deletion"}
            </DialogTitle>
            <DialogDescription>
              {deleteComplete ? (
                "All accounts and associated data have been deleted. You will need to refresh the page or navigate to the login screen."
              ) : (
                "This action will permanently delete ALL user accounts and data. This cannot be undone."
              )}
            </DialogDescription>
          </DialogHeader>
          
          {!deleteComplete ? (
            <>
              <div className="py-4">
                <p className="text-sm font-medium text-gray-900">The following data will be deleted:</p>
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
                  <li>All user accounts (patients, clinicians, administrators)</li>
                  <li>All Firebase Authentication user accounts</li>
                  <li>All active sessions</li>
                  <li>All associated user data</li>
                </ul>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteAllAccounts}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : "Yes, Delete Everything"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <DialogFooter>
              <Button 
                onClick={() => {
                  setShowConfirmDialog(false);
                  setDeleteComplete(false);
                  // Redirect to login page
                  window.location.href = "/";
                }}
              >
                Return to Login
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}