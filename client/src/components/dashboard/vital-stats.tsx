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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-heading font-semibold text-gray-900">Recent Vital Stats</h2>
        <Button variant="link" size="sm" asChild>
          <Link href="/health-tracking">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Link>
        </Button>
      </div>
      
      {!mostRecentStats ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No vital statistics recorded yet.</p>
          <Button variant="outline" className="mt-2" asChild>
            <Link href="/health-tracking">Record vital stats</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Blood Pressure */}
          {(mostRecentStats.bloodPressureSystolic && mostRecentStats.bloodPressureDiastolic) && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Blood Pressure</span>
                <span className="text-xs text-gray-500">
                  Last updated: {formatDate(mostRecentStats.date)}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xl font-semibold text-gray-900">
                  {mostRecentStats.bloodPressureSystolic}/{mostRecentStats.bloodPressureDiastolic}
                </span>
                {bpStatus && (
                  <Badge variant="outline" className={bpStatus.class}>
                    {bpStatus.label}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Weight */}
          {mostRecentStats.weight && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Weight</span>
                <span className="text-xs text-gray-500">
                  Last updated: {formatDate(mostRecentStats.date)}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xl font-semibold text-gray-900">
                  {formatWeight(mostRecentStats.weight)} kg
                </span>
                {weightChange && (
                  <span className="text-sm text-gray-500">
                    {weightChange > 0 ? '+' : ''}{(weightChange / 1000).toFixed(1)} kg from last visit
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Fundal Height */}
          {mostRecentStats.fundalHeight && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Fundal Height</span>
                <span className="text-xs text-gray-500">
                  Last updated: {formatDate(mostRecentStats.date)}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xl font-semibold text-gray-900">
                  {mostRecentStats.fundalHeight} cm
                </span>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Normal
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}
      
      <Link 
        href="/health-tracking" 
        className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center justify-center mt-4"
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
