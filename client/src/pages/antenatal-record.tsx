import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Pregnancy } from "@/types";
import { Loader2, Save } from "lucide-react";

export default function AntenatalRecord() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("patient-info");
  const isClinicianView = user?.role === "clinician";
  const isReadOnly = !isClinicianView;
  
  // Fetch pregnancy data
  const { data: pregnancy, isLoading } = useQuery<Pregnancy>({
    queryKey: ["/api/pregnancy"],
    enabled: !!user,
  });

  // Create pregnancy update mutation
  const updatePregnancyMutation = useMutation({
    mutationFn: async (data: Partial<Pregnancy>) => {
      const res = await apiRequest("PATCH", `/api/pregnancy/${pregnancy?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pregnancy"] });
      toast({
        title: "Success",
        description: "Antenatal record updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update antenatal record",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Collect all form data
    const formData = new FormData(e.target as HTMLFormElement);
    const formValues: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      formValues[key] = value;
    });
    
    // Handle specific fields that need conversion
    if (formValues.interpreterRequired) {
      formValues.interpreterRequired = formValues.interpreterRequired === "true";
    }
    
    if (formValues.epdsReferral) {
      formValues.epdsReferral = formValues.epdsReferral === "true";
    }
    
    // Convert numeric fields
    ['prePregnancyWeight', 'bodyMassIndex', 'gravidity', 'parity', 'edinburghPostnatalDepressionScale'].forEach(field => {
      if (formValues[field]) {
        formValues[field] = Number(formValues[field]);
      }
    });
    
    // Handle complex objects stored as JSON
    if (formValues.substanceUse) {
      try {
        formValues.substanceUse = JSON.parse(formValues.substanceUse);
      } catch (e) {
        // If not valid JSON, create a basic structure
        formValues.substanceUse = {
          alcohol: formValues.alcohol || "none",
          tobacco: formValues.tobacco || "none",
          illicitDrugs: formValues.illicitDrugs || "none",
        };
      }
    }
    
    updatePregnancyMutation.mutate(formValues);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header userName={user ? `${user.firstName} ${user.lastName}` : ""} />
        <div className="flex-grow flex">
          <Sidebar activePage="antenatal-record" userRole={user?.role || "patient"} />
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={user ? `${user.firstName} ${user.lastName}` : ""} />
      
      <div className="flex-grow flex">
        <Sidebar activePage="antenatal-record" userRole={user?.role || "patient"} />
        
        <div className="flex-1 overflow-auto pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-900">Antenatal Record</h1>
                <p className="text-gray-600 mt-1">
                  {isClinicianView 
                    ? "Review and update the patient's antenatal record" 
                    : "View your comprehensive pregnancy health record"}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
                <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-4">
                  <TabsTrigger value="patient-info">Patient Info</TabsTrigger>
                  <TabsTrigger value="pregnancy-details">Pregnancy</TabsTrigger>
                  <TabsTrigger value="screening">Screening</TabsTrigger>
                  <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
                  <TabsTrigger value="previous-pregnancies">History</TabsTrigger>
                  <TabsTrigger value="health-considerations">Health</TabsTrigger>
                </TabsList>
                
                {/* Patient Identification & Personal Details */}
                <TabsContent value="patient-info">
                  <div className="grid grid-cols-1 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Patient Identification</CardTitle>
                        <CardDescription>Basic patient identification information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="medicalRecordNumber">Medical Record Number (MRN)</Label>
                            <Input 
                              id="medicalRecordNumber" 
                              name="medicalRecordNumber" 
                              defaultValue={pregnancy?.medicalRecordNumber || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="sex">Sex</Label>
                            <Select 
                              name="sex" 
                              defaultValue={pregnancy?.sex || "Female"} 
                              disabled={isReadOnly}
                            >
                              <SelectTrigger id="sex">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Male">Male</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="facility">Facility</Label>
                            <Input 
                              id="facility" 
                              name="facility" 
                              defaultValue={pregnancy?.facility || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="locationWard">Location/Ward</Label>
                            <Input 
                              id="locationWard" 
                              name="locationWard" 
                              defaultValue={pregnancy?.locationWard || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                        <CardDescription>Patient personal information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="preferredName">Preferred Name</Label>
                            <Input 
                              id="preferredName" 
                              name="preferredName" 
                              defaultValue={pregnancy?.preferredName || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="emergencyContact">Emergency Contact</Label>
                            <Input 
                              id="emergencyContact" 
                              name="emergencyContact" 
                              defaultValue={pregnancy?.emergencyContact || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="countryOfBirth">Country of Birth</Label>
                            <Input 
                              id="countryOfBirth" 
                              name="countryOfBirth" 
                              defaultValue={pregnancy?.countryOfBirth || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="contactNumber">Contact Number</Label>
                            <Input 
                              id="contactNumber" 
                              name="contactNumber" 
                              defaultValue={pregnancy?.contactNumber || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="language">Language</Label>
                            <Input 
                              id="language" 
                              name="language" 
                              defaultValue={pregnancy?.language || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="interpreterRequired" 
                              name="interpreterRequired" 
                              defaultChecked={pregnancy?.interpreterRequired || false} 
                              disabled={isReadOnly} 
                            />
                            <Label htmlFor="interpreterRequired">Interpreter Required</Label>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-4">
                          <Label>Descent</Label>
                          <RadioGroup 
                            name="descent" 
                            defaultValue={pregnancy?.descent || "neither"} 
                            disabled={isReadOnly}
                          >
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="aboriginal" id="aboriginal" />
                                <Label htmlFor="aboriginal">Aboriginal</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="torres" id="torres" />
                                <Label htmlFor="torres">Torres Strait Islander</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="both" id="both" />
                                <Label htmlFor="both">Both</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="neither" id="neither" />
                                <Label htmlFor="neither">Neither</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div>
                          <Label htmlFor="culturalReligiousConsiderations">Cultural/Religious Considerations</Label>
                          <Textarea 
                            id="culturalReligiousConsiderations" 
                            name="culturalReligiousConsiderations" 
                            defaultValue={pregnancy?.culturalReligiousConsiderations || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="plannedPlaceOfBirth">Planned Place of Birth</Label>
                            <Input 
                              id="plannedPlaceOfBirth" 
                              name="plannedPlaceOfBirth" 
                              defaultValue={pregnancy?.plannedPlaceOfBirth || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="birthUnitContactNumber">Birth Unit Contact Number</Label>
                            <Input 
                              id="birthUnitContactNumber" 
                              name="birthUnitContactNumber" 
                              defaultValue={pregnancy?.birthUnitContactNumber || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="modelOfCare">Model of Care</Label>
                            <Select 
                              name="modelOfCare" 
                              defaultValue={pregnancy?.modelOfCare || ""} 
                              disabled={isReadOnly}
                            >
                              <SelectTrigger id="modelOfCare">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="midwife">Midwife Led Care</SelectItem>
                                <SelectItem value="obstetrician">Obstetrician Led Care</SelectItem>
                                <SelectItem value="shared">Shared Care</SelectItem>
                                <SelectItem value="gp">GP Led Care</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="leadCareProvider">Lead Care Provider</Label>
                            <Input 
                              id="leadCareProvider" 
                              name="leadCareProvider" 
                              defaultValue={pregnancy?.leadCareProvider || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="leadCareProviderContactNumber">Lead Care Provider Contact</Label>
                            <Input 
                              id="leadCareProviderContactNumber" 
                              name="leadCareProviderContactNumber" 
                              defaultValue={pregnancy?.leadCareProviderContactNumber || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* Pregnancy Details */}
                <TabsContent value="pregnancy-details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pregnancy Details</CardTitle>
                      <CardDescription>Information about the current pregnancy</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="lastMenstrualPeriod">Last Menstrual Period (LMP)</Label>
                          <Input 
                            id="lastMenstrualPeriod" 
                            name="lastMenstrualPeriod" 
                            type="date" 
                            defaultValue={pregnancy?.lastMenstrualPeriod || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="dueDate">Agreed Expected Date of Birth (EDB)</Label>
                          <Input 
                            id="dueDate" 
                            name="dueDate" 
                            type="date" 
                            defaultValue={pregnancy?.dueDate || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="edbDeterminedBy">EDB Determined By</Label>
                          <Select 
                            name="edbDeterminedBy" 
                            defaultValue={pregnancy?.edbDeterminedBy || "LMP"} 
                            disabled={isReadOnly}
                          >
                            <SelectTrigger id="edbDeterminedBy">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LMP">LMP</SelectItem>
                              <SelectItem value="dating_scan">Dating Scan</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="pregnancyType">Pregnancy Type</Label>
                          <Select 
                            name="pregnancyType" 
                            defaultValue={pregnancy?.pregnancyType || "singleton"} 
                            disabled={isReadOnly}
                          >
                            <SelectTrigger id="pregnancyType">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="singleton">Singleton</SelectItem>
                              <SelectItem value="twin">Twin</SelectItem>
                              <SelectItem value="triplet">Triplet</SelectItem>
                              <SelectItem value="higher_multiple">Higher Multiple</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="prePregnancyWeight">Pre-pregnancy Weight (kg)</Label>
                          <Input 
                            id="prePregnancyWeight" 
                            name="prePregnancyWeight" 
                            type="number" 
                            defaultValue={pregnancy?.prePregnancyWeight || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="bodyMassIndex">Body Mass Index (BMI)</Label>
                          <Input 
                            id="bodyMassIndex" 
                            name="bodyMassIndex" 
                            type="number" 
                            step="0.1" 
                            defaultValue={pregnancy?.bodyMassIndex || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="pregnancyIntention">Pregnancy Intention</Label>
                          <Select 
                            name="pregnancyIntention" 
                            defaultValue={pregnancy?.pregnancyIntention || ""} 
                            disabled={isReadOnly}
                          >
                            <SelectTrigger id="pregnancyIntention">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="unplanned">Unplanned</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="bookingWeeks">Booking at</Label>
                          <Select 
                            name="bookingWeeks" 
                            defaultValue={pregnancy?.bookingWeeks || ""} 
                            disabled={isReadOnly}
                          >
                            <SelectTrigger id="bookingWeeks">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="28_weeks">28 weeks</SelectItem>
                              <SelectItem value="36_weeks">36 weeks</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">General Pregnancy Notes</Label>
                        <Textarea 
                          id="notes" 
                          name="notes" 
                          defaultValue={pregnancy?.notes || ""} 
                          readOnly={isReadOnly} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Screening and Blood Group */}
                <TabsContent value="screening">
                  <div className="grid grid-cols-1 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Antenatal Screening Tests</CardTitle>
                        <CardDescription>Results from routine antenatal screening</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="hepatitisB">Hepatitis B (HepBsAg)</Label>
                            <Input 
                              id="hepatitisB" 
                              name="hepatitisB" 
                              defaultValue={pregnancy?.hepatitisB || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="hepatitisC">Hepatitis C</Label>
                            <Input 
                              id="hepatitisC" 
                              name="hepatitisC" 
                              defaultValue={pregnancy?.hepatitisC || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="rubella">Rubella</Label>
                            <Input 
                              id="rubella" 
                              name="rubella" 
                              defaultValue={pregnancy?.rubella || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="syphilis">Syphilis</Label>
                            <Input 
                              id="syphilis" 
                              name="syphilis" 
                              defaultValue={pregnancy?.syphilis || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="hiv">HIV</Label>
                            <Input 
                              id="hiv" 
                              name="hiv" 
                              defaultValue={pregnancy?.hiv || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="groupBStreptococcus">Group B Streptococcus (GBS)</Label>
                            <Input 
                              id="groupBStreptococcus" 
                              name="groupBStreptococcus" 
                              defaultValue={pregnancy?.groupBStreptococcus || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="diabetes">Diabetes</Label>
                            <Input 
                              id="diabetes" 
                              name="diabetes" 
                              defaultValue={pregnancy?.diabetes || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="venousThromboembolismRisk">VTE Risk</Label>
                            <Select 
                              name="venousThromboembolismRisk" 
                              defaultValue={pregnancy?.venousThromboembolismRisk || ""} 
                              disabled={isReadOnly}
                            >
                              <SelectTrigger id="venousThromboembolismRisk">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Blood Group & Lab Results</CardTitle>
                        <CardDescription>Blood test results and related information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="bloodGroup">Blood Group</Label>
                            <Select 
                              name="bloodGroup" 
                              defaultValue={pregnancy?.bloodGroup || ""} 
                              disabled={isReadOnly}
                            >
                              <SelectTrigger id="bloodGroup">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">A</SelectItem>
                                <SelectItem value="B">B</SelectItem>
                                <SelectItem value="AB">AB</SelectItem>
                                <SelectItem value="O">O</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="rhFactor">Rh Factor</Label>
                            <Select 
                              name="rhFactor" 
                              defaultValue={pregnancy?.rhFactor || ""} 
                              disabled={isReadOnly}
                            >
                              <SelectTrigger id="rhFactor">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="positive">Positive (+)</SelectItem>
                                <SelectItem value="negative">Negative (-)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="antibodyScreen">Antibody Screen</Label>
                            <Input 
                              id="antibodyScreen" 
                              name="antibodyScreen" 
                              defaultValue={pregnancy?.antibodyScreen || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="haemoglobin">Haemoglobin</Label>
                            <Input 
                              id="haemoglobin" 
                              name="haemoglobin" 
                              defaultValue={pregnancy?.haemoglobin || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="midstreamUrine">Midstream Urine</Label>
                            <Input 
                              id="midstreamUrine" 
                              name="midstreamUrine" 
                              defaultValue={pregnancy?.midstreamUrine || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Mental Health Assessment</CardTitle>
                        <CardDescription>Edinburgh Postnatal Depression Scale assessment</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="edinburghPostnatalDepressionScale">EPDS Score</Label>
                            <Input 
                              id="edinburghPostnatalDepressionScale" 
                              name="edinburghPostnatalDepressionScale" 
                              type="number" 
                              min="0" 
                              max="30" 
                              defaultValue={pregnancy?.edinburghPostnatalDepressionScale || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="epdsDate">Assessment Date</Label>
                            <Input 
                              id="epdsDate" 
                              name="epdsDate" 
                              type="date" 
                              defaultValue={pregnancy?.epdsDate || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="epdsReferral" 
                              name="epdsReferral" 
                              defaultChecked={pregnancy?.epdsReferral || false} 
                              disabled={isReadOnly} 
                            />
                            <Label htmlFor="epdsReferral">Referral Made</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Prenatal Testing</CardTitle>
                        <CardDescription>Prenatal diagnostic testing and results</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>CVS/Amniocentesis</Label>
                              <Textarea 
                                name="cvs_amniocentesis" 
                                placeholder="Results and notes" 
                                readOnly={isReadOnly} 
                              />
                            </div>
                            <div>
                              <Label>Nuchal Translucency</Label>
                              <Textarea 
                                name="nuchal_translucency" 
                                placeholder="Results and notes" 
                                readOnly={isReadOnly} 
                              />
                            </div>
                            <div>
                              <Label>Anatomy Scan</Label>
                              <Textarea 
                                name="anatomy_scan" 
                                placeholder="Results and notes" 
                                readOnly={isReadOnly} 
                              />
                            </div>
                            <div>
                              <Label>Morphology</Label>
                              <Textarea 
                                name="morphology" 
                                placeholder="Results and notes" 
                                readOnly={isReadOnly} 
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* Lifestyle Considerations */}
                <TabsContent value="lifestyle">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Lifestyle Considerations</CardTitle>
                      <CardDescription>Substance use and lifestyle factors</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Substance Use</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="alcohol">Alcohol</Label>
                            <Select 
                              name="alcohol" 
                              defaultValue={pregnancy?.substanceUse?.alcohol || "none"} 
                              disabled={isReadOnly}
                            >
                              <SelectTrigger id="alcohol">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="occasional">Occasional</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="heavy">Heavy</SelectItem>
                                <SelectItem value="ceased">Ceased</SelectItem>
                              </SelectContent>
                            </Select>
                            {pregnancy?.substanceUse?.alcohol === "ceased" && (
                              <div className="pt-2">
                                <Label htmlFor="alcohol_ceased">When Ceased</Label>
                                <Input 
                                  id="alcohol_ceased" 
                                  name="alcohol_ceased" 
                                  type="date" 
                                  defaultValue={pregnancy?.substanceUse?.alcohol_ceased || ""} 
                                  readOnly={isReadOnly} 
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="tobacco">Tobacco</Label>
                            <Select 
                              name="tobacco" 
                              defaultValue={pregnancy?.substanceUse?.tobacco || "none"} 
                              disabled={isReadOnly}
                            >
                              <SelectTrigger id="tobacco">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="occasional">Occasional</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="heavy">Heavy</SelectItem>
                                <SelectItem value="ceased">Ceased</SelectItem>
                              </SelectContent>
                            </Select>
                            {pregnancy?.substanceUse?.tobacco === "ceased" && (
                              <div className="pt-2">
                                <Label htmlFor="tobacco_ceased">When Ceased</Label>
                                <Input 
                                  id="tobacco_ceased" 
                                  name="tobacco_ceased" 
                                  type="date" 
                                  defaultValue={pregnancy?.substanceUse?.tobacco_ceased || ""} 
                                  readOnly={isReadOnly} 
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="illicitDrugs">Illicit Drugs</Label>
                            <Select 
                              name="illicitDrugs" 
                              defaultValue={pregnancy?.substanceUse?.illicitDrugs || "none"} 
                              disabled={isReadOnly}
                            >
                              <SelectTrigger id="illicitDrugs">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="occasional">Occasional</SelectItem>
                                <SelectItem value="regular">Regular</SelectItem>
                                <SelectItem value="ceased">Ceased</SelectItem>
                              </SelectContent>
                            </Select>
                            {pregnancy?.substanceUse?.illicitDrugs === "ceased" && (
                              <div className="pt-2">
                                <Label htmlFor="illicitDrugs_ceased">When Ceased</Label>
                                <Input 
                                  id="illicitDrugs_ceased" 
                                  name="illicitDrugs_ceased" 
                                  type="date" 
                                  defaultValue={pregnancy?.substanceUse?.illicitDrugs_ceased || ""} 
                                  readOnly={isReadOnly} 
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="col-span-1 md:col-span-3">
                            <Label htmlFor="otherSubstances">Other Substances</Label>
                            <Textarea 
                              id="otherSubstances" 
                              name="otherSubstances" 
                              placeholder="Include details of nicotine replacement therapy or other substances" 
                              defaultValue={pregnancy?.substanceUse?.other || ""} 
                              readOnly={isReadOnly} 
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Previous Pregnancies */}
                <TabsContent value="previous-pregnancies">
                  <Card>
                    <CardHeader>
                      <CardTitle>Previous Pregnancies</CardTitle>
                      <CardDescription>History of previous pregnancies and births</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="gravidity">Gravidity</Label>
                          <Input 
                            id="gravidity" 
                            name="gravidity" 
                            type="number" 
                            min="0" 
                            defaultValue={pregnancy?.gravidity || 0} 
                            readOnly={isReadOnly} 
                            placeholder="Number of pregnancies"
                          />
                        </div>
                        <div>
                          <Label htmlFor="parity">Parity</Label>
                          <Input 
                            id="parity" 
                            name="parity" 
                            type="number" 
                            min="0" 
                            defaultValue={pregnancy?.parity || 0} 
                            readOnly={isReadOnly} 
                            placeholder="Number of births"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Label>Previous Pregnancy Details</Label>
                        <Textarea 
                          name="previousPregnanciesDetails" 
                          placeholder="Include details of birthplace, date, gestation, type of birth, length of labor, birth weight, etc." 
                          rows={6}
                          defaultValue={
                            pregnancy?.previousPregnancies ? 
                              typeof pregnancy.previousPregnancies === 'string' ? 
                                pregnancy.previousPregnancies : 
                                JSON.stringify(pregnancy.previousPregnancies, null, 2) 
                              : ""
                          } 
                          readOnly={isReadOnly} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Health Considerations */}
                <TabsContent value="health-considerations">
                  <Card>
                    <CardHeader>
                      <CardTitle>Health Considerations</CardTitle>
                      <CardDescription>Medical and health information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="medicalConsiderations">Medical Conditions</Label>
                          <Textarea 
                            id="medicalConsiderations" 
                            name="medicalConsiderations" 
                            defaultValue={pregnancy?.medicalConsiderations || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="gynecologicalConsiderations">Gynecological Considerations</Label>
                          <Textarea 
                            id="gynecologicalConsiderations" 
                            name="gynecologicalConsiderations" 
                            defaultValue={pregnancy?.gynecologicalConsiderations || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="majorSurgeries">Major Surgeries</Label>
                          <Textarea 
                            id="majorSurgeries" 
                            name="majorSurgeries" 
                            defaultValue={pregnancy?.majorSurgeries || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="mentalHealthDiagnosis">Mental Health Diagnosis</Label>
                          <Textarea 
                            id="mentalHealthDiagnosis" 
                            name="mentalHealthDiagnosis" 
                            defaultValue={pregnancy?.mentalHealthDiagnosis || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="previousThromboticEvents">Previous Thrombotic Events</Label>
                          <Textarea 
                            id="previousThromboticEvents" 
                            name="previousThromboticEvents" 
                            defaultValue={pregnancy?.previousThromboticEvents || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastPapSmearDate">Date of Last Pap Smear</Label>
                          <Input 
                            id="lastPapSmearDate" 
                            name="lastPapSmearDate" 
                            type="date" 
                            defaultValue={pregnancy?.lastPapSmearDate || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="medications">Current Medications</Label>
                          <Textarea 
                            id="medications" 
                            name="medications" 
                            placeholder="Name, dose/day" 
                            defaultValue={
                              pregnancy?.medications ? 
                                typeof pregnancy.medications === 'string' ? 
                                  pregnancy.medications : 
                                  JSON.stringify(pregnancy.medications, null, 2) 
                                : ""
                            } 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="vitamins">Vitamins and Supplements</Label>
                          <Textarea 
                            id="vitamins" 
                            name="vitamins" 
                            defaultValue={pregnancy?.vitamins || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="nonPrescriptionMedication">Non-Prescription Medication</Label>
                          <Textarea 
                            id="nonPrescriptionMedication" 
                            name="nonPrescriptionMedication" 
                            defaultValue={pregnancy?.nonPrescriptionMedication || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="adverseReactions">Adverse Reactions</Label>
                          <Textarea 
                            id="adverseReactions" 
                            name="adverseReactions" 
                            placeholder="Drug/tape/latex allergies" 
                            defaultValue={
                              pregnancy?.adverseReactions ? 
                                typeof pregnancy.adverseReactions === 'string' ? 
                                  pregnancy.adverseReactions : 
                                  JSON.stringify(pregnancy.adverseReactions, null, 2) 
                                : ""
                            } 
                            readOnly={isReadOnly} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="otherConsiderations">Other Considerations</Label>
                          <Textarea 
                            id="otherConsiderations" 
                            name="otherConsiderations" 
                            defaultValue={pregnancy?.otherConsiderations || ""} 
                            readOnly={isReadOnly} 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              {isClinicianView && (
                <div className="flex justify-end mt-6">
                  <Button type="submit" disabled={updatePregnancyMutation.isPending}>
                    {updatePregnancyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Antenatal Record
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}