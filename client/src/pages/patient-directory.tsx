import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  User,
  Pregnancy,
  Appointment
} from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronRight, 
  Filter, 
  Search, 
  UserPlus,
  Calendar,
  Clock,
  AlertTriangle,
  RefreshCcw,
  UserCircle2,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PatientDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState<string>("lastName"); // Default sort by last name
  const [trimesterFilter, setTrimesterFilter] = useState<string>("all");
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Fetch the patients from the API
  const { data: patients, isLoading, refetch } = useQuery<User[]>({
    queryKey: ["/api/patients"],
  });
  
  // Get upcoming appointments
  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/clinician/appointments"],
  });

  // Get pregnancies for trimester filtering
  const { data: pregnancies } = useQuery<Pregnancy[]>({
    queryKey: ["/api/pregnancies/all"],
    // This endpoint might need to be implemented to fetch all pregnancies
  });
  
  // Effect to update filtered patients whenever primary data changes
  useEffect(() => {
    if (!patients) return;
    
    let result = [...patients];
    
    // Apply trimester filter if not 'all'
    if (trimesterFilter !== 'all' && pregnancies) {
      const trimesterWeeks = {
        first: { min: 1, max: 12 },
        second: { min: 13, max: 26 },
        third: { min: 27, max: 42 }
      };
      
      result = result.filter(patient => {
        const pregnancy = pregnancies.find(p => p.patientId === patient.id);
        if (!pregnancy) return false;
        
        // Calculate current week based on start date
        const startDate = new Date(pregnancy.startDate);
        const currentDate = new Date();
        const weeksDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        if (trimesterFilter === 'first') {
          return weeksDiff >= trimesterWeeks.first.min && weeksDiff <= trimesterWeeks.first.max;
        } else if (trimesterFilter === 'second') {
          return weeksDiff >= trimesterWeeks.second.min && weeksDiff <= trimesterWeeks.second.max;
        } else {
          return weeksDiff >= trimesterWeeks.third.min && weeksDiff <= trimesterWeeks.third.max;
        }
      });
    }
    
    // Apply search filter if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(patient => 
        patient.firstName.toLowerCase().includes(query) ||
        patient.lastName.toLowerCase().includes(query) ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result = sortPatients(result, sortBy);
    
    setFilteredPatients(result);
  }, [patients, searchQuery, sortBy, trimesterFilter, pregnancies]);
  
  // Function to sort patients
  const sortPatients = (patientsList: User[], sortCriteria: string): User[] => {
    return [...patientsList].sort((a, b) => {
      switch (sortCriteria) {
        case "lastName":
          return a.lastName.localeCompare(b.lastName);
        case "firstName":
          return a.firstName.localeCompare(b.firstName);
        case "appointmentDate":
          // Sort by upcoming appointment date if available
          const aAppt = getNextAppointmentDate(a.id);
          const bAppt = getNextAppointmentDate(b.id);
          if (!aAppt) return 1;
          if (!bAppt) return -1;
          return new Date(aAppt).getTime() - new Date(bAppt).getTime();
        default:
          return a.lastName.localeCompare(b.lastName);
      }
    });
  };
  
  // Function to get next appointment date for a patient
  const getNextAppointmentDate = (patientId: number): string | null => {
    if (!appointments) return null;
    
    const patientAppointments = appointments
      .filter(appt => {
        // This assumes appointments have a relation to patients
        // You might need to adjust this based on your data structure
        return appt.pregnancyId === patientId || 
               (pregnancies?.find(p => p.id === appt.pregnancyId)?.patientId === patientId);
      })
      .filter(appt => new Date(appt.dateTime) > new Date())
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    
    return patientAppointments.length > 0 ? patientAppointments[0].dateTime : null;
  };

  // Function to format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get formatted time from date string
  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return '';
    }
  };
  
  // Handle selecting a patient
  const handlePatientSelect = (patientId: number) => {
    // Navigate to patient profile or clinician dashboard for that patient
    setLocation(`/clinician-dashboard/${patientId}`);
  };
  
  // Handle adding a new patient
  const handleAddPatient = () => {
    // Navigate to add patient form or open modal
    setLocation('/clinician-dashboard?addPatient=true');
  };
  
  // Calculate pregnancy trimester (in a real app this would use actual pregnancy data)
  const getTrimester = (patientId: number): string => {
    if (!pregnancies) return "Unknown";
    
    const pregnancy = pregnancies.find(p => p.patientId === patientId);
    if (!pregnancy) return "Unknown";
    
    // Calculate weeks based on start date
    const startDate = new Date(pregnancy.startDate);
    const currentDate = new Date();
    const weeksDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (weeksDiff < 13) return "First";
    if (weeksDiff < 27) return "Second";
    return "Third";
  };
  
  // Check if patient has alerts (for demo purposes)
  const hasAlerts = (patientId: number): boolean => {
    // In a real app, this would check actual alerts
    // This is just a demo implementation
    if (!appointments) return false;
    
    // Check for missed appointments
    const missedAppointments = appointments.filter(appt => {
      const isPatientAppointment = appt.pregnancyId === patientId || 
                                  (pregnancies?.find(p => p.id === appt.pregnancyId)?.patientId === patientId);
      const appointmentDate = new Date(appt.dateTime);
      const today = new Date();
      
      return isPatientAppointment && 
             appointmentDate < today && 
             !appt.completed;
    });
    
    return missedAppointments.length > 0;
  };
  
  const { logoutMutation } = useAuth();
  
  const handleSignOut = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        {/* Header and Greeting with Sign Out Button */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-heading font-semibold text-primary">Patient Directory</h1>
            <p className="text-foreground/70">
              {user && `Welcome, ${user.firstName}. You have ${filteredPatients.length} patients in your care.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open('mailto:support@mypregnancypassport.com', '_blank')}
              className="flex items-center gap-2 text-gray-600 hover:text-pink-500"
            >
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="flex items-center gap-2 border-pink-200 hover:bg-pink-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sign Out
            </Button>
          </div>
        </div>
        <Separator className="bg-primary/10" />
        
        {/* Search and Filter Controls */}
        <Card className="bg-card">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-foreground/50" />
                <Input
                  type="search"
                  placeholder="Search patient by name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={trimesterFilter} onValueChange={setTrimesterFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by trimester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Trimesters</SelectItem>
                    <SelectItem value="first">First Trimester</SelectItem>
                    <SelectItem value="second">Second Trimester</SelectItem>
                    <SelectItem value="third">Third Trimester</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastName">Last Name</SelectItem>
                    <SelectItem value="firstName">First Name</SelectItem>
                    <SelectItem value="appointmentDate">Next Appointment</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon" onClick={() => refetch()} className="h-10 w-10">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                
                <Button onClick={handleAddPatient} className="bg-primary hover:bg-primary/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Patient
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Patient List */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Patient List</CardTitle>
            <CardDescription>
              {isLoading ? "Loading patients..." : `Displaying ${filteredPatients.length} patients`}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-foreground/70">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8 bg-secondary/10 rounded-lg border border-secondary/20">
                <p className="text-foreground/70 mb-3">
                  {searchQuery ? "No patients match your search criteria" : "No patients found in your care"}
                </p>
                <Button className="mt-2 bg-primary/90 hover:bg-primary" onClick={handleAddPatient}>
                  Add New Patient
                </Button>
              </div>
            ) : (
              <ScrollArea className="max-h-[60vh]">
                <div className="divide-y divide-primary/10">
                  {filteredPatients.map(patient => {
                    const nextAppointment = getNextAppointmentDate(patient.id);
                    return (
                      <div 
                        key={patient.id}
                        className="py-4 px-4 hover:bg-secondary/10 transition-colors duration-200 cursor-pointer rounded-lg my-1"
                        onClick={() => handlePatientSelect(patient.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <UserCircle2 className="h-6 w-6 text-primary" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-medium text-foreground">
                                    {patient.lastName}, {patient.firstName}
                                  </h3>
                                  {hasAlerts(patient.id) && (
                                    <Badge variant="destructive" className="ml-2">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Alert
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-foreground/60 mt-1">
                                  Patient ID: {patient.id} | {patient.email}
                                </p>
                              </div>
                              
                              <div className="flex items-center bg-primary/5 px-3 py-1 rounded-full">
                                <span className="text-sm font-medium text-primary">{getTrimester(patient.id)} Trimester</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex flex-wrap gap-4">
                              {nextAppointment && (
                                <div className="flex items-center text-sm text-foreground/70 bg-secondary/10 px-3 py-1 rounded-full">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                  <span>{formatDate(nextAppointment)}</span>
                                  <span className="mx-1">•</span>
                                  <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                  <span>{formatTime(nextAppointment)}</span>
                                </div>
                              )}
                              
                              <div className="ml-auto">
                                <ChevronRight className="h-5 w-5 text-foreground/40" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
          
          <CardFooter className="border-t border-primary/10 py-3 px-6">
            <div className="flex justify-between w-full text-sm text-foreground/60">
              <span>Total patients: {patients?.length || 0}</span>
              <span>Filtered patients: {filteredPatients.length}</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}