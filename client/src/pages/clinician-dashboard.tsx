import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { User } from "@/types";
import { 
  Calendar,
  ClipboardList, 
  FilePlus, 
  Home, 
  LayoutDashboard, 
  LineChart, 
  MessageSquare, 
  Settings, 
  Users, 
  AlertCircle 
} from "lucide-react";

// Import clinician components
import PatientList from "@/components/clinician/patient-list";
import UpcomingAppointments from "@/components/clinician/upcoming-appointments";
import AlertsNotifications from "@/components/clinician/alerts-notifications";
import AddPatientForm from "@/components/clinician/add-patient-form";
import PatientSearch from "@/components/clinician/patient-search";
import ClinicalSummary from "@/components/clinician/clinical-summary";
import ClinicalDecisionSupport from "@/components/clinician/clinical-decision-support";
import DocumentationTemplates from "@/components/clinician/documentation-templates";

export default function ClinicianDashboard(props: { params?: { patientId?: string } }) {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    props.params?.patientId ? parseInt(props.params.patientId) : null
  );
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [showPatientDetail, setShowPatientDetail] = useState(!!props.params?.patientId);
  
  // Get current clinician (user must be logged in as clinician to access this page)
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });
  
  // Get clinician statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/clinician/statistics"],
    retry: false,
  });
  
  // Get selected patient data
  const { data: selectedPatient } = useQuery<User>({
    queryKey: ["/api/patients", selectedPatientId],
    enabled: !!selectedPatientId,
  });
  
  // Check if query params contain 'addPatient' trigger
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldAddPatient = params.get("addPatient");
    
    if (shouldAddPatient === "true") {
      setShowAddPatientDialog(true);
    }
  }, []);
  
  // Handle patient selection
  const handlePatientSelect = (patientId: number) => {
    setSelectedPatientId(patientId);
    setShowPatientDetail(true);
  };
  
  // Handle opening the add patient dialog
  const handleAddPatient = () => {
    setShowAddPatientDialog(true);
  };
  
  // Handle closing the add patient dialog
  const handleCloseAddPatientDialog = () => {
    setShowAddPatientDialog(false);
  };
  
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-16 md:w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-center md:text-left">
            <span className="hidden md:inline">NSW Antenatal</span>
            <span className="md:hidden">NSW</span>
          </h1>
        </div>
        
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            <Button 
              variant={selectedTab === "dashboard" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab("dashboard")}
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              <span className="hidden md:inline">Dashboard</span>
            </Button>
            
            <Button 
              variant={selectedTab === "patients" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab("patients")}
            >
              <Users className="h-5 w-5 mr-2" />
              <span className="hidden md:inline">Patients</span>
            </Button>
            
            <Button 
              variant={selectedTab === "appointments" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab("appointments")}
            >
              <Calendar className="h-5 w-5 mr-2" />
              <span className="hidden md:inline">Appointments</span>
            </Button>
            
            <Button 
              variant={selectedTab === "clinical-support" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab("clinical-support")}
            >
              <LineChart className="h-5 w-5 mr-2" />
              <span className="hidden md:inline">Clinical Support</span>
            </Button>
            
            <Button 
              variant={selectedTab === "documents" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab("documents")}
            >
              <ClipboardList className="h-5 w-5 mr-2" />
              <span className="hidden md:inline">Documentation</span>
            </Button>
            
            <Button 
              variant={selectedTab === "messages" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab("messages")}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              <span className="hidden md:inline">Messages</span>
            </Button>
            
            <Button 
              variant={selectedTab === "settings" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setSelectedTab("settings")}
            >
              <Settings className="h-5 w-5 mr-2" />
              <span className="hidden md:inline">Settings</span>
            </Button>
          </nav>
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="font-semibold text-primary-800">
                {user?.firstName?.charAt(0) || "U"}
              </span>
            </div>
            <div className="ml-3 hidden md:block">
              <p className="text-sm font-medium">Dr. {user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">Clinician</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          <TabsContent value="dashboard" className={selectedTab === "dashboard" ? "block" : "hidden"}>
            <h1 className="text-2xl font-bold mb-6">Clinician Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.patientCount || "15"}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Today's Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.appointmentsToday || "3"}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Pending Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pendingTestResults || "4"}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">New Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.alertsCount || "2"}</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <PatientList 
                  onPatientSelect={handlePatientSelect} 
                  onAddPatient={handleAddPatient}
                  limit={5}
                />
                
                <UpcomingAppointments 
                  limit={5}
                  onViewAppointment={(id) => console.log("View appointment:", id)}
                />
              </div>
              
              <div className="space-y-6">
                <AlertsNotifications 
                  onViewAlert={(id) => console.log("View alert:", id)}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Patients by Trimester</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="bg-blue-100 h-4 rounded" style={{width: `${(stats?.patientsByTrimester?.first / stats?.patientCount * 100) || 25}%`}} />
                        <span className="ml-2 text-sm">First: {stats?.patientsByTrimester?.first || 4}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-green-100 h-4 rounded" style={{width: `${(stats?.patientsByTrimester?.second / stats?.patientCount * 100) || 45}%`}} />
                        <span className="ml-2 text-sm">Second: {stats?.patientsByTrimester?.second || 7}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-purple-100 h-4 rounded" style={{width: `${(stats?.patientsByTrimester?.third / stats?.patientCount * 100) || 25}%`}} />
                        <span className="ml-2 text-sm">Third: {stats?.patientsByTrimester?.third || 4}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="patients" className={selectedTab === "patients" ? "block" : "hidden"}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Patient Management</h1>
              <Button onClick={handleAddPatient}>
                <FilePlus className="h-4 w-4 mr-2" />
                Add New Patient
              </Button>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <PatientSearch 
                    onSelectPatient={handlePatientSelect}
                    onAddPatient={handleAddPatient}
                  />
                </CardContent>
              </Card>
              
              <PatientList 
                onPatientSelect={handlePatientSelect} 
                onAddPatient={handleAddPatient}
                isCompact={false}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="appointments" className={selectedTab === "appointments" ? "block" : "hidden"}>
            <h1 className="text-2xl font-bold mb-6">Appointments</h1>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium mb-4">Appointment Calendar will go here</h2>
                  <p className="text-gray-500">Calendar view showing all scheduled appointments</p>
                </CardContent>
              </Card>
              
              <UpcomingAppointments />
            </div>
          </TabsContent>
          
          <TabsContent value="clinical-support" className={selectedTab === "clinical-support" ? "block" : "hidden"}>
            <h1 className="text-2xl font-bold mb-6">Clinical Decision Support</h1>
            
            <ClinicalDecisionSupport />
          </TabsContent>
          
          <TabsContent value="documents" className={selectedTab === "documents" ? "block" : "hidden"}>
            <h1 className="text-2xl font-bold mb-6">Documentation</h1>
            
            <DocumentationTemplates 
              patientName={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : undefined}
            />
          </TabsContent>
          
          <TabsContent value="messages" className={selectedTab === "messages" ? "block" : "hidden"}>
            <h1 className="text-2xl font-bold mb-6">Messages</h1>
            
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">Messaging System will go here</h2>
                <p className="text-gray-500">Secure messaging with patients and other clinicians</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className={selectedTab === "settings" ? "block" : "hidden"}>
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">Account Settings will go here</h2>
                <p className="text-gray-500">Profile, preferences, and notification settings</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
      
      {/* Add Patient Dialog */}
      <Dialog open={showAddPatientDialog} onOpenChange={setShowAddPatientDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <AddPatientForm onSuccess={handleCloseAddPatientDialog} />
        </DialogContent>
      </Dialog>
      
      {/* Patient Detail Dialog */}
      {selectedPatient && (
        <Dialog open={showPatientDetail} onOpenChange={setShowPatientDetail}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Patient: {selectedPatient.firstName} {selectedPatient.lastName}</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="h-full pr-4">
              <Tabs defaultValue="summary">
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Clinical Summary</TabsTrigger>
                  <TabsTrigger value="records">Antenatal Record</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary">
                  <ClinicalSummary 
                    patientId={selectedPatient.id} 
                    pregnancyId={1} // In a real app, we'd get this from a query
                  />
                </TabsContent>
                
                <TabsContent value="records">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Antenatal Record</h3>
                    <p className="text-gray-500">
                      This would link to the detailed antenatal record for this patient.
                    </p>
                    <Button>View Full Antenatal Record</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="appointments">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Patient Appointments</h3>
                    <p className="text-gray-500">
                      Schedule of past and upcoming appointments for this patient.
                    </p>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-center py-8 text-gray-500">
                          Appointment list for this specific patient will appear here.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}