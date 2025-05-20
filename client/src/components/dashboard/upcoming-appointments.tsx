import { Appointment } from "@/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Map, Plus } from "lucide-react";
import { Link } from "wouter";

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export default function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  // Sort appointments by date (closest first) and filter for future appointments
  const upcomingAppointments = appointments
    .filter(appointment => new Date(appointment.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 3); // Limit to 3 upcoming appointments for dashboard

  const formatAppointmentTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-card rounded-xl shadow-md p-6 border border-primary/10">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-heading font-semibold text-primary">Upcoming Appointments</h2>
        <Button variant="ghost" size="sm" asChild className="bg-primary/10 hover:bg-primary/20 text-primary">
          <Link href="/appointments">
            <Plus className="h-4 w-4 mr-1" />
            New Appointment
          </Link>
        </Button>
      </div>
      
      {upcomingAppointments.length === 0 ? (
        <div className="text-center py-8 bg-secondary/10 rounded-lg border border-secondary/20">
          <p className="text-foreground/70 mb-3">No upcoming appointments scheduled.</p>
          <Button className="mt-2 bg-primary/90 hover:bg-primary" asChild>
            <Link href="/appointments">Schedule an appointment</Link>
          </Button>
        </div>
      ) : (
        <>
          {upcomingAppointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="border-l-4 border-primary pl-4 py-4 mb-4 bg-secondary/10 rounded-r-lg hover:bg-secondary/20 transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div>
                  <h3 className="font-medium text-foreground">{appointment.title}</h3>
                  <p className="text-sm text-foreground/70 flex items-center mt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2"></span>
                    {appointment.clinicianName} - {appointment.location}
                  </p>
                </div>
                <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-0">
                  <p className="text-sm font-medium text-foreground px-2 py-1 bg-primary/10 rounded-full">
                    {formatDate(appointment.dateTime)}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    {formatAppointmentTime(appointment.dateTime)}
                  </p>
                </div>
              </div>
              <div className="flex mt-3 space-x-2">
                <Button variant="outline" size="sm" className="h-8 text-xs bg-white hover:bg-primary/5 border-primary/20 text-primary hover:text-primary">
                  <Edit className="h-3 w-3 mr-1" />
                  Reschedule
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs bg-white hover:bg-primary/5 border-primary/20 text-primary hover:text-primary">
                  <Map className="h-3 w-3 mr-1" />
                  Directions
                </Button>
              </div>
            </div>
          ))}
          
          <Link href="/appointments" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center justify-center mt-5 py-2 border-t border-primary/10">
            View all appointments
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </Link>
        </>
      )}
    </div>
  );
}
