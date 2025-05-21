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
import AdminPage from "@/pages/admin-page";
import NotFound from "@/pages/not-found";
import RedirectPage from "@/pages/redirect-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth-page" component={AuthPage} />
      <Route path="/redirect" component={RedirectPage} />
      
      {/* Patient routes */}
      <ProtectedRoute path="/patient-dashboard" component={Dashboard} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/appointments" component={Appointments} />
      <ProtectedRoute path="/health-tracking" component={HealthTracking} />
      <ProtectedRoute path="/scans-images" component={ScansImages} />
      <ProtectedRoute path="/test-results" component={TestResults} />
      <ProtectedRoute path="/antenatal-record" component={AntenatalRecord} />
      <ProtectedRoute path="/messages" component={Messages} />
      <ProtectedRoute path="/education" component={Education} />
      <ProtectedRoute path="/settings" component={Settings} />
      
      {/* Clinician routes */}
      <Route path="/patient-directory" component={PatientDirectory} />
      <ProtectedRoute path="/clinician-dashboard" component={ClinicianDashboard} />
      <ProtectedRoute path="/clinician-dashboard/:patientId" component={ClinicianDashboard} />
      <ProtectedRoute path="/clinician" component={RedirectPage} />
      
      {/* Admin routes */}
      <ProtectedRoute path="/admin" component={AdminPage} />
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
