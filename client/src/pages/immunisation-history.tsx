import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Shield, Syringe, Save, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ImmunisationData {
  id: number;
  pregnancyId: number;
  fluDate: string | null;
  covidDate: string | null;
  whoopingCoughDate: string | null;
  rsvDate: string | null;
  antiDDate: string | null;
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

  const isClinicianView = user?.role === "clinician";
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
    enabled: !!pregnancy?.id,
  });

  // Update form data when immunisation data loads
  useEffect(() => {
    if (immunisationData) {
      setFormData({
        fluDate: immunisationData.fluDate,
        covidDate: immunisationData.covidDate,
        whoopingCoughDate: immunisationData.whoopingCoughDate,
        rsvDate: immunisationData.rsvDate,
        antiDDate: immunisationData.antiDDate,
      });
    }
  }, [immunisationData]);

  // Mutation for creating immunisation history
  const createMutation = useMutation({
    mutationFn: (data: Partial<ImmunisationData>) =>
      apiRequest("POST", "/api/immunisation-history", { ...data, pregnancyId: pregnancy?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/immunisation-history", pregnancy?.id] });
      toast({
        title: "Immunisation History Created",
        description: "The immunisation records have been successfully created.",
      });
    },
    onError: () => {
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
      apiRequest("PATCH", `/api/immunisation-history/${immunisationData?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/immunisation-history", pregnancy?.id] });
      toast({
        title: "Immunisation History Updated",
        description: "The immunisation records have been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update immunisation history. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof ImmunisationData, value: string) => {
    if (isReadOnly) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: value || null,
    }));
  };

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
      label: "Flu Vaccine",
      description: "Annual influenza vaccination recommended during pregnancy"
    },
    {
      key: "covidDate" as const,
      label: "COVID-19 Vaccine", 
      description: "COVID-19 vaccination recommended during pregnancy"
    },
    {
      key: "whoopingCoughDate" as const,
      label: "Whooping Cough (Pertussis)",
      description: "Tdap vaccine recommended between 20-32 weeks of pregnancy"
    },
    {
      key: "rsvDate" as const,
      label: "RSV Vaccine",
      description: "RSV vaccination recommended between 32-36 weeks of pregnancy"
    },
    {
      key: "antiDDate" as const,
      label: "Anti-D Injection",
      description: "For Rh-negative mothers, typically given at 28 weeks and after birth"
    }
  ];

  const isLoading = isLoadingPatients || isLoadingPregnancy || isLoadingHistory;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading immunisation history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-pink-100">
          <Shield className="h-6 w-6 text-pink-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Immunisation History</h1>
          <p className="text-gray-600">Track and manage pregnancy-related vaccinations</p>
        </div>
      </div>

      {isClinicianView && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a patient to view immunisation history" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient: any) => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {patient.firstName} {patient.lastName} - {patient.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {(!isClinicianView || selectedPatientId) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5" />
              Immunisation Records
            </CardTitle>
            <CardDescription>
              {isReadOnly 
                ? "View your immunisation history during pregnancy" 
                : "Record and track immunisation dates for optimal maternal and fetal health"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {immunisationFields.map((field, index) => (
              <div key={field.key}>
                <div className="space-y-2">
                  <Label htmlFor={field.key} className="text-sm font-medium">
                    {field.label}
                  </Label>
                  <Input
                    id={field.key}
                    type="date"
                    value={formData[field.key] || ""}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    disabled={isReadOnly}
                    className="max-w-xs"
                  />
                  <p className="text-xs text-gray-500">{field.description}</p>
                </div>
                {index < immunisationFields.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}

            {!isReadOnly && (
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isReadOnly && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-700">
              For any questions about your immunisation schedule or to update these records, 
              please contact your healthcare provider or email{" "}
              <a href="mailto:support@mypregnancypassport.com" className="underline">
                support@mypregnancypassport.com
              </a>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
