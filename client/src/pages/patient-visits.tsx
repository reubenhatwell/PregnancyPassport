import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, Edit2, Trash2, Calendar, MapPin, User, FileText, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form validation schema
const visitFormSchema = z.object({
  visitDate: z.string().min(1, "Visit date is required"),
  doctorName: z.string().min(1, "Doctor name is required"),
  location: z.string().min(1, "Location is required"),
  notes: z.string().min(1, "Visit notes are required"),
});

type VisitFormData = z.infer<typeof visitFormSchema>;

// Mock patient visit interface
interface PatientVisit {
  id: number;
  pregnancyId: number;
  visitDate: string;
  doctorName: string;
  location: string;
  notes: string;
  createdAt: string;
}

// Mock patient interface
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function PatientVisits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<PatientVisit | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  // Mock data for patients
  const mockPatients: Patient[] = [
    { id: 1, firstName: "Sarah", lastName: "Wilson", email: "sarah.wilson@email.com" },
    { id: 2, firstName: "Emma", lastName: "Johnson", email: "emma.johnson@email.com" },
    { id: 3, firstName: "Lisa", lastName: "Davis", email: "lisa.davis@email.com" },
  ];

  // Mock data for visits
  const mockVisits: PatientVisit[] = [
    {
      id: 1,
      pregnancyId: 1,
      visitDate: "2025-01-08",
      doctorName: "Dr. Sarah Mitchell",
      location: "Royal Prince Alfred Hospital",
      notes: "Regular checkup at 28 weeks. Blood pressure normal, baby's heartbeat strong. Discussed nutrition and exercise plan.",
      createdAt: "2025-01-08T10:00:00Z"
    },
    {
      id: 2,
      pregnancyId: 1,
      visitDate: "2024-12-15",
      doctorName: "Dr. James Roberts",
      location: "Sydney Children's Hospital",
      notes: "20-week ultrasound scan completed. All measurements within normal range. Gender revealed as requested.",
      createdAt: "2024-12-15T14:30:00Z"
    },
  ];

  // Filter visits by selected patient
  const filteredVisits = selectedPatientId 
    ? mockVisits.filter(visit => visit.pregnancyId === parseInt(selectedPatientId))
    : [];

  // Forms
  const addForm = useForm<VisitFormData>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      visitDate: "",
      doctorName: "",
      location: "",
      notes: "",
    },
  });

  const editForm = useForm<VisitFormData>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      visitDate: "",
      doctorName: "",
      location: "",
      notes: "",
    },
  });

  // Event handlers
  const handleEditVisit = (visit: PatientVisit) => {
    setSelectedVisit(visit);
    editForm.reset({
      visitDate: visit.visitDate,
      doctorName: visit.doctorName,
      location: visit.location,
      notes: visit.notes,
    });
    setIsEditDialogOpen(true);
  };

  const handleViewVisit = (visit: PatientVisit) => {
    setSelectedVisit(visit);
    setIsViewDialogOpen(true);
  };

  const onAddSubmit = (data: VisitFormData) => {
    console.log("Adding visit:", data);
    setIsAddDialogOpen(false);
    addForm.reset();
  };

  const onEditSubmit = (data: VisitFormData) => {
    console.log("Editing visit:", data);
    setIsEditDialogOpen(false);
    setSelectedVisit(null);
    editForm.reset();
  };

  const handleDeleteVisit = (visitId: number) => {
    console.log("Deleting visit:", visitId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Patient Visits</h1>
          <p className="text-gray-600">Manage patient visit records and medical appointments</p>
        </div>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Patient
          </CardTitle>
          <CardDescription>Choose a patient to view their visit records</CardDescription>
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

      {/* Visits Section */}
      {selectedPatientId && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Visit Records</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-rose-600 hover:bg-rose-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Visit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Patient Visit</DialogTitle>
                  <DialogDescription>
                    Record details of a new patient visit or appointment.
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="visitDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visit Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="doctorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Jane Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Royal Prince Alfred Hospital" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visit Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Details about the visit, observations, recommendations..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-rose-600 hover:bg-rose-700">
                        Add Visit
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Visits List */}
          <div className="grid gap-4">
            {filteredVisits.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No visit records</h3>
                    <p className="text-gray-600">This patient doesn't have any recorded visits yet.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredVisits.map((visit) => (
                <Card key={visit.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-rose-600" />
                          {formatDate(visit.visitDate)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {visit.doctorName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {visit.location}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewVisit(visit)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVisit(visit)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVisit(visit.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 line-clamp-3">{visit.notes}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* View Visit Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Visit Date</label>
                  <p className="text-gray-900">{formatDate(selectedVisit.visitDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Doctor</label>
                  <p className="text-gray-900">{selectedVisit.doctorName}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-gray-900">{selectedVisit.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Visit Notes</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedVisit.notes}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Visit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Visit</DialogTitle>
            <DialogDescription>
              Update the visit details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="visitDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="doctorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Royal Prince Alfred Hospital" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Details about the visit, observations, recommendations..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedVisit(null);
                    editForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-rose-600 hover:bg-rose-700">
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}