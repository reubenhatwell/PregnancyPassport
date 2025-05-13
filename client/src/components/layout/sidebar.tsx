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
  LogOut
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
      path: "/",
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
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    activePage === item.name
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      activePage === item.name ? "text-primary-500" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <span className={cn(
                  "inline-flex items-center justify-center h-10 w-10 rounded-full",
                  userRole === "patient" ? "bg-secondary-100" : "bg-primary-100"
                )}>
                  {userRole === "patient" ? (
                    <UserRound className="h-6 w-6 text-secondary-600" />
                  ) : (
                    <User className="h-6 w-6 text-primary-600" />
                  )}
                </span>
              </div>
              <div className="ml-3 w-full">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {userRole === "patient" ? "Patient View" : "Clinician View"}
                </p>
                <div className="mt-1 flex justify-between">
                  <Button
                    variant="link"
                    className="text-xs font-medium text-primary-600 hover:text-primary-500 p-0 h-auto"
                    onClick={userRole === "patient" ? () => {} : () => {}}
                  >
                    {userRole === "patient" ? "Switch to Clinician View" : "Switch to Patient View"}
                  </Button>
                  <Button
                    variant="link"
                    className="text-xs font-medium text-red-600 hover:text-red-500 p-0 h-auto"
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
