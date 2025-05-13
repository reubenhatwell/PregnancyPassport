import { EducationModule } from "@/types";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface EducationalResourcesProps {
  modules: EducationModule[];
  currentWeek?: number;
}

export default function EducationalResources({ modules, currentWeek }: EducationalResourcesProps) {
  // Filter modules relevant to the current week
  const relevantModules = currentWeek 
    ? modules.filter(module => {
        const [start, end] = module.weekRange.split('-').map(Number);
        return currentWeek >= start && currentWeek <= end;
      })
    : modules;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4">
        {currentWeek ? `Educational Resources for Week ${currentWeek}` : "Educational Resources"}
      </h2>
      
      {relevantModules.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No educational resources available for this week.</p>
          <Button variant="outline" className="mt-2" asChild>
            <Link href="/education">Browse all resources</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relevantModules.slice(0, 3).map((module) => (
              <div 
                key={module.id}
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <img 
                  src={module.imageUrl || "https://images.unsplash.com/photo-1493770348161-369560ae357d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=350"} 
                  alt={module.title} 
                  className="w-full h-36 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{module.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                  <Button 
                    variant="link" 
                    className="mt-3 h-auto p-0 text-sm font-medium text-primary-600 hover:text-primary-500"
                    asChild
                  >
                    <Link href={`/education/${module.id}`}>
                      Read more
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {relevantModules.length > 3 && (
            <Link
              href="/education"
              className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center justify-center mt-4"
            >
              View all resources
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </>
      )}
    </div>
  );
}
