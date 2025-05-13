import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, calculatePregnancyStats } from "@/lib/utils";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import PregnancyProgress from "@/components/dashboard/pregnancy-progress";
import UpcomingAppointments from "@/components/dashboard/upcoming-appointments";
import VitalStats from "@/components/dashboard/vital-stats";
import RecentScans from "@/components/dashboard/recent-scans";
import TestResultsCard from "@/components/dashboard/test-results-card";
import EducationalResources from "@/components/dashboard/educational-resources";
import { Pregnancy, PregnancyStats, Appointment, VitalStat, TestResult, Scan, EducationModule } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [pregnancyStats, setPregnancyStats] = useState<PregnancyStats | null>(null);
  
  // Fetch pregnancy data
  const { data: pregnancy } = useQuery<Pregnancy>({
    queryKey: ["/api/pregnancy"],
    enabled: !!user,
  });
  
  // Fetch appointments
  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: !!pregnancy,
  });
  
  // Fetch vital stats
  const { data: vitalStats } = useQuery<VitalStat[]>({
    queryKey: ["/api/vital-stats"],
    enabled: !!pregnancy,
  });
  
  // Fetch test results
  const { data: testResults } = useQuery<TestResult[]>({
    queryKey: ["/api/test-results"],
    enabled: !!pregnancy,
  });
  
  // Fetch scans
  const { data: scans } = useQuery<Scan[]>({
    queryKey: ["/api/scans"],
    enabled: !!pregnancy,
  });
  
  // Calculate pregnancy statistics
  useEffect(() => {
    if (pregnancy?.dueDate && pregnancy?.startDate) {
      const stats = calculatePregnancyStats(pregnancy.dueDate, pregnancy.startDate);
      setPregnancyStats(stats);
    }
  }, [pregnancy]);
  
  // Fetch education modules for current week
  const { data: educationModules } = useQuery<EducationModule[]>({
    queryKey: ["/api/education-modules", pregnancyStats?.currentWeek],
    queryFn: async ({ queryKey }) => {
      const week = queryKey[1];
      const res = await fetch(`/api/education-modules?week=${week}`);
      if (!res.ok) throw new Error("Failed to fetch education modules");
      return res.json();
    },
    enabled: !!pregnancyStats?.currentWeek,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        userName={user ? `${user.firstName} ${user.lastName}` : ""}
        gestationWeeks={pregnancyStats ? `Week ${pregnancyStats.currentWeek}` : ""}
      />
      
      <div className="flex-grow flex">
        <Sidebar activePage="dashboard" userRole={user?.role || "patient"} />
        
        <div className="flex-1 overflow-auto focus:outline-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-gray-900">
                      Welcome back, {user?.firstName || ""}
                    </h1>
                    <p className="text-gray-600 mt-1">Your pregnancy journey at a glance</p>
                  </div>
                  <div className="hidden sm:block">
                    <Button className="inline-flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Information
                    </Button>
                  </div>
                </div>
              </div>

              {/* Pregnancy Progress */}
              {pregnancy && pregnancyStats && (
                <PregnancyProgress 
                  stats={pregnancyStats}
                  dueDate={formatDate(pregnancy.dueDate)} 
                />
              )}

              {/* Upcoming Appointments & Vital Stats Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UpcomingAppointments appointments={appointments || []} />
                <VitalStats vitalStats={vitalStats || []} />
              </div>

              {/* Scans & Test Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentScans scans={scans || []} />
                <TestResultsCard testResults={testResults || []} />
              </div>

              {/* Educational Resources */}
              <EducationalResources 
                modules={educationModules || []} 
                currentWeek={pregnancyStats?.currentWeek} 
              />
            </div>
          </div>
        </div>
      </div>
      
      <MobileNavigation activePage="dashboard" />
    </div>
  );
}
