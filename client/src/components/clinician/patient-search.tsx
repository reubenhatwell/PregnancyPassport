import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserPlus } from "lucide-react";
import { User } from "@/types";

interface PatientSearchProps {
  onSelectPatient?: (patientId: number) => void;
  onAddPatient?: () => void;
}

export default function PatientSearch({ onSelectPatient, onAddPatient }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  
  const { data: patients } = useQuery<User[]>({
    queryKey: ["/api/patients"],
  });
  
  const handleSearch = () => {
    if (!searchQuery.trim() || !patients) {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = patients.filter(patient => 
      patient.firstName.toLowerCase().includes(query) ||
      patient.lastName.toLowerCase().includes(query) ||
      patient.email.toLowerCase().includes(query) ||
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search" 
            placeholder="Search patients by name or email..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Button variant="outline" onClick={onAddPatient}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>
      
      {searchResults.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {searchResults.map(patient => (
                <li 
                  key={patient.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectPatient?.(patient.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                    <Button size="sm" variant="ghost">View</Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {searchQuery && searchResults.length === 0 && (
        <p className="text-center text-gray-500 py-2">No patients found</p>
      )}
    </div>
  );
}