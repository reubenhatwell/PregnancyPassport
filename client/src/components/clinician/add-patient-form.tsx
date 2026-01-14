import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Form schema for adding a new patient
const addPatientSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dueDate: z.string().min(1, "Due date is required"),
  startDate: z.string().min(1, "Conception date is required"),
  medicalRecordNumber: z.string().optional(),
  contactNumber: z.string().optional(),
  pregnancyType: z.enum(["singleton", "twin", "triplet", "higher_multiple"]),
});

type AddPatientFormValues = z.infer<typeof addPatientSchema>;

interface AddPatientFormProps {
  onSuccess?: () => void;
}

export default function AddPatientForm({ onSuccess }: AddPatientFormProps) {
  const { toast } = useToast();
  
  const form = useForm<AddPatientFormValues>({
    resolver: zodResolver(addPatientSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      dueDate: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      medicalRecordNumber: "",
      contactNumber: "",
      pregnancyType: "singleton",
    },
  });
  
  // Mutation for creating a new patient
  const createPatientMutation = useMutation({
    mutationFn: async (data: AddPatientFormValues) => {
      throw new Error("Clinician-created patient accounts are disabled. Ask the patient to sign up directly.");
    },
    onError: (error: Error) => {
      toast({
        title: "Action needed",
        description: error.message || "Have the patient create their account via the sign-up page.",
        variant: "destructive",
      });
    },
  });

  // TODO: When enabling clinician-created accounts via Supabase admin API,
  // implement user creation + pregnancy creation below.
  const onSubmit = (data: AddPatientFormValues) => {
    createPatientMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Sarah" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Johnson" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="sarah.johnson@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="medicalRecordNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medical Record Number</FormLabel>
                <FormControl>
                  <Input placeholder="MRN12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 234 567 8900" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conception Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="pregnancyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pregnancy Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pregnancy type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="singleton">Singleton</SelectItem>
                  <SelectItem value="twin">Twin</SelectItem>
                  <SelectItem value="triplet">Triplet</SelectItem>
                  <SelectItem value="higher_multiple">Higher Multiple</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={createPatientMutation.isPending}>
            {createPatientMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Add Patient"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
