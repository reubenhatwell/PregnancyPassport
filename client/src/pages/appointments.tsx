import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Appointment } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CalendarClock, MapPin, Edit, Map, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  clinicianName: z.string().optional(),
  dateTime: z.string().min(1, "Date and time are required"),
  duration: z.number().min(5, "Duration must be at least 5 minutes").default(30),
  pregnancyId: z.number(),
});

export default function Appointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Fetch pregnancy data for pregnancyId
  const { data: pregnancy } = useQuery({
    queryKey: ["/api/pregnancy"],
  });
  
  // Fetch appointments
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: !!pregnancy,
  });
  
  // Form for new appointments
  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      clinicianName: "",
      dateTime: new Date().toISOString().substring(0, 16),
      duration: 30,
      pregnancyId: pregnancy?.id || 0,
    },
  });
  
  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: z.infer<typeof appointmentSchema>) => {
      const res = await apiRequest("POST", "/api/appointments", appointmentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Appointment created",
        description: "Your appointment has been successfully scheduled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment deleted",
        description: "The appointment has been removed from your schedule.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof appointmentSchema>) => {
    createAppointmentMutation.mutate({
      ...data,
      pregnancyId: pregnancy?.id || 0,
    });
  };
  
  // Group appointments by month
  const groupedAppointments = (appointments || []).reduce((acc, appointment) => {
    const date = new Date(appointment.dateTime);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    
    acc[monthYear].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);
  
  // Sort appointments by date
  Object.keys(groupedAppointments).forEach(month => {
    groupedAppointments[month].sort((a, b) => 
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
  });
  
  // Sort months chronologically
  const sortedMonths = Object.keys(groupedAppointments).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={user ? `${user.firstName} ${user.lastName}` : ""} />
      
      <div className="flex-grow flex">
        <Sidebar activePage="appointments" userRole={user?.role || "patient"} />
        
        <div className="flex-1 overflow-auto focus:outline-none pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-heading font-bold text-gray-900">Appointments</h1>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading appointments...</p>
              </div>
            ) : appointments?.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-10">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
                  <p className="text-gray-500 mb-4">Schedule your first appointment to get started.</p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {sortedMonths.map(month => (
                  <div key={month}>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">{month}</h2>
                    <div className="space-y-3">
                      {groupedAppointments[month].map(appointment => (
                        <Card key={appointment.id} className="overflow-hidden">
                          <div className={`h-1 ${new Date(appointment.dateTime) > new Date() ? "bg-primary-500" : "bg-gray-300"}`}></div>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <CalendarClock className="h-4 w-4 mr-1 flex-shrink-0" />
                                  <span>{formatDateTime(appointment.dateTime)} ({appointment.duration} mins)</span>
                                </div>
                                {appointment.location && (
                                  <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                    <span>{appointment.location}</span>
                                  </div>
                                )}
                                {appointment.clinicianName && (
                                  <div className="text-sm text-gray-600 mt-1 ml-5">
                                    With {appointment.clinicianName}
                                  </div>
                                )}
                                {appointment.description && (
                                  <p className="text-sm text-gray-600 mt-2">{appointment.description}</p>
                                )}
                              </div>
                              <div className="flex mt-3 md:mt-0 space-x-2">
                                <Button size="sm" variant="outline" className="h-8">
                                  <Edit className="h-3.5 w-3.5 mr-1" />
                                  Reschedule
                                </Button>
                                <Button size="sm" variant="outline" className="h-8">
                                  <Map className="h-3.5 w-3.5 mr-1" />
                                  Directions
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <MobileNavigation activePage="appointments" />
      
      {/* Add Appointment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Enter the details for your upcoming appointment.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 28-Week Ultrasound" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="5" 
                          step="5" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clinicianName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinician Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Emily Chen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City Maternity Hospital" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any specific preparations or notes for this appointment" 
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
                <Button type="submit" disabled={createAppointmentMutation.isPending}>
                  {createAppointmentMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
