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
    <div className="bg-card rounded-xl shadow-md p-6 border border-primary/10">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-heading font-semibold text-primary">Recent Test Results</h2>
        <Button variant="ghost" size="sm" asChild className="bg-primary/10 hover:bg-primary/20 text-primary">
          <Link href="/test-results">
            <Plus className="h-4 w-4 mr-1" />
            Upload Results
          </Link>
        </Button>
      </div>
      
      {recentResults.length === 0 ? (
        <div className="text-center py-8 bg-secondary/10 rounded-lg border border-secondary/20">
          <p className="text-foreground/70 mb-3">No test results available yet.</p>
          <Button className="mt-2 bg-primary/90 hover:bg-primary" asChild>
            <Link href="/test-results">View test results</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {recentResults.map((result) => (
              <div 
                key={result.id} 
                className="border border-primary/10 rounded-lg p-4 bg-secondary/10 hover:bg-secondary/20 transition-colors duration-200"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{result.title}</h3>
                      <p className="text-xs text-foreground/60 mt-1">
                        {formatDate(result.date)} • {result.clinicianId ? "Added by clinician" : "Uploaded by you"}
                      </p>
                    </div>
                  </div>
                  <Badge className={`px-3 py-1 ${getStatusColor(result.status)}`}>
                    {getStatusLabel(result.status)}
                  </Badge>
                </div>
                <div className="ml-12 mt-2 flex">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 text-xs bg-white/50 hover:bg-primary/10 text-primary"
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
            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center justify-center mt-5 py-2 border-t border-primary/10"
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
        <DialogContent className="max-w-lg border border-primary/20 bg-card shadow-lg">
          <DialogHeader className="border-b border-primary/10 pb-3">
            <DialogTitle className="text-primary font-heading">Test Result Details</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-5 pt-2">
              <div className="flex flex-col sm:flex-row justify-between gap-3 items-start">
                <h3 className="font-medium text-xl text-primary">{selectedResult.title}</h3>
                <Badge className={`px-3 py-1 ${getStatusColor(selectedResult.status)}`}>
                  {getStatusLabel(selectedResult.status)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <p className="text-primary/70 mb-1 font-medium">Date</p>
                  <p className="text-foreground font-semibold">{formatDate(selectedResult.date)}</p>
                </div>
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <p className="text-primary/70 mb-1 font-medium">Category</p>
                  <p className="text-foreground font-semibold">{selectedResult.category}</p>
                </div>
              </div>
              
              {selectedResult.results && (
                <div>
                  <p className="text-primary/70 font-medium mb-2">Results</p>
                  <div className="bg-secondary/10 p-4 rounded-lg border border-primary/10">
                    <pre className="text-sm whitespace-pre-wrap text-foreground/90 font-mono">
                      {JSON.stringify(selectedResult.results, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {selectedResult.notes && (
                <div className="bg-secondary/5 p-4 rounded-lg border border-primary/10">
                  <p className="text-primary/70 font-medium mb-2">Notes</p>
                  <p className="text-foreground/90">{selectedResult.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end pt-2 border-t border-primary/10">
                <Button 
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-primary/90 hover:bg-primary"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
