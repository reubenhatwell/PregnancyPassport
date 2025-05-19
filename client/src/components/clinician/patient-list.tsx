import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";
import { 
  ChevronRight, 
  Filter, 
  Search, 
  UserPlus,
  Calendar,
  ClipboardCheck,
  AlertTriangle,
  RefreshCcw
} from "lucide-react";

interface PatientListProps {
  onPatientSelect: (patientId: number) => void;
  onAddPatient: () => void;
  limit?: number;
  isCompact?: boolean;
}

export default function PatientList({ 
  onPatientSelect, 
  onAddPatient, 
  limit,
  isCompact = false 
}: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<User[]>([]);
  
  // Fetch the patients from the API
  const { data: patients, isLoading, refetch } = useQuery<User[]>({
    queryKey: ["/api/patients"],
  });
  
  // Filter patients based on search query
  const handleSearch = () => {
    if (!patients) return;
    
    const query = searchQuery.toLowerCase();
    if (!query) {
      setFilteredPatients(patients);
      return;
    }
    
    const filtered = patients.filter(patient => 
      patient.firstName.toLowerCase().includes(query) ||
      patient.lastName.toLowerCase().includes(query) ||
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query) ||
      patient.email.toLowerCase().includes(query)
    );
    
    setFilteredPatients(filtered);
  };
  
  // When patients data changes, update filtered patients
  useState(() => {
    if (patients) {
      setFilteredPatients(patients);
    }
  });
  
  // Get patients to display (either filtered or all)
  const displayPatients = filteredPatients.length > 0 ? filteredPatients : patients || [];
  
  // Apply limit if specified
  const limitedPatients = limit ? displayPatients.slice(0, limit) : displayPatients;

  // Calculate pregnancy trimester (for demo purposes)
  const getTrimester = (patientId: number): string => {
    // In a real app, this would be calculated from the pregnancy data
    // For this demo, we'll assign trimesters based on patient ID
    const trimesters = ["First", "Second", "Third"];
    return trimesters[patientId % 3];
  };
  
  // Get next appointment date (for demo purposes)
  const getNextAppointment = (patientId: number): string => {
    // In a real app, this would be fetched from actual appointments
    // For this demo, we'll return dummy dates
    const day = (patientId * 3) % 28 + 1;
    const month = (patientId % 12) + 1;
    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/2023`;
  };
  
  // Check if patient has alerts (for demo purposes)
  const hasAlerts = (patientId: number): boolean => {
    // In a real app, this would check actual alerts
    // For this demo, every third patient has an alert
    return patientId % 3 === 0;
  };

  return (
    <Card className={isCompact ? "border-0 shadow-none" : ""}>
      <CardHeader className={isCompact ? "px-0 pt-0" : ""}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>My Patients</CardTitle>
            <CardDescription>
              {isLoading ? "Loading patients..." : `${displayPatients.length} active patients`}
            </CardDescription>
          </div>
          
          {!isCompact && (
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="pl-9 w-full md:w-[240px]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value === "") {
                      setFilteredPatients(patients || []);
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button onClick={onAddPatient}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={isCompact ? "px-0 pb-0" : ""}>
        {isLoading ? (
          <div className="text-center py-4">Loading patients...</div>
        ) : limitedPatients.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {searchQuery ? "No patients match your search" : "No patients found"}
          </div>
        ) : (
          <div className="divide-y">
            {limitedPatients.map(patient => (
              <div 
                key={patient.id}
                className="py-3 px-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onPatientSelect(patient.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      {hasAlerts(patient.id) && (
                        <Badge variant="destructive" className="ml-2">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Alert
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center">
                        <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
                        {getTrimester(patient.id)} Trimester
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Next: {getNextAppointment(patient.id)}
                      </span>
                    </div>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {!isCompact && limit && displayPatients.length > limit && (
        <CardFooter className="flex justify-center border-t pt-4">
          <Button variant="outline" onClick={() => onAddPatient()}>
            View All {displayPatients.length} Patients
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}