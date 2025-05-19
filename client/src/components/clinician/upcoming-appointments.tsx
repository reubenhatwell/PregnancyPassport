import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Appointment, User } from "@/types";
import { Clock, Calendar } from "lucide-react";

interface UpcomingAppointmentsProps {
  limit?: number;
  onViewAppointment?: (appointmentId: number) => void;
}

export default function UpcomingAppointments({ 
  limit = 5, 
  onViewAppointment 
}: UpcomingAppointmentsProps) {
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/clinician/appointments"],
  });
  
  // Query to get patient data for display
  const { data: patients } = useQuery<User[]>({
    queryKey: ["/api/patients"],
  });
  
  // Sort and filter upcoming appointments
  const upcomingAppointments = appointments
    ?.filter(appointment => new Date(appointment.dateTime) > new Date())
    ?.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    ?.slice(0, limit);
  
  const getPatientName = (appointmentId: number): string => {
    const appointment = appointments?.find(appt => appt.id === appointmentId);
    if (!appointment) return "Unknown Patient";
    
    // In a real app, we'd fetch the patient linked to this appointment
    // For now, return one of our patients or a placeholder
    const patient = patients?.[0];
    return patient ? `${patient.firstName} ${patient.lastName}` : "Sarah Johnson";
  };
  
  const formatAppointmentTime = (dateTime: string): string => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatAppointmentDate = (dateTime: string): string => {
    const date = new Date(dateTime);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const isToday = (dateTime: string): boolean => {
    const today = new Date();
    const appointmentDate = new Date(dateTime);
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
        <Button variant="ghost" size="sm" className="gap-1">
          <Calendar className="h-4 w-4" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading appointments...</div>
        ) : upcomingAppointments?.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No upcoming appointments</div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments?.map((appointment) => (
              <div key={appointment.id} className="flex items-center p-3 rounded-lg border hover:bg-gray-50">
                <div className="bg-primary-100 text-primary-800 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{getPatientName(appointment.id)}</h4>
                  <div className="flex items-center flex-wrap space-x-4 text-sm text-gray-500">
                    <span>{formatAppointmentTime(appointment.dateTime)}</span>
                    <span>{appointment.title}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isToday(appointment.dateTime) && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Today
                    </Badge>
                  )}
                  <Button 
                    size="sm" 
                    onClick={() => onViewAppointment?.(appointment.id)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}