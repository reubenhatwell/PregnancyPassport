import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Heart,
  Image,
  MoreHorizontal
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";

interface MobileNavigationProps {
  activePage: string;
}

export default function MobileNavigation({ activePage }: MobileNavigationProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainNavItems = [
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
      label: "Health",
      path: "/health-tracking",
      icon: Heart,
    },
    {
      name: "scans-images",
      label: "Scans",
      path: "/scans-images",
      icon: Image,
    },
  ];

  const moreNavItems = [
    {
      name: "test-results",
      label: "Test Results",
      path: "/test-results",
    },
    {
      name: "messages",
      label: "Messages",
      path: "/messages",
    },
    {
      name: "education",
      label: "Education",
      path: "/education",
    },
    {
      name: "settings",
      label: "Settings",
      path: "/settings",
    },
  ];

  return (
    <div className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10 md:hidden">
      <div className="grid grid-cols-5">
        {mainNavItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={cn(
              "flex flex-col items-center justify-center py-2",
              activePage === item.name ? "text-primary-600" : "text-gray-600"
            )}
          >
            <item.icon className="text-xl h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
        
        <Drawer open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <DrawerTrigger asChild>
            <button className={cn(
              "flex flex-col items-center justify-center py-2",
              moreNavItems.some(item => item.name === activePage) ? "text-primary-600" : "text-gray-600"
            )}>
              <MoreHorizontal className="text-xl h-5 w-5" />
              <span className="text-xs mt-1">More</span>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="p-4">
              <h4 className="font-medium text-sm mb-3">More Options</h4>
              <div className="grid grid-cols-2 gap-3">
                {moreNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-lg border",
                      activePage === item.name 
                        ? "border-primary-500 bg-primary-50 text-primary-600" 
                        : "border-gray-200 text-gray-600"
                    )}
                    onClick={() => setIsMoreOpen(false)}
                  >
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
