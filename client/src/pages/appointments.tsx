import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Appointment } from "@/types";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
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
import { Calendar as CalendarIcon, CalendarClock, MapPin, Edit, Map, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, parseISO, formatISO, addMinutes } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';

// Set up the localizer for the calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [calendarView, setCalendarView] = useState<"list" | "calendar">("calendar");
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Function to determine if user is a clinician
  const isClinician = user?.role === "clinician" || user?.role === "admin";
  
  // Fetch pregnancy data for pregnancyId
  const { data: pregnancy } = useQuery({
    queryKey: ["/api/pregnancy"],
  });
  
  // Fetch appointments
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: !!pregnancy,
  });
  
  // Transform appointments for calendar view
  const calendarEvents = (appointments || []).map(appointment => ({
    id: appointment.id,
    title: appointment.title,
    start: new Date(appointment.dateTime),
    end: addMinutes(new Date(appointment.dateTime), appointment.duration || 30),
    resource: appointment
  }));
  
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
  
  // Form for editing appointments
  const editForm = useForm<z.infer<typeof appointmentSchema>>({
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
  
  // Update edit form when an appointment is selected
  useEffect(() => {
    if (selectedAppointment) {
      editForm.reset({
        title: selectedAppointment.title,
        description: selectedAppointment.description || "",
        location: selectedAppointment.location || "",
        clinicianName: selectedAppointment.clinicianName || "",
        dateTime: new Date(selectedAppointment.dateTime).toISOString().substring(0, 16),
        duration: selectedAppointment.duration || 30,
        pregnancyId: selectedAppointment.pregnancyId,
      });
    }
  }, [selectedAppointment, editForm]);
  
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
  
  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof appointmentSchema> }) => {
      const res = await apiRequest("PATCH", `/api/appointments/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsEditDialogOpen(false);
      setSelectedAppointment(null);
      toast({
        title: "Appointment updated",
        description: "The appointment has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update appointment",
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
      setIsEditDialogOpen(false);
      setSelectedAppointment(null);
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
  
  const onEditSubmit = (data: z.infer<typeof appointmentSchema>) => {
    if (selectedAppointment) {
      updateAppointmentMutation.mutate({
        id: selectedAppointment.id,
        data: {
          ...data,
          pregnancyId: selectedAppointment.pregnancyId,
        },
      });
    }
  };
  
  const handleSelectEvent = (event: any) => {
    setSelectedAppointment(event.resource);
    if (isClinician) {
      setIsEditDialogOpen(true);
    }
  };
  
  const handleSelectSlot = ({ start }: { start: Date }) => {
    if (isClinician) {
      form.setValue('dateTime', start.toISOString().substring(0, 16));
      setIsAddDialogOpen(true);
    }
  };
  
  // Group appointments by month for list view
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
              {isClinician && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              )}
            </div>
            
            <Tabs defaultValue="calendar" className="mb-6">
              <TabsList className="mb-6">
                <TabsTrigger 
                  value="calendar" 
                  onClick={() => setCalendarView("calendar")}
                  className="px-4 py-2"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Calendar View
                </TabsTrigger>
                <TabsTrigger 
                  value="list" 
                  onClick={() => setCalendarView("list")}
                  className="px-4 py-2"
                >
                  <CalendarClock className="h-4 w-4 mr-2" />
                  List View
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="calendar" className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p>Loading calendar...</p>
                  </div>
                ) : (
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="calendar-wrapper">
                        <Calendar
                          localizer={localizer}
                          events={calendarEvents}
                          startAccessor="start"
                          endAccessor="end"
                          onSelectEvent={handleSelectEvent}
                          onSelectSlot={handleSelectSlot}
                          selectable={isClinician}
                          date={calendarDate}
                          onNavigate={setCalendarDate}
                          style={{ height: 700 }}
                          eventPropGetter={(event) => {
                            const isPast = new Date(event.start) < new Date();
                            const appointment = event.resource;
                            
                            // Color-code appointments based on type and status
                            let backgroundColor = '#7c3aed'; // Default violet/purple
                            
                            if (isPast) {
                              backgroundColor = '#9CA3AF'; // Gray for past appointments
                            } else if (appointment.type === 'ultrasound') {
                              backgroundColor = '#3b82f6'; // Blue for ultrasounds
                            } else if (appointment.type === 'checkup') {
                              backgroundColor = '#059669'; // Green for regular checkups
                            } else if (appointment.type === 'test') {
                              backgroundColor = '#f59e0b'; // Amber for tests
                            } else if (appointment.status === 'cancelled') {
                              backgroundColor = '#6b7280'; // Gray for cancelled
                            } else if (appointment.status === 'confirmed') {
                              backgroundColor = '#7c3aed'; // Vibrant purple for confirmed
                            } else if (appointment.status === 'rescheduled') {
                              backgroundColor = '#e11d48'; // Red for rescheduled
                            }
                            
                            return {
                              className: '',
                              style: {
                                backgroundColor,
                                color: 'white',
                                borderRadius: '4px',
                                border: 'none',
                                padding: '2px 6px',
                                fontWeight: '500',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                              }
                            };
                          }}
                          components={{
                            toolbar: (props) => (
                              <div className="flex justify-between items-center p-4 border-b">
                                <div>
                                  <Button variant="outline" onClick={() => props.onNavigate('TODAY')}>
                                    Today
                                  </Button>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost" 
                                    onClick={() => props.onNavigate('PREV')}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
                                  </Button>
                                  <span className="text-lg font-medium">
                                    {format(props.date, 'MMMM yyyy')}
                                  </span>
                                  <Button
                                    variant="ghost" 
                                    onClick={() => props.onNavigate('NEXT')}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
                                  </Button>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline"
                                    size="sm"
                                    onClick={() => props.onView('month')}
                                    className={props.view === 'month' ? 'bg-primary-50 text-primary-600' : ''}
                                  >
                                    Month
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    size="sm"
                                    onClick={() => props.onView('week')}
                                    className={props.view === 'week' ? 'bg-primary-50 text-primary-600' : ''}
                                  >
                                    Week
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    size="sm"
                                    onClick={() => props.onView('day')}
                                    className={props.view === 'day' ? 'bg-primary-50 text-primary-600' : ''}
                                  >
                                    Day
                                  </Button>
                                </div>
                              </div>
                            ),
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="list">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p>Loading appointments...</p>
                  </div>
                ) : appointments?.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center py-10">
                      <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
                      <p className="text-gray-500 mb-4">Schedule your first appointment to get started.</p>
                      {isClinician && (
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Schedule Appointment
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    {sortedMonths.map(month => (
                      <div key={month}>
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">{month}</h2>
                        <div className="space-y-3">
                          {groupedAppointments[month].map(appointment => {
                            // Color based on appointment type
                            let colorClass = "bg-primary";
                            if (new Date(appointment.dateTime) < new Date()) {
                              colorClass = "bg-gray-400";
                            }
                            
                            return (
                              <Card key={appointment.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
                                <div className={`h-2 ${colorClass}`}></div>
                                <CardContent className="p-4 bg-gradient-to-b from-white to-slate-50">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${colorClass} text-white`}>
                                          {new Date(appointment.dateTime) < new Date() ? "Past" : "Upcoming"}
                                        </span>
                                      </div>
                                      
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
                                      {isClinician && (
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-8"
                                          onClick={() => {
                                            setSelectedAppointment(appointment);
                                            setIsEditDialogOpen(true);
                                          }}
                                        >
                                          <Edit className="h-3.5 w-3.5 mr-1" />
                                          Edit
                                        </Button>
                                      )}
                                      
                                      {appointment.location && (
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-8"
                                          onClick={() => {
                                            if (appointment.location) {
                                              window.open(`https://maps.google.com?q=${encodeURIComponent(appointment.location)}`, '_blank');
                                            }
                                          }}
                                        >
                                          <Map className="h-3.5 w-3.5 mr-1" />
                                          Directions
                                        </Button>
                                      )}
                                      
                                      {isClinician && (
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
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
      
      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update the details for this appointment.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
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
                control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
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
              
              <DialogFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={() => {
                    if (selectedAppointment) {
                      deleteAppointmentMutation.mutate(selectedAppointment.id);
                    }
                  }}
                  disabled={deleteAppointmentMutation.isPending}
                >
                  {deleteAppointmentMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateAppointmentMutation.isPending}>
                    {updateAppointmentMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
