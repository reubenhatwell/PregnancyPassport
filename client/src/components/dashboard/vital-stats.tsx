import { VitalStat } from "@/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VitalStatsProps {
  vitalStats: VitalStat[];
}

export default function VitalStats({ vitalStats }: VitalStatsProps) {
  // Sort by date (newest first) and get the most recent entry
  const sortedStats = [...vitalStats].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const mostRecentStats = sortedStats[0];
  
  const getBPStatus = (systolic?: number, diastolic?: number) => {
    if (!systolic || !diastolic) return null;
    
    if (systolic < 120 && diastolic < 80) {
      return { label: "Normal", class: "bg-green-100 text-green-800" };
    } else if ((systolic >= 120 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
      return { label: "Elevated", class: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "High", class: "bg-red-100 text-red-800" };
    }
  };
  
  const bpStatus = mostRecentStats?.bloodPressureSystolic && mostRecentStats?.bloodPressureDiastolic
    ? getBPStatus(mostRecentStats.bloodPressureSystolic, mostRecentStats.bloodPressureDiastolic)
    : null;
  
  // Helper function to convert weight from grams to kg with 1 decimal place
  const formatWeight = (weightInGrams?: number) => {
    if (!weightInGrams) return null;
    return (weightInGrams / 1000).toFixed(1);
  };
  
  // Find previous entry to compare with current for weight change
  const previousEntry = sortedStats[1];
  const weightChange = mostRecentStats?.weight && previousEntry?.weight
    ? mostRecentStats.weight - previousEntry.weight
    : null;

  return (
    <div className="bg-card rounded-xl shadow-md p-6 border border-primary/10">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-heading font-semibold text-primary">Recent Vital Stats</h2>
        <Button variant="ghost" size="sm" asChild className="bg-primary/10 hover:bg-primary/20 text-primary">
          <Link href="/health-tracking">
            <Plus className="h-4 w-4 mr-1" />
            Add Stats
          </Link>
        </Button>
      </div>
      
      {!mostRecentStats ? (
        <div className="text-center py-8 bg-secondary/10 rounded-lg border border-secondary/20">
          <p className="text-foreground/70 mb-3">No vital statistics recorded yet.</p>
          <Button className="mt-2 bg-primary/90 hover:bg-primary" asChild>
            <Link href="/health-tracking">Record vital stats</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Blood Pressure */}
          {(mostRecentStats.bloodPressureSystolic && mostRecentStats.bloodPressureDiastolic) && (
            <div className="bg-secondary/10 p-4 rounded-lg hover:bg-secondary/20 transition-colors duration-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground/80 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                  Blood Pressure
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {formatDate(mostRecentStats.date)}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-primary">
                  {mostRecentStats.bloodPressureSystolic}/{mostRecentStats.bloodPressureDiastolic}
                </span>
                {bpStatus && (
                  <Badge className={`${bpStatus.class} font-medium px-3`}>
                    {bpStatus.label}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Weight */}
          {mostRecentStats.weight && (
            <div className="bg-secondary/10 p-4 rounded-lg hover:bg-secondary/20 transition-colors duration-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground/80 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                  Weight
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {formatDate(mostRecentStats.date)}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-primary">
                  {formatWeight(mostRecentStats.weight)} kg
                </span>
                {weightChange && (
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    weightChange > 0 ? 'bg-primary/10 text-primary' : 'bg-secondary/20 text-foreground/80'
                  }`}>
                    {weightChange > 0 ? '+' : ''}{(weightChange / 1000).toFixed(1)} kg
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Fundal Height */}
          {mostRecentStats.fundalHeight && (
            <div className="bg-secondary/10 p-4 rounded-lg hover:bg-secondary/20 transition-colors duration-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground/80 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                  Fundal Height
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {formatDate(mostRecentStats.date)}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-primary">
                  {mostRecentStats.fundalHeight} cm
                </span>
                <Badge className="bg-green-100 text-green-800 font-medium px-3">
                  Normal
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}
      
      <Link 
        href="/health-tracking" 
        className="text-primary hover:text-primary/80 text-sm font-medium flex items-center justify-center mt-5 py-2 border-t border-primary/10"
      >
        View all vitals
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      </Link>
    </div>
  );
}
