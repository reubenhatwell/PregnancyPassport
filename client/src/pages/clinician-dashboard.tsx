import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User, Pregnancy, Appointment, TestResult } from "@/types";
import { getStatusColor, formatDate } from "@/lib/utils";
import { Alert, AlertCircle, Calendar as CalendarIcon, ChevronRight, Clock, Filter, Plus, RefreshCw, Search, UserPlus } from "lucide-react";

// Dashboard components
import PatientList from "@/components/clinician/patient-list";
import UpcomingAppointments from "@/components/clinician/upcoming-appointments";
import AlertsNotifications from "@/components/clinician/alerts-notifications";
import AddPatientForm from "@/components/clinician/add-patient-form";
import PatientSearch from "@/components/clinician/patient-search";
import ClinicalSummary from "@/components/clinician/clinical-summary";

export default function ClinicianDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);
  const [appointmentView, setAppointmentView] = useState<"upcoming" | "calendar">("upcoming");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Query patients assigned to this clinician
  const { data: patients, isLoading: patientsLoading } = useQuery<User[]>({
    queryKey: ["/api/patients"],
    enabled: !!user && user.role === "clinician",
  });
  
  // Query urgent alerts for this clinician's patients
  const { data: alerts, isLoading: alertsLoading } = useQuery<any[]>({
    queryKey: ["/api/clinician/alerts"],
    enabled: !!user && user.role === "clinician",
  });
  
  // Query appointments for this clinician
  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/clinician/appointments"],
    enabled: !!user && user.role === "clinician",
  });
  
  // Query test results needing review
  const { data: pendingResults, isLoading: resultsLoading } = useQuery<TestResult[]>({
    queryKey: ["/api/clinician/test-results/pending"],
    enabled: !!user && user.role === "clinician",
  });
  
  const filteredPatients = patients?.filter(patient => {
    if (!patientSearchQuery) return true;
    
    const searchLower = patientSearchQuery.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.email.toLowerCase().includes(searchLower)
    );
  });

  if (!user || user.role !== "clinician") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header userName={user ? `${user.firstName} ${user.lastName}` : ""} />
        <div className="flex-grow flex">
          <Sidebar activePage="dashboard" userRole="clinician" />
          <div className="flex-1 p-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold">Access Restricted</h2>
                  <p className="text-gray-500 mt-2">
                    This dashboard is only available to clinician users.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={user ? `${user.firstName} ${user.lastName}` : ""} />
      
      <div className="flex-grow flex">
        <Sidebar activePage="clinician-dashboard" userRole="clinician" />
        
        <div className="flex-1 overflow-auto pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-900">Clinician Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Manage your patients, appointments, and clinical tasks
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Dialog open={isAddingPatient} onOpenChange={setIsAddingPatient}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add New Patient
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Add New Patient</DialogTitle>
                      <DialogDescription>
                        Create a new patient record and pregnancy record.
                      </DialogDescription>
                    </DialogHeader>
                    <AddPatientForm onSuccess={() => setIsAddingPatient(false)} />
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="patients">Patient Management</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="clinical">Clinical Tools</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Alerts and Notifications */}
                  <Card className="md:col-span-3">
                    <CardHeader className="bg-red-50 border-b border-red-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                          <CardTitle className="text-red-700">Alerts & Urgent Items</CardTitle>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {alertsLoading ? "Loading..." : alerts?.length || 0} items
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {alertsLoading ? (
                        <div className="text-center py-4">Loading alerts...</div>
                      ) : alerts?.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No urgent alerts at this time</div>
                      ) : (
                        <ul className="space-y-3">
                          {alerts && alerts.slice(0, 4).map((alert, index) => (
                            <li key={index} className="flex items-start p-3 rounded-md bg-red-50 border border-red-100">
                              <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900">{alert.title}</p>
                                <p className="text-sm text-gray-700">{alert.description}</p>
                                <div className="flex items-center mt-1 space-x-3">
                                  <Badge variant="secondary" className="text-xs">
                                    {alert.patientName}
                                  </Badge>
                                  <p className="text-xs text-gray-500">{alert.date}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="link" className="ml-auto">
                                View
                              </Button>
                            </li>
                          ))}
                          
                          {alerts && alerts.length > 4 && (
                            <Button variant="link" className="w-full text-center mt-2">
                              View all {alerts.length} alerts
                            </Button>
                          )}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Today's Appointments */}
                  <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xl">Today's Appointments</CardTitle>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Calendar className="h-4 w-4" />
                        View Calendar
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {appointmentsLoading ? (
                        <div className="text-center py-4">Loading appointments...</div>
                      ) : appointments?.filter(appt => {
                          const today = new Date();
                          const apptDate = new Date(appt.dateTime);
                          return (
                            apptDate.getDate() === today.getDate() &&
                            apptDate.getMonth() === today.getMonth() &&
                            apptDate.getFullYear() === today.getFullYear()
                          );
                        }).length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No appointments scheduled for today</div>
                      ) : (
                        <div className="space-y-4">
                          {appointments?.filter(appt => {
                            const today = new Date();
                            const apptDate = new Date(appt.dateTime);
                            return (
                              apptDate.getDate() === today.getDate() &&
                              apptDate.getMonth() === today.getMonth() &&
                              apptDate.getFullYear() === today.getFullYear()
                            );
                          }).map((appointment, index) => (
                            <div key={index} className="flex items-center p-3 rounded-lg border hover:bg-gray-50">
                              <div className="bg-primary-100 text-primary-800 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                                <Clock className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">Jane Doe</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>{new Date(appointment.dateTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                                  <span>{appointment.title}</span>
                                </div>
                              </div>
                              <Button size="sm">View Details</Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Pending Test Results */}
                  <Card className="md:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-xl">Pending Reviews</CardTitle>
                      <CardDescription>
                        Test results awaiting your review
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {resultsLoading ? (
                        <div className="text-center py-4">Loading results...</div>
                      ) : pendingResults?.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No pending results</div>
                      ) : (
                        <div className="space-y-3">
                          {pendingResults?.slice(0, 5).map((result, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div>
                                <p className="font-medium">{result.title}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span>Patient: Jane Doe</span>
                                  <span>•</span>
                                  <span>{formatDate(result.date)}</span>
                                </div>
                              </div>
                              <Badge className={getStatusColor(result.status)}>
                                {result.status}
                              </Badge>
                            </div>
                          ))}
                          
                          {pendingResults && pendingResults.length > 5 && (
                            <Button variant="link" className="w-full text-center mt-2">
                              View all {pendingResults.length} results
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Recent Patients */}
                  <Card className="md:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xl">Recent Patients</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("patients")}>
                        View All Patients
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patient Name</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Weeks</TableHead>
                              <TableHead>Last Appointment</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {patientsLoading ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center">Loading patients...</TableCell>
                              </TableRow>
                            ) : filteredPatients?.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center">No patients found</TableCell>
                              </TableRow>
                            ) : (
                              filteredPatients?.slice(0, 5).map((patient, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{patient.firstName} {patient.lastName}</TableCell>
                                  <TableCell>15 Aug 2025</TableCell>
                                  <TableCell>28</TableCell>
                                  <TableCell>28 Apr 2025</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      Normal
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button size="sm" variant="outline">View Record</Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Patient Management Tab */}
              <TabsContent value="patients">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle>Patient Management</CardTitle>
                        <div className="flex flex-col md:flex-row gap-3">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                              type="search" 
                              placeholder="Search patients..."
                              className="pl-9 w-full md:w-[300px]"
                              value={patientSearchQuery}
                              onChange={(e) => setPatientSearchQuery(e.target.value)}
                            />
                          </div>
                          
                          <Select value={selectedStatusFilter || ""} onValueChange={setSelectedStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                              <div className="flex items-center">
                                <Filter className="mr-2 h-4 w-4" />
                                {selectedStatusFilter || "Filter by Status"}
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">All</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="follow_up">Follow-up</SelectItem>
                              <SelectItem value="high_risk">High Risk</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Add New Patient
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[550px]">
                              <DialogHeader>
                                <DialogTitle>Add New Patient</DialogTitle>
                                <DialogDescription>
                                  Create a new patient record and pregnancy record.
                                </DialogDescription>
                              </DialogHeader>
                              <AddPatientForm onSuccess={() => {}} />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patient Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Weeks</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {patientsLoading ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center">Loading patients...</TableCell>
                              </TableRow>
                            ) : filteredPatients?.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center">No patients found</TableCell>
                              </TableRow>
                            ) : (
                              filteredPatients?.map((patient, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{patient.firstName} {patient.lastName}</TableCell>
                                  <TableCell>{patient.email}</TableCell>
                                  <TableCell>15 Aug 2025</TableCell>
                                  <TableCell>28</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      Normal
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button size="sm" variant="outline">View Record</Button>
                                      <Button size="sm" variant="outline">
                                        <ChevronRight className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Patient Assignment</CardTitle>
                      <CardDescription>
                        Manage patient assignments between clinicians
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <Label>Patient</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select patient" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Sarah Johnson</SelectItem>
                                <SelectItem value="2">Emily Williams</SelectItem>
                                <SelectItem value="3">Jessica Taylor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex-1">
                            <Label>Assign To</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select clinician" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Dr. Jane Smith</SelectItem>
                                <SelectItem value="2">Dr. Michael Chen</SelectItem>
                                <SelectItem value="3">Midwife Emma Roberts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-end">
                            <Button>Assign</Button>
                          </div>
                        </div>
                        
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Current Clinician</TableHead>
                                <TableHead>Assigned Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">Sarah Johnson</TableCell>
                                <TableCell>Dr. Jane Smith</TableCell>
                                <TableCell>15 Jan 2025</TableCell>
                                <TableCell className="text-right">
                                  <Button size="sm" variant="outline">Reassign</Button>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Emily Williams</TableCell>
                                <TableCell>Dr. Michael Chen</TableCell>
                                <TableCell>03 Feb 2025</TableCell>
                                <TableCell className="text-right">
                                  <Button size="sm" variant="outline">Reassign</Button>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Appointments Tab */}
              <TabsContent value="appointments">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle>Appointment Management</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant={appointmentView === "upcoming" ? "default" : "outline"} 
                            onClick={() => setAppointmentView("upcoming")}
                          >
                            List View
                          </Button>
                          <Button 
                            variant={appointmentView === "calendar" ? "default" : "outline"} 
                            onClick={() => setAppointmentView("calendar")}
                          >
                            Calendar View
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {appointmentView === "upcoming" ? (
                        <>
                          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
                            <div className="flex-1">
                              <Label>Patient</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="All patients" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All patients</SelectItem>
                                  <SelectItem value="1">Sarah Johnson</SelectItem>
                                  <SelectItem value="2">Emily Williams</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Date Range</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-[240px] flex items-center justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? formatDate(selectedDate.toISOString()) : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div>
                              <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Appointment
                              </Button>
                            </div>
                          </div>
                          
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Patient</TableHead>
                                  <TableHead>Date & Time</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Duration</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {appointmentsLoading ? (
                                  <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading appointments...</TableCell>
                                  </TableRow>
                                ) : appointments?.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={6} className="text-center">No appointments found</TableCell>
                                  </TableRow>
                                ) : (
                                  appointments?.map((appointment, index) => (
                                    <TableRow key={index}>
                                      <TableCell className="font-medium">Sarah Johnson</TableCell>
                                      <TableCell>
                                        {new Date(appointment.dateTime).toLocaleDateString()} at {' '}
                                        {new Date(appointment.dateTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                      </TableCell>
                                      <TableCell>{appointment.title}</TableCell>
                                      <TableCell>{appointment.duration} mins</TableCell>
                                      <TableCell>
                                        <Badge variant={appointment.completed ? "secondary" : "default"}>
                                          {appointment.completed ? "Completed" : "Scheduled"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                          <Button size="sm" variant="outline">Edit</Button>
                                          <Button size="sm" variant="outline">Cancel</Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </>
                      ) : (
                        <div className="p-6 text-center border rounded-md">
                          <h3 className="font-medium text-lg mb-2">Calendar View</h3>
                          <p className="text-gray-500">
                            Calendar integration will be available in the next version.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Clinical Tools Tab */}
              <TabsContent value="clinical">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Assessment Tools</CardTitle>
                      <CardDescription>
                        Evaluate potential risks in pregnancy
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Pre-eclampsia Risk Calculator</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Calculate pre-eclampsia risk based on maternal factors
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Gestational Diabetes Assessment</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Evaluate risk factors for gestational diabetes
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Preterm Labor Risk Evaluation</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Calculate risk of preterm labor
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Customized Growth Chart</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Generate customized fetal growth charts
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Clinical Guidelines</CardTitle>
                      <CardDescription>
                        Access evidence-based practice guidelines
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Antenatal Care Protocol</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Standard guidelines for routine antenatal care
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Hypertension in Pregnancy</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Guidelines for managing hypertensive disorders
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Gestational Diabetes Management</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Treatment protocols for gestational diabetes
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Management of Preterm Labor</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Clinical guidelines for preterm labor
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Documentation Templates</CardTitle>
                      <CardDescription>
                        Standardized templates for clinical documentation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Initial Antenatal Assessment</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Template for first antenatal visit
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Routine Follow-up Visit</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Template for standard follow-up visits
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Referral Letter</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Template for specialist referrals
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Birth Plan Discussion</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Template for birth planning consultation
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Clinical Reporting</CardTitle>
                      <CardDescription>
                        Generate clinical reports and statistics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Patient Summary Report</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Generate comprehensive patient summary
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Outcome Statistics</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Reports on clinical outcomes and statistics
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Test Results Summary</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Comprehensive test results report
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                          <h3 className="font-medium text-lg">Care Plan Documentation</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Generate care plan documentation
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}