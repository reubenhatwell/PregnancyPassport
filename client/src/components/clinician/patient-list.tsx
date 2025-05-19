import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Pregnancy } from "@/types";
import { calculatePregnancyStats } from "@/lib/utils";
import { Search, ChevronRight } from "lucide-react";

interface PatientListProps {
  onSelectPatient?: (patientId: number) => void;
}

export default function PatientList({ onSelectPatient }: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: patients, isLoading } = useQuery<User[]>({
    queryKey: ["/api/patients"],
  });
  
  const { data: pregnancies, isLoading: pregnanciesLoading } = useQuery<Pregnancy[]>({
    queryKey: ["/api/pregnancies"],
  });
  
  const filteredPatients = patients?.filter(patient => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.email.toLowerCase().includes(searchLower)
    );
  });

  const getPatientPregnancy = (patientId: number) => {
    return pregnancies?.find(pregnancy => pregnancy.patientId === patientId);
  };
  
  const getPregnancyWeeks = (pregnancy?: Pregnancy) => {
    if (!pregnancy) return "N/A";
    
    try {
      const stats = calculatePregnancyStats(pregnancy.dueDate, pregnancy.startDate);
      return `${stats.currentWeek}`;
    } catch (error) {
      return "N/A";
    }
  };
  
  const getPatientStatus = (pregnancy?: Pregnancy) => {
    // In a real app, this would be based on actual risk factors and assessments
    const statuses = ["Normal", "Follow-up", "High Risk"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return randomStatus;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search" 
            placeholder="Search patients..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Weeks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || pregnanciesLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading patients...</TableCell>
              </TableRow>
            ) : filteredPatients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No patients found</TableCell>
              </TableRow>
            ) : (
              filteredPatients?.map((patient) => {
                const pregnancy = getPatientPregnancy(patient.id);
                const status = getPatientStatus(pregnancy);
                const statusColor = 
                  status === "Normal" ? "bg-green-50 text-green-700 border-green-200" :
                  status === "Follow-up" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                  "bg-red-50 text-red-700 border-red-200";
                
                return (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.firstName} {patient.lastName}
                    </TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{pregnancy?.dueDate || "N/A"}</TableCell>
                    <TableCell>{getPregnancyWeeks(pregnancy)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onSelectPatient?.(patient.id)}
                        >
                          View Record
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onSelectPatient?.(patient.id)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}