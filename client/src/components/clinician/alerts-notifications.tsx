import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface AlertsNotificationsProps {
  limit?: number;
  onViewAlert?: (alertId: number) => void;
}

// Alert type definition
interface ClinicalAlert {
  id: number;
  title: string;
  description: string;
  patientName: string;
  date: string;
  severity: "low" | "medium" | "high";
  type: "test_result" | "vital_sign" | "appointment" | "system";
}

export default function AlertsNotifications({ 
  limit = 5, 
  onViewAlert 
}: AlertsNotificationsProps) {
  // In a real app, we'd fetch alerts from the backend
  const { data: alerts, isLoading } = useQuery<ClinicalAlert[]>({
    queryKey: ["/api/clinician/alerts"],
    queryFn: async () => {
      // Demo data for display purposes
      return [
        {
          id: 1,
          title: "Abnormal Test Result",
          description: "Blood pressure reading is above normal range",
          patientName: "Sarah Johnson",
          date: new Date().toLocaleDateString(),
          severity: "high",
          type: "test_result"
        },
        {
          id: 2,
          title: "Missed Appointment",
          description: "Patient missed 28-week checkup appointment",
          patientName: "Emily Williams",
          date: new Date().toLocaleDateString(),
          severity: "medium",
          type: "appointment"
        },
        {
          id: 3,
          title: "New Test Result",
          description: "Glucose tolerance test results available for review",
          patientName: "Sarah Johnson",
          date: new Date().toLocaleDateString(),
          severity: "low",
          type: "test_result"
        }
      ];
    },
    enabled: false, // Disable actual fetching for demo
  });
  
  // Demo data for display purposes
  const demoAlerts: ClinicalAlert[] = [
    {
      id: 1,
      title: "Abnormal Test Result",
      description: "Blood pressure reading is above normal range",
      patientName: "Sarah Johnson",
      date: new Date().toLocaleDateString(),
      severity: "high",
      type: "test_result"
    },
    {
      id: 2,
      title: "Missed Appointment",
      description: "Patient missed 28-week checkup appointment",
      patientName: "Emily Williams",
      date: new Date().toLocaleDateString(),
      severity: "medium",
      type: "appointment"
    },
    {
      id: 3,
      title: "New Test Result",
      description: "Glucose tolerance test results available for review",
      patientName: "Sarah Johnson",
      date: new Date().toLocaleDateString(),
      severity: "low",
      type: "test_result"
    }
  ];
  
  const displayAlerts = alerts || demoAlerts;
  const limitedAlerts = displayAlerts.slice(0, limit);
  
  const getSeverityStyles = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-100 text-red-600";
      case "medium":
        return "bg-yellow-50 border-yellow-100 text-yellow-600";
      case "low":
        return "bg-blue-50 border-blue-100 text-blue-600";
      default:
        return "bg-gray-50 border-gray-100 text-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader className="bg-red-50 border-b border-red-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <CardTitle className="text-red-700">Alerts & Notifications</CardTitle>
          </div>
          <Badge variant="outline" className="bg-white">
            {isLoading ? "Loading..." : displayAlerts.length} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="text-center py-4">Loading alerts...</div>
        ) : limitedAlerts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No alerts or notifications</div>
        ) : (
          <ul className="space-y-3">
            {limitedAlerts.map((alert) => (
              <li 
                key={alert.id} 
                className={`flex items-start p-3 rounded-md border ${getSeverityStyles(alert.severity)}`}
              >
                <AlertCircle className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${alert.severity === "high" ? "text-red-600" : alert.severity === "medium" ? "text-yellow-600" : "text-blue-600"}`} />
                <div>
                  <p className="font-medium text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-700">{alert.description}</p>
                  <div className="flex items-center mt-1 space-x-3">
                    <Badge variant="secondary" className="text-xs">
                      {alert.patientName}
                    </Badge>
                    <p className="text-xs text-gray-500">{alert.date}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="link" 
                  className="ml-auto"
                  onClick={() => onViewAlert?.(alert.id)}
                >
                  View
                </Button>
              </li>
            ))}
            
            {displayAlerts.length > limit && (
              <Button variant="link" className="w-full text-center mt-2">
                View all {displayAlerts.length} alerts
              </Button>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}