import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Shield, Syringe, Save, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Mock immunisation data interface
interface ImmunisationData {
  id: number;
  pregnancyId: number;
  fluDate: string | null;
  covidDate: string | null;
  whoopingCoughDate: string | null;
  rsvDate: string | null;
  antiDDate: string | null;
}

// Mock patient interface for clinician view
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function ImmunisationHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [formData, setFormData] = useState<Partial<ImmunisationData>>({
    fluDate: null,
    covidDate: null,
    whoopingCoughDate: null,
    rsvDate: null,
    antiDDate: null,
  });

  const isClinicianView = user?.role === "clinician" || user?.role === "admin";
  const isReadOnly = user?.role === "patient";

  // Get patients for clinician view
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ["/api/patients"],
    enabled: isClinicianView,
  });

  // Get pregnancy data for selected patient (clinician) or current user (patient)
  const { data: pregnancy, isLoading: isLoadingPregnancy } = useQuery({
    queryKey: selectedPatientId ? ["/api/pregnancies/patient", selectedPatientId] : ["/api/pregnancies/user"],
    enabled: isClinicianView ? !!selectedPatientId : !!user,
  });

  // Get immunisation history for the pregnancy
  const { data: immunisationData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/immunisation-history", pregnancy?.id],
    queryFn: () => apiRequest(`/api/immunisation-history/pregnancy/${pregnancy?.id}`),
    enabled: !!pregnancy?.id,
  });

  // Initialize form data when immunisation data loads
  useState(() => {
    if (immunisationData) {
      setFormData({
        fluDate: immunisationData.fluDate,
        covidDate: immunisationData.covidDate,
        whoopingCoughDate: immunisationData.whoopingCoughDate,
        rsvDate: immunisationData.rsvDate,
        antiDDate: immunisationData.antiDDate,
      });
    } else {
      // Initialize with empty form if no data exists
      setFormData({
        fluDate: null,
        covidDate: null,
        whoopingCoughDate: null,
        rsvDate: null,
        antiDDate: null,
      });
    }
  }, [immunisationData]);

  const handleInputChange = (field: keyof ImmunisationData, value: string) => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: value || null,
    }));
  };

  // Mutation for creating immunisation history
  const createMutation = useMutation({
    mutationFn: (data: Partial<ImmunisationData>) =>
      apiRequest("/api/immunisation-history", {
        method: "POST",
        body: JSON.stringify({ ...data, pregnancyId: pregnancy?.id }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/immunisation-history", pregnancy?.id] });
      toast({
        title: "Immunisation History Created",
        description: "The immunisation records have been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create immunisation history. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating immunisation history
  const updateMutation = useMutation({
    mutationFn: (data: Partial<ImmunisationData>) =>
      apiRequest(`/api/immunisation-history/${immunisationData?.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/immunisation-history", pregnancy?.id] });
      toast({
        title: "Immunisation History Updated",
        description: "The immunisation records have been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update immunisation history. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (isReadOnly) return;
    
    if (immunisationData?.id) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const immunisationFields = [
    {
      key: "fluDate" as const,
      label: "Flu Vaccination",
      description: "Annual influenza vaccination",
      icon: "💉",
    },
    {
      key: "covidDate" as const,
      label: "COVID-19 Vaccination",
      description: "COVID-19 booster or primary series",
      icon: "🦠",
    },
    {
      key: "whoopingCoughDate" as const,
      label: "Whooping Cough (Pertussis)",
      description: "Tdap vaccination for pertussis protection",
      icon: "🫁",
    },
    {
      key: "rsvDate" as const,
      label: "RSV Vaccination",
      description: "Respiratory Syncytial Virus vaccination",
      icon: "🫁",
    },
    {
      key: "antiDDate" as const,
      label: "Anti-D Injection",
      description: "RhD immunoglobulin injection",
      icon: "💊",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Immunisation History</h1>
          <p className="text-gray-600">
            {isClinicianView 
              ? "Manage patient immunisation records and vaccination dates"
              : "View your immunisation records and vaccination history"
            }
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={handleSave} className="bg-rose-600 hover:bg-rose-700">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Patient Selection for Clinicians */}
      {isClinicianView && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Patient
            </CardTitle>
            <CardDescription>Choose a patient to view or edit their immunisation records</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a patient..." />
              </SelectTrigger>
              <SelectContent>
                {mockPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {patient.firstName} {patient.lastName} - {patient.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Immunisation Records */}
      {(selectedPatientId || !isClinicianView) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-rose-600" />
              Immunisation Records
            </CardTitle>
            <CardDescription>
              {isReadOnly 
                ? "Your vaccination history and immunisation dates"
                : "Record vaccination dates and immunisation history"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              {immunisationFields.map((field, index) => (
                <div key={field.key}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{field.icon}</span>
                        <div>
                          <Label htmlFor={field.key} className="text-base font-medium">
                            {field.label}
                          </Label>
                          <p className="text-sm text-gray-600">{field.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-48">
                      <Label htmlFor={field.key} className="sr-only">
                        {field.label} Date
                      </Label>
                      <Input
                        id={field.key}
                        type="date"
                        value={formData[field.key] || ""}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        disabled={isReadOnly}
                        className={isReadOnly ? "bg-gray-50 cursor-not-allowed" : ""}
                      />
                      {formData[field.key] && (
                        <p className="text-xs text-gray-500 mt-1">
                          Administered: {formatDate(formData[field.key]!)}
                        </p>
                      )}
                    </div>
                  </div>
                  {index < immunisationFields.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>

            {isReadOnly && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Syringe className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">View Only Access</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      You can view your immunisation history here. To update or add new vaccination records, 
                      please speak with your healthcare provider during your next appointment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isReadOnly && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900">Vaccination Reminders</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Keep immunisation records up to date. Flu vaccines are recommended annually, 
                      and Tdap is typically given once during pregnancy (ideally between 27-36 weeks).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isClinicianView && !selectedPatientId && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
              <p className="text-gray-600">Choose a patient from the dropdown above to view or edit their immunisation records.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}