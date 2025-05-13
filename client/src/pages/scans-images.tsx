import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, ZoomIn, Info, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Scan } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TabsContent,
  Tabs,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

const scanSchema = z.object({
  pregnancyId: z.number(),
  date: z.string().min(1, "Date is required"),
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().optional(),
  notes: z.string().optional(),
});

// Placeholder images for ultrasound scans (for demo purposes)
const placeholderImages = [
  "https://pixabay.com/get/ga554aa6bba38e3cda3d75b2e66929f2c435fb23025e814c1bad032702853daf2c43fcdaff1d5324c7638ba76096f59a7ed70234004ab36f29b4bc66d09c9080d_1280.jpg",
  "https://pixabay.com/get/g0871e3519886cae30c66556289c6e2ad56dc333e07267004b126d209fb51ba6736f31deeefb2642b932d2f459d72f35bfd85b1bc78a7965cdb66696a10f68ac1_1280.jpg",
  "https://pixabay.com/get/gd33ad86dc46b4fee68d2e0fd4b23f27c2dea2f1f77e5a37ea51c4d59e4e4ecb0de7efa4f2851ecc2cbf90e12b3cf04e2_1280.jpg"
];

export default function ScansImages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewingScan, setViewingScan] = useState<Scan | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Fetch pregnancy data
  const { data: pregnancy } = useQuery({
    queryKey: ["/api/pregnancy"],
  });
  
  // Fetch scans
  const { data: scans, isLoading } = useQuery<Scan[]>({
    queryKey: ["/api/scans"],
    enabled: !!pregnancy,
  });
  
  // Form for new scans
  const form = useForm<z.infer<typeof scanSchema>>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      pregnancyId: pregnancy?.id || 0,
      date: new Date().toISOString().split('T')[0],
      title: "",
      imageUrl: "",
      notes: "",
    },
  });
  
  // Create scan mutation
  const createScanMutation = useMutation({
    mutationFn: async (scanData: z.infer<typeof scanSchema>) => {
      const res = await apiRequest("POST", "/api/scans", scanData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
      setIsAddDialogOpen(false);
      form.reset({
        pregnancyId: pregnancy?.id || 0,
        date: new Date().toISOString().split('T')[0],
        title: "",
        imageUrl: "",
        notes: "",
      });
      toast({
        title: "Scan uploaded",
        description: "Your scan has been successfully saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to upload scan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof scanSchema>) => {
    createScanMutation.mutate({
      ...data,
      pregnancyId: pregnancy?.id || 0,
      // For demo purposes, if no image URL is provided, use a placeholder
      imageUrl: data.imageUrl || placeholderImages[Math.floor(Math.random() * placeholderImages.length)],
    });
  };
  
  const viewScan = (scan: Scan) => {
    setViewingScan(scan);
    setViewDialogOpen(true);
  };
  
  // Group scans by month and year
  const groupedScans = (scans || []).reduce((acc, scan) => {
    const date = new Date(scan.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    
    acc[monthYear].push(scan);
    return acc;
  }, {} as Record<string, Scan[]>);
  
  // Sort by date (newest first)
  Object.keys(groupedScans).forEach(month => {
    groupedScans[month].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  
  // Sort months chronologically (newest first)
  const sortedMonths = Object.keys(groupedScans).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={user ? `${user.firstName} ${user.lastName}` : ""} />
      
      <div className="flex-grow flex">
        <Sidebar activePage="scans-images" userRole={user?.role || "patient"} />
        
        <div className="flex-1 overflow-auto focus:outline-none pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-heading font-bold text-gray-900">Ultrasound Scans & Images</h1>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Scan
              </Button>
            </div>
            
            <Tabs defaultValue="gallery" className="mb-6">
              <TabsList>
                <TabsTrigger value="gallery">Gallery View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="gallery" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p>Loading scans...</p>
                  </div>
                ) : scans?.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center py-12">
                      <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No scans uploaded yet</h3>
                      <p className="text-gray-500 mb-4">Upload your ultrasound images to keep track of your baby's development.</p>
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload First Scan
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    {sortedMonths.map(month => (
                      <div key={month}>
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">{month}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {groupedScans[month].map((scan) => (
                            <div 
                              key={scan.id}
                              className="group relative cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                              onClick={() => viewScan(scan)}
                            >
                              <img 
                                src={scan.imageUrl || placeholderImages[0]} 
                                alt={scan.title}
                                className="w-full h-40 object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2">
                                <p className="font-medium text-sm truncate">{scan.title}</p>
                                <p className="text-xs opacity-80">{formatDate(scan.date)}</p>
                              </div>
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="secondary" size="icon" className="bg-white rounded-full shadow-md h-10 w-10">
                                  <ZoomIn className="h-5 w-5 text-gray-800" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="list" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p>Loading scans...</p>
                  </div>
                ) : scans?.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center py-12">
                      <Info className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No scans uploaded yet</h3>
                      <p className="text-gray-500 mb-4">Upload your ultrasound images to keep track of your baby's development.</p>
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload First Scan
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>All Scans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-3 text-left">Title</th>
                              <th className="py-3 text-left">Date</th>
                              <th className="py-3 text-left">Added By</th>
                              <th className="py-3 text-left">Notes</th>
                              <th className="py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...(scans || [])].sort((a, b) => 
                              new Date(b.date).getTime() - new Date(a.date).getTime()
                            ).map((scan) => (
                              <tr key={scan.id} className="border-b hover:bg-gray-50">
                                <td className="py-3">{scan.title}</td>
                                <td className="py-3">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    {formatDate(scan.date)}
                                  </div>
                                </td>
                                <td className="py-3">
                                  {scan.clinicianId ? "Clinician" : "You"}
                                </td>
                                <td className="py-3 max-w-xs truncate">
                                  {scan.notes || '-'}
                                </td>
                                <td className="py-3 text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => viewScan(scan)}
                                  >
                                    <ZoomIn className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <MobileNavigation activePage="scans-images" />
      
      {/* Add Scan Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New Scan</DialogTitle>
            <DialogDescription>
              Upload a new ultrasound scan or pregnancy-related image.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 20-Week Anatomy Scan" {...field} />
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
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">
                      If left empty, a placeholder image will be used for demonstration purposes.
                    </p>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional notes about this scan" 
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
                <Button type="submit" disabled={createScanMutation.isPending}>
                  {createScanMutation.isPending ? "Uploading..." : "Upload Scan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View Scan Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewingScan?.title}</DialogTitle>
          </DialogHeader>
          {viewingScan && (
            <div className="flex flex-col items-center">
              <img 
                src={viewingScan.imageUrl || placeholderImages[0]}
                alt={viewingScan.title}
                className="rounded-lg w-full max-h-[70vh] object-contain"
              />
              <div className="w-full mt-4">
                <p className="text-sm text-gray-500">
                  <strong>Date:</strong> {formatDate(viewingScan.date)}
                </p>
                {viewingScan.notes && (
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Notes:</strong> {viewingScan.notes}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
