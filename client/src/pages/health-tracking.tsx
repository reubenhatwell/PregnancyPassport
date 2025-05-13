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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Line } from "recharts";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Activity, Weight, Ruler, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { VitalStat } from "@/types";

const vitalStatSchema = z.object({
  pregnancyId: z.number(),
  date: z.string().min(1, "Date is required"),
  weight: z.number().min(20, "Weight must be at least 20kg").optional(),
  bloodPressureSystolic: z.number().min(60, "Systolic BP must be at least 60").optional(),
  bloodPressureDiastolic: z.number().min(40, "Diastolic BP must be at least 40").optional(),
  fundalHeight: z.number().min(1, "Fundal height must be at least 1cm").optional(),
  notes: z.string().optional(),
});

export default function HealthTracking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Fetch pregnancy data
  const { data: pregnancy } = useQuery({
    queryKey: ["/api/pregnancy"],
  });
  
  // Fetch vital stats
  const { data: vitalStats, isLoading } = useQuery<VitalStat[]>({
    queryKey: ["/api/vital-stats"],
    enabled: !!pregnancy,
  });
  
  // Form for new vital stats
  const form = useForm<z.infer<typeof vitalStatSchema>>({
    resolver: zodResolver(vitalStatSchema),
    defaultValues: {
      pregnancyId: pregnancy?.id || 0,
      date: new Date().toISOString().split('T')[0],
      weight: undefined,
      bloodPressureSystolic: undefined,
      bloodPressureDiastolic: undefined,
      fundalHeight: undefined,
      notes: "",
    },
  });
  
  // Create vital stat mutation
  const createVitalStatMutation = useMutation({
    mutationFn: async (vitalStatData: z.infer<typeof vitalStatSchema>) => {
      const res = await apiRequest("POST", "/api/vital-stats", vitalStatData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vital-stats"] });
      setIsAddDialogOpen(false);
      form.reset({
        pregnancyId: pregnancy?.id || 0,
        date: new Date().toISOString().split('T')[0],
      });
      toast({
        title: "Vital stats recorded",
        description: "Your health data has been successfully saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record vital stats",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof vitalStatSchema>) => {
    // Convert any empty strings to undefined
    const formattedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value === "") {
        acc[key] = undefined;
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    createVitalStatMutation.mutate({
      ...formattedData,
      pregnancyId: pregnancy?.id || 0,
    });
  };
  
  // Format data for charts
  const formatChartData = (stats: VitalStat[] = []) => {
    return stats
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(stat => ({
        date: formatDate(stat.date),
        weight: stat.weight ? stat.weight / 1000 : null, // Convert from g to kg
        systolic: stat.bloodPressureSystolic,
        diastolic: stat.bloodPressureDiastolic,
        fundalHeight: stat.fundalHeight,
      }));
  };
  
  const chartData = formatChartData(vitalStats);

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={user ? `${user.firstName} ${user.lastName}` : ""} />
      
      <div className="flex-grow flex">
        <Sidebar activePage="health-tracking" userRole={user?.role || "patient"} />
        
        <div className="flex-1 overflow-auto focus:outline-none pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-heading font-bold text-gray-900">Health Tracking</h1>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Record Vitals
              </Button>
            </div>
            
            <Tabs defaultValue="charts" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="charts">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weight Chart */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg font-medium">
                        <Weight className="h-5 w-5 mr-2 text-primary-500" />
                        Weight (kg)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="weight" 
                              stroke="#1976D2" 
                              strokeWidth={2} 
                              dot={{ r: 4 }} 
                              activeDot={{ r: 6 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Blood Pressure Chart */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg font-medium">
                        <Activity className="h-5 w-5 mr-2 text-primary-500" />
                        Blood Pressure (mmHg)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="systolic" 
                              name="Systolic" 
                              stroke="#1976D2" 
                              strokeWidth={2} 
                              dot={{ r: 4 }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="diastolic" 
                              name="Diastolic" 
                              stroke="#4CAF50" 
                              strokeWidth={2} 
                              dot={{ r: 4 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Fundal Height Chart */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-lg font-medium">
                        <Ruler className="h-5 w-5 mr-2 text-primary-500" />
                        Fundal Height (cm)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="fundalHeight" 
                              stroke="#FF9800" 
                              strokeWidth={2} 
                              dot={{ r: 4 }} 
                              activeDot={{ r: 6 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Vital Stats History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <p className="text-center py-4">Loading vital stats...</p>
                    ) : vitalStats?.length === 0 ? (
                      <div className="text-center py-12">
                        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No vital stats recorded</h3>
                        <p className="text-gray-500 mb-4">Add your first health data to begin tracking.</p>
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Record Vitals
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-3 text-left">Date</th>
                              <th className="py-3 text-right">Weight (kg)</th>
                              <th className="py-3 text-right">Blood Pressure</th>
                              <th className="py-3 text-right">Fundal Height (cm)</th>
                              <th className="py-3 text-left">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vitalStats?.sort((a, b) => 
                              new Date(b.date).getTime() - new Date(a.date).getTime()
                            ).map((stat) => (
                              <tr key={stat.id} className="border-b hover:bg-gray-50">
                                <td className="py-3">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    {formatDate(stat.date)}
                                  </div>
                                </td>
                                <td className="py-3 text-right">
                                  {stat.weight ? (stat.weight / 1000).toFixed(1) : '-'}
                                </td>
                                <td className="py-3 text-right">
                                  {stat.bloodPressureSystolic && stat.bloodPressureDiastolic 
                                    ? `${stat.bloodPressureSystolic}/${stat.bloodPressureDiastolic}` 
                                    : '-'}
                                </td>
                                <td className="py-3 text-right">
                                  {stat.fundalHeight || '-'}
                                </td>
                                <td className="py-3 text-left max-w-xs truncate">
                                  {stat.notes || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <MobileNavigation activePage="health-tracking" />
      
      {/* Add Vital Stats Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Vital Statistics</DialogTitle>
            <DialogDescription>
              Enter your latest health measurements. All fields are optional.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 65.5" 
                        step="0.1"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bloodPressureSystolic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Pressure (Systolic)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 120" 
                          {...field}
                          value={field.value === undefined ? "" : field.value}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bloodPressureDiastolic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Pressure (Diastolic)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 80" 
                          {...field}
                          value={field.value === undefined ? "" : field.value}
                          onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="fundalHeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fundal Height (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 24" 
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional notes about your health" 
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
                <Button type="submit" disabled={createVitalStatMutation.isPending}>
                  {createVitalStatMutation.isPending ? "Saving..." : "Save Vital Stats"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
