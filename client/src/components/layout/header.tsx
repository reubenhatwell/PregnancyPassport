import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Bell, 
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./sidebar";

interface HeaderProps {
  userName: string;
  gestationWeeks?: string;
}

export default function Header({ userName, gestationWeeks }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="bg-primary/5 shadow-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="text-primary mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" strokeWidth="0" className="h-7 w-7">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <span className="font-heading font-bold text-xl text-primary">Digital Pregnancy Passport</span>
            </div>
          </div>
          <div className="flex items-center">
            {gestationWeeks && (
              <div className="hidden md:flex items-center mr-5 px-3 py-1 bg-secondary/30 text-secondary-foreground rounded-full">
                <span className="text-sm font-medium">{gestationWeeks}</span>
              </div>
            )}
            <span className="inline-flex">
              <button 
                type="button" 
                className="bg-primary/10 p-2 rounded-full text-primary hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-3 flex items-center px-2 py-1 rounded-full bg-secondary/20 hover:bg-secondary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-sm font-medium text-foreground hidden md:block">{userName}</span>
                  <ChevronDown className="text-primary/70 ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-primary/90">{userName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10" onClick={() => window.location.href = "/settings"}>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10" onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile menu button */}
            <div className="ml-2 -mr-2 flex items-center md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-500">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                  <div className="flex flex-col h-full">
                    <div className="px-4 py-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="" />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">{userName}</p>
                            <p className="text-xs text-gray-500">
                              {user?.role === "patient" ? "Patient" : "Clinician"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    {/* Mobile navigation - reuse sidebar component logic */}
                    <div className="flex-1 overflow-y-auto py-4">
                      <nav className="px-2 space-y-1">
                        {/* This is just for mobile view, add simplified version of sidebar */}
                        {/* We'll handle this with the mobile navigation component */}
                      </nav>
                    </div>
                    <div className="border-t border-gray-200 p-4">
                      <Button
                        variant="outline"
                        className="w-full justify-center"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
