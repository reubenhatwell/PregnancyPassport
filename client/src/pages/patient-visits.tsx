import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Eye, Edit2, Trash2, Calendar, MapPin, User, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPatientVisitSchema, type PatientVisit } from "@shared/schema";

// Form validation schema
const visitFormSchema = insertPatientVisitSchema.extend({
  visitDate: z.string().min(1, "Visit date is required"),
});

type VisitFormData = z.infer<typeof visitFormSchema>;

export default function PatientVisits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<PatientVisit | null>(null);

  // Fetch patient visits
  const { data: visits = [], isLoading } = useQuery<PatientVisit[]>({
    queryKey: ["/api/patient-visits"],
    enabled: !!user,
  });

  // Fetch pregnancy data to get pregnancyId
  const { data: pregnancy } = useQuery({
    queryKey: ["/api/pregnancy"],
    enabled: !!user,
  });

  // Add visit mutation
  const addVisitMutation = useMutation({
    mutationFn: async (data: VisitFormData) => {
      if (!pregnancy?.id) throw new Error("No pregnancy record found");
      return apiRequest(`/api/patient-visits`, {
        method: "POST",
        body: JSON.stringify({ ...data, pregnancyId: pregnancy.id }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patient-visits"] });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
  });

  // Edit visit mutation
  const editVisitMutation = useMutation({
    mutationFn: async (data: VisitFormData) => {
      if (!selectedVisit) throw new Error("No visit selected");
      return apiRequest(`/api/patient-visits/${selectedVisit.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patient-visits"] });
      setIsEditDialogOpen(false);
      setSelectedVisit(null);
      editForm.reset();
    },
  });

  // Delete visit mutation
  const deleteVisitMutation = useMutation({
    mutationFn: async (visitId: number) => {
      return apiRequest(`/api/patient-visits/${visitId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patient-visits"] });
    },
  });

  // Forms
  const addForm = useForm<VisitFormData>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      visitDate: "",
      doctorName: "",
      visitLocation: "",
      visitNotes: "",
    },
  });

  const editForm = useForm<VisitFormData>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      visitDate: "",
      doctorName: "",
      visitLocation: "",
      visitNotes: "",
    },
  });

  // Handle edit visit
  const handleEditVisit = (visit: PatientVisit) => {
    setSelectedVisit(visit);
    editForm.reset({
      visitDate: visit.visitDate,
      doctorName: visit.doctorName,
      visitLocation: visit.visitLocation,
      visitNotes: visit.visitNotes,
    });
    setIsEditDialogOpen(true);
  };

  // Handle view visit
  const handleViewVisit = (visit: PatientVisit) => {
    setSelectedVisit(visit);
    setIsViewDialogOpen(true);
  };

  // Handle delete visit
  const handleDeleteVisit = (visitId: number) => {
    if (confirm("Are you sure you want to delete this visit record?")) {
      deleteVisitMutation.mutate(visitId);
    }
  };

  const onAddSubmit = (data: VisitFormData) => {
    addVisitMutation.mutate(data);
  };

  const onEditSubmit = (data: VisitFormData) => {
    editVisitMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Visits</h1>
          <p className="text-gray-600 mt-1">Track your medical appointments and visit notes</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600">
              <Plus className="h-4 w-4" />
              Add Visit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Visit</DialogTitle>
              <DialogDescription>
                Record details about your medical appointment or visit.
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
                      <FormLabel>Doctor's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="visitLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Hospital, Clinic, or Practice name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="visitNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter details about your visit, diagnosis, treatment, recommendations..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addVisitMutation.isPending}>
                    {addVisitMutation.isPending ? "Saving..." : "Save Visit"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Visits List */}
      {visits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No visits recorded yet</h3>
            <p className="text-gray-500 mb-4 text-center">
              Start tracking your medical visits by adding your first visit record.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-pink-500 hover:bg-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Visit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {visits.map((visit) => (
            <Card key={visit.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(visit.visitDate)}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        {visit.doctorName}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {visit.visitLocation}
                      </div>
                    </div>
                    <p className="text-gray-700 line-clamp-2">
                      {visit.visitNotes}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewVisit(visit)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditVisit(visit)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVisit(visit.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                  <label className="text-sm font-medium text-gray-700">Visit Date</label>
                  <p className="text-gray-900">{formatDate(selectedVisit.visitDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Doctor</label>
                  <p className="text-gray-900">{selectedVisit.doctorName}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900">{selectedVisit.visitLocation}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Visit Notes</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedVisit.visitNotes}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEditVisit(selectedVisit);
                }}>
                  Edit Visit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Visit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Visit</DialogTitle>
            <DialogDescription>
              Update the details of your visit record.
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
                    <FormLabel>Doctor's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="visitLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Hospital, Clinic, or Practice name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="visitNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter details about your visit, diagnosis, treatment, recommendations..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editVisitMutation.isPending}>
                  {editVisitMutation.isPending ? "Updating..." : "Update Visit"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}