import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EducationModule } from "@/types";
import { Search, GraduationCap, ArrowRight, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Education() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<EducationModule | null>(null);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  
  // Fetch pregnancy data to get current week
  const { data: pregnancy } = useQuery({
    queryKey: ["/api/pregnancy"],
  });
  
  // Fetch education modules
  const { data: educationModules, isLoading } = useQuery<EducationModule[]>({
    queryKey: ["/api/education-modules"],
    enabled: !!user,
  });
  
  // Filter modules by search term
  const filteredModules = educationModules?.filter(module => 
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group modules by week range
  const groupedModules = filteredModules?.reduce((acc, module) => {
    if (!acc[module.weekRange]) {
      acc[module.weekRange] = [];
    }
    acc[module.weekRange].push(module);
    return acc;
  }, {} as Record<string, EducationModule[]>);
  
  // Sort week ranges chronologically
  const sortedWeekRanges = groupedModules ? Object.keys(groupedModules).sort((a, b) => {
    const startA = parseInt(a.split('-')[0]);
    const startB = parseInt(b.split('-')[0]);
    return startA - startB;
  }) : [];
  
  const viewModule = (module: EducationModule) => {
    setSelectedModule(module);
    setIsModuleDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={user ? `${user.firstName} ${user.lastName}` : ""} />
      
      <div className="flex-grow flex">
        <Sidebar activePage="education" userRole={user?.role || "patient"} />
        
        <div className="flex-1 overflow-auto focus:outline-none pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-900">Educational Resources</h1>
                <p className="text-gray-600 mt-1">
                  Learn more about pregnancy, childbirth, and early parenting
                </p>
              </div>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search resources"
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <p>Loading educational resources...</p>
              </div>
            ) : filteredModules?.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matching resources found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search term or browse all resources.</p>
                  <Button onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Recommended for current week */}
                {pregnancy && (
                  <div className="mb-8">
                    <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                      Recommended for You
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {educationModules
                        ?.filter(module => {
                          // Calculate gestation week based on due date and start date
                          const today = new Date();
                          const startDate = new Date(pregnancy.startDate);
                          const weeksPassed = Math.floor(
                            (today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
                          ) + 1;
                          
                          const [start, end] = module.weekRange.split('-').map(Number);
                          return weeksPassed >= start && weeksPassed <= end;
                        })
                        .slice(0, 3)
                        .map(module => (
                          <Card 
                            key={module.id}
                            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => viewModule(module)}
                          >
                            <img 
                              src={module.imageUrl || "https://images.unsplash.com/photo-1493770348161-369560ae357d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=350"} 
                              alt={module.title} 
                              className="w-full h-40 object-cover"
                            />
                            <CardContent>
                              <h3 className="font-medium text-gray-900 mt-2">{module.title}</h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{module.description}</p>
                              <Button 
                                variant="link" 
                                className="mt-2 h-auto p-0 text-primary-600 hover:text-primary-800"
                              >
                                Read more
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </CardContent>
                          </Card>
                        ))
                      }
                    </div>
                  </div>
                )}
                
                {/* All resources by week range */}
                <div className="space-y-8">
                  {sortedWeekRanges.map(weekRange => (
                    <div key={weekRange}>
                      <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
                        Weeks {weekRange}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {groupedModules?.[weekRange].map(module => (
                          <Card 
                            key={module.id}
                            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => viewModule(module)}
                          >
                            <img 
                              src={module.imageUrl || "https://images.unsplash.com/photo-1493770348161-369560ae357d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=350"} 
                              alt={module.title} 
                              className="w-full h-40 object-cover"
                            />
                            <CardContent>
                              <h3 className="font-medium text-gray-900 mt-2">{module.title}</h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{module.description}</p>
                              <Button 
                                variant="link" 
                                className="mt-2 h-auto p-0 text-primary-600 hover:text-primary-800"
                              >
                                Read more
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <MobileNavigation activePage="education" />
      
      {/* Module Content Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedModule?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedModule && (
            <div className="space-y-4">
              <img 
                src={selectedModule.imageUrl || "https://images.unsplash.com/photo-1493770348161-369560ae357d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=350"} 
                alt={selectedModule.title} 
                className="w-full h-48 object-cover rounded-lg"
              />
              
              <div className="flex items-center text-sm text-gray-500">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Recommended for weeks {selectedModule.weekRange}</span>
              </div>
              
              <p className="text-gray-700">{selectedModule.description}</p>
              
              <div className="prose max-w-none">
                {/* Display content - in a real app, this would be formatted HTML or markdown */}
                <p className="whitespace-pre-wrap">{selectedModule.content}</p>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button onClick={() => setIsModuleDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
