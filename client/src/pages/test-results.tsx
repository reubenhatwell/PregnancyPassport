import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Calendar, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TestResult } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const testResultSchema = z.object({
  pregnancyId: z.number(),
  date: z.string().min(1, "Date is required"),
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["normal", "abnormal", "follow_up"]),
  notes: z.string().optional(),
});

export default function TestResults() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewingResult, setViewingResult] = useState<TestResult | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  // Fetch pregnancy data
  const { data: pregnancy } = useQuery({
    queryKey: ["/api/pregnancy"],
  });
  
  // Fetch test results
  const { data: testResults, isLoading } = useQuery<TestResult[]>({
    queryKey: ["/api/test-results"],
    enabled: !!pregnancy,
  });
  
  // Form for new test results
  const form = useForm<z.infer<typeof testResultSchema>>({
    resolver: zodResolver(testResultSchema),
    defaultValues: {
      pregnancyId: pregnancy?.id || 0,
      date: new Date().toISOString().split('T')[0],
      title: "",
      category: "",
      status: "normal",
      notes: "",
    },
  });
  
  // Create test result mutation
  const createTestResultMutation = useMutation({
    mutationFn: async (testResultData: z.infer<typeof testResultSchema>) => {
      const res = await apiRequest("POST", "/api/test-results", testResultData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-results"] });
      setIsAddDialogOpen(false);
      form.reset({
        pregnancyId: pregnancy?.id || 0,
        date: new Date().toISOString().split('T')[0],
        title: "",
        category: "",
        status: "normal",
        notes: "",
      });
      toast({
        title: "Test result saved",
        description: "Your test result has been successfully saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save test result",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof testResultSchema>) => {
    createTestResultMutation.mutate({
      ...data,
      pregnancyId: pregnancy?.id || 0,
    });
  };
  
  const viewTestResult = (result: TestResult) => {
    setViewingResult(result);
    setViewDialogOpen(true);
  };
  
  // Apply filters to test results
  const filteredResults = (testResults || []).filter(result => {
    let categoryMatch = true;
    let statusMatch = true;
    
    if (filterCategory !== "all") {
      categoryMatch = result.category === filterCategory;
    }
    
    if (filterStatus !== "all") {
      statusMatch = result.status === filterStatus;
    }
    
    return categoryMatch && statusMatch;
  });
  
  // Get unique categories for filter
  const categories = [...new Set((testResults || []).map(result => result.category))];

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={user ? `${user.firstName} ${user.lastName}` : ""} />
      
      <div className="flex-grow flex">
        <Sidebar activePage="test-results" userRole={user?.role || "patient"} />
        
        <div className="flex-1 overflow-auto focus:outline-none pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-heading font-bold text-gray-900">Test Results</h1>
              {user?.role === "clinician" && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Test Result
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading test results...</p>
              </div>
            ) : testResults?.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No test results available</h3>
                  <p className="text-gray-500 mb-4">Test results will be added by your healthcare provider.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Filters */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium">Filters:</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                        <Select 
                          value={filterStatus} 
                          onValueChange={setFilterStatus}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="follow_up">Follow Up</SelectItem>
                            <SelectItem value="abnormal">Abnormal</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select 
                          value={filterCategory} 
                          onValueChange={setFilterCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-4">
                  {filteredResults.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                      <p>No test results match your filters.</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => {
                          setFilterStatus("all");
                          setFilterCategory("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    filteredResults
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(result => (
                        <Card key={result.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div className="flex items-start space-x-3">
                                <FileText className="h-5 w-5 text-primary-500 mt-1 flex-shrink-0" />
                                <div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                    <h3 className="font-medium text-gray-900">{result.title}</h3>
                                    <Badge className={getStatusColor(result.status)}>
                                      {getStatusLabel(result.status)}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500 mb-1">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(result.date)}
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 mr-2">
                                      {result.category}
                                    </span>
                                    <span>
                                      Added by {result.clinicianId ? "Clinician" : "You"}
                                    </span>
                                  </div>
                                  {result.notes && (
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{result.notes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="mt-3 md:mt-0 ml-0 md:ml-4 md:flex-shrink-0">
                                <Button 
                                  variant="outline" 
                                  className="w-full md:w-auto"
                                  onClick={() => viewTestResult(result)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <MobileNavigation activePage="test-results" />
      
      {/* Add Test Result Dialog (only for clinicians) */}
      {user?.role === "clinician" && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Test Result</DialogTitle>
              <DialogDescription>
                Enter the details of the patient's test result.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Glucose Tolerance Test" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Blood Test" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="follow_up">Follow Up Required</SelectItem>
                            <SelectItem value="abnormal">Abnormal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes & Results</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter detailed test results and any notes" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTestResultMutation.isPending}>
                    {createTestResultMutation.isPending ? "Saving..." : "Save Test Result"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
      
      {/* View Test Result Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Test Result Details</DialogTitle>
          </DialogHeader>
          {viewingResult && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="font-medium text-xl">{viewingResult.title}</h3>
                <Badge className={getStatusColor(viewingResult.status)}>
                  {getStatusLabel(viewingResult.status)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(viewingResult.date)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{viewingResult.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Added By</p>
                  <p className="font-medium">{viewingResult.clinicianId ? "Clinician" : "You"}</p>
                </div>
              </div>
              
              {viewingResult.results && (
                <div>
                  <p className="text-gray-500 text-sm mb-2">Results</p>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(viewingResult.results, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {viewingResult.notes && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{viewingResult.notes}</p>
                </div>
              )}
              
              {viewingResult.status === "follow_up" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <h4 className="text-yellow-800 font-medium mb-1">Follow Up Required</h4>
                  <p className="text-sm text-yellow-700">
                    This test result requires a follow-up appointment. Please contact your healthcare provider.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
