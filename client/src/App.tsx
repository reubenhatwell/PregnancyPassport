import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/landing-page";
import Appointments from "@/pages/appointments";
import HealthTracking from "@/pages/health-tracking";
import ScansImages from "@/pages/scans-images";
import TestResults from "@/pages/test-results";
import Messages from "@/pages/messages";
import Education from "@/pages/education";
import Settings from "@/pages/settings";
import AntenatalRecord from "@/pages/antenatal-record";
import ClinicianDashboard from "@/pages/clinician-dashboard";
import PatientDirectory from "@/pages/patient-directory";
import PatientVisits from "@/pages/patient-visits";
import AdminPage from "@/pages/admin-page";
import NotFound from "@/pages/not-found";
import RedirectPage from "@/pages/redirect-page";

// Create wrapper components to handle props correctly
const DashboardWrapper = () => <Dashboard />;
const AppointmentsWrapper = () => <Appointments />;
const HealthTrackingWrapper = () => <HealthTracking />;
const ScansImagesWrapper = () => <ScansImages />;
const TestResultsWrapper = () => <TestResults />;
const AntenatalRecordWrapper = () => <AntenatalRecord />;
const MessagesWrapper = () => <Messages />;
const EducationWrapper = () => <Education />;
const SettingsWrapper = () => <Settings />;
const ClinicianDashboardWrapper = (props: any) => <ClinicianDashboard {...props} />;
const PatientDirectoryWrapper = () => <PatientDirectory />;
const PatientVisitsWrapper = () => <PatientVisits />;
const RedirectPageWrapper = () => <RedirectPage />;
const AdminPageWrapper = () => <AdminPage />; 

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth-page" component={AuthPage} />
      <Route path="/redirect" component={RedirectPageWrapper} />
      
      {/* Patient routes with proper role restrictions */}
      <ProtectedRoute 
        path="/patient-dashboard" 
        component={DashboardWrapper} 
        allowedRoles={["patient"]}
      />
      <ProtectedRoute 
        path="/dashboard" 
        component={DashboardWrapper} 
        allowedRoles={["patient"]}
      />
      <ProtectedRoute 
        path="/appointments" 
        component={AppointmentsWrapper} 
        allowedRoles={["patient"]}
      />
      <ProtectedRoute 
        path="/health-tracking" 
        component={HealthTrackingWrapper} 
        allowedRoles={["patient"]}
      />
      <ProtectedRoute 
        path="/scans-images" 
        component={ScansImagesWrapper} 
        allowedRoles={["patient"]}
      />
      <ProtectedRoute 
        path="/test-results" 
        component={TestResultsWrapper} 
        allowedRoles={["patient"]}
      />
      <ProtectedRoute 
        path="/antenatal-record" 
        component={AntenatalRecordWrapper} 
        allowedRoles={["patient"]}
      />
      <ProtectedRoute 
        path="/patient-visits" 
        component={PatientVisitsWrapper} 
        allowedRoles={["patient"]}
      />
      <ProtectedRoute 
        path="/messages" 
        component={MessagesWrapper} 
        allowedRoles={["patient", "clinician"]}
      />
      <ProtectedRoute 
        path="/education" 
        component={EducationWrapper} 
        allowedRoles={["patient"]}
      />
      <ProtectedRoute 
        path="/settings" 
        component={SettingsWrapper} 
        allowedRoles={["patient", "clinician", "admin"]}
      />
      
      {/* Clinician routes with proper access controls */}
      <ProtectedRoute 
        path="/patient-directory" 
        component={PatientDirectoryWrapper}
        allowedRoles={["clinician", "admin"]}
      />
      <ProtectedRoute 
        path="/clinician-dashboard" 
        component={ClinicianDashboardWrapper} 
        allowedRoles={["clinician", "admin"]}
      />
      <Route
        path="/clinician-dashboard/:patientId"
        component={({ params }) => <ClinicianDashboard patientId={params?.patientId} />}
      />
      <ProtectedRoute 
        path="/clinician" 
        component={RedirectPageWrapper} 
        allowedRoles={["clinician", "admin"]}
      />
      
      {/* Admin routes */}
      <ProtectedRoute 
        path="/admin" 
        component={AdminPageWrapper} 
        allowedRoles={["admin"]}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
