import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Calendar,
  Heart,
  Image,
  FileText,
  MessageSquare,
  GraduationCap,
  Settings,
  User,
  UserRound,
  LogOut,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activePage: string;
  userRole: UserRole;
}

export default function Sidebar({ activePage, userRole }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    {
      name: "dashboard",
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "appointments",
      label: "Appointments",
      path: "/appointments",
      icon: Calendar,
    },
    {
      name: "health-tracking",
      label: "Health Tracking",
      path: "/health-tracking",
      icon: Heart,
    },
    {
      name: "antenatal-record",
      label: "Antenatal Record",
      path: "/antenatal-record",
      icon: FileText,
    },
    {
      name: "scans-images",
      label: "Scans & Images",
      path: "/scans-images",
      icon: Image,
    },
    {
      name: "test-results",
      label: "Test Results",
      path: "/test-results",
      icon: FileText,
    },
    {
      name: "patient-visits",
      label: "Patient Visits",
      path: "/patient-visits",
      icon: Stethoscope,
    },
    {
      name: "messages",
      label: "Messages",
      path: "/messages",
      icon: MessageSquare,
    },
    {
      name: "education",
      label: "Education",
      path: "/education",
      icon: GraduationCap,
    },
    {
      name: "settings",
      label: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-72">
        <div className="flex flex-col h-0 flex-1 border-r border-primary/20 bg-sidebar">
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <nav className="mt-2 flex-1 px-3 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out",
                    activePage === item.name
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      activePage === item.name 
                        ? "text-primary-foreground" 
                        : "text-sidebar-foreground/60 group-hover:text-primary"
                    )}
                  />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 border-t border-primary/20 p-4">
            <div className="flex items-center w-full bg-primary/10 p-3 rounded-lg">
              <div className="flex-shrink-0">
                <span className={cn(
                  "inline-flex items-center justify-center h-10 w-10 rounded-full",
                  userRole === "patient" 
                    ? "bg-secondary text-secondary-foreground" 
                    : "bg-primary text-primary-foreground"
                )}>
                  {userRole === "patient" ? (
                    <UserRound className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </span>
              </div>
              <div className="ml-3 w-full">
                <p className="text-sm font-medium text-foreground">
                  {userRole === "patient" ? "Patient View" : "Clinician View"}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-medium py-1 px-2 h-auto bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground rounded-md"
                    onClick={userRole === "patient" ? () => {} : () => {}}
                  >
                    {userRole === "patient" ? "Switch View" : "Switch View"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-medium py-1 px-2 h-auto bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-md"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
