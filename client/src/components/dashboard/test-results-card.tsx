import { TestResult } from "@/types";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { FileText, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface TestResultsCardProps {
  testResults: TestResult[];
}

export default function TestResultsCard({ testResults }: TestResultsCardProps) {
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Sort by date (newest first) and get the most recent results
  const recentResults = [...testResults]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3); // Show only 3 most recent results on dashboard
  
  const viewResultDetails = (result: TestResult) => {
    setSelectedResult(result);
    setIsDialogOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-heading font-semibold text-gray-900">Recent Test Results</h2>
        <Button variant="link" size="sm" asChild>
          <Link href="/test-results">
            <Plus className="h-4 w-4 mr-1" />
            Upload
          </Link>
        </Button>
      </div>
      
      {recentResults.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No test results available yet.</p>
          <Button variant="outline" className="mt-2" asChild>
            <Link href="/test-results">View test results</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {recentResults.map((result) => (
              <div key={result.id} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-primary-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">{result.title}</h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(result.date)} • {result.clinicianId ? "Dr. Added by clinician" : "Uploaded by you"}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {getStatusLabel(result.status)}
                  </Badge>
                </div>
                <div className="ml-9 mt-2 flex">
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-primary-600 hover:text-primary-800"
                    onClick={() => viewResultDetails(result)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Link 
            href="/test-results" 
            className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center justify-center mt-4"
          >
            View all test results
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </Link>
        </>
      )}
      
      {/* Test Result Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Test Result Details</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h3 className="font-medium text-lg">{selectedResult.title}</h3>
                <Badge className={getStatusColor(selectedResult.status)}>
                  {getStatusLabel(selectedResult.status)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedResult.date)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{selectedResult.category}</p>
                </div>
              </div>
              
              {selectedResult.results && (
                <div>
                  <p className="text-gray-500 text-sm mb-2">Results</p>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(selectedResult.results, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {selectedResult.notes && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Notes</p>
                  <p className="text-sm">{selectedResult.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
