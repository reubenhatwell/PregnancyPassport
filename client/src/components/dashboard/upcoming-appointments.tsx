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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-heading font-semibold text-gray-900">Upcoming Appointments</h2>
        <Button variant="link" size="sm" asChild>
          <Link href="/appointments">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Link>
        </Button>
      </div>
      
      {upcomingAppointments.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No upcoming appointments scheduled.</p>
          <Button variant="outline" className="mt-2" asChild>
            <Link href="/appointments">Schedule an appointment</Link>
          </Button>
        </div>
      ) : (
        <>
          {upcomingAppointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="border-l-4 border-primary-500 pl-4 py-3 mb-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                  <p className="text-sm text-gray-600">
                    {appointment.clinicianName} - {appointment.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(appointment.dateTime)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatAppointmentTime(appointment.dateTime)}
                  </p>
                </div>
              </div>
              <div className="flex mt-2 space-x-2">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Edit className="h-3 w-3 mr-1" />
                  Reschedule
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Map className="h-3 w-3 mr-1" />
                  Directions
                </Button>
              </div>
            </div>
          ))}
          
          <Link href="/appointments" className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center justify-center mt-4">
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
