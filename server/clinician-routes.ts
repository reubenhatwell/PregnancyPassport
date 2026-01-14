import { Express, Request, Response } from "express";
import { z } from "zod";
import { IStorage } from "./storage";

// Type for patient assignment
const patientAssignmentSchema = z.object({
  patientId: z.number(),
  clinicianId: z.number(),
});

// Type for alerts
interface ClinicalAlert {
  id: number;
  title: string;
  description: string;
  patientId: number;
  patientName: string;
  date: string;
  severity: "low" | "medium" | "high";
  type: "test_result" | "vital_sign" | "appointment" | "system";
  read: boolean;
}

// Type for clinical notes
interface ClinicalNote {
  id: number;
  pregnancyId: number;
  patientId: number;
  clinicianId: number;
  title: string;
  content: string;
  category: string;
  dateCreated: string;
  dateModified: string;
}

export function registerClinicianRoutes(app: Express, storage: IStorage) {
  // Middleware to check if user is a clinician
  const isClinicianMiddleware = (req: Request, res: Response, next: Function) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    if (req.user.role !== "clinician") return res.status(403).send("Forbidden: Clinician access only");
    next();
  };

  // Get all patients assigned to a clinician
  app.get("/api/patients", isClinicianMiddleware, async (req: Request, res: Response) => {
    try {
      // In a real app, we would get patients assigned to this specific clinician
      // For this demo, we'll return all patients with role = "patient"
      const patients = await storage.getAllPatients();
      return res.json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      return res.status(500).send("Error fetching patients");
    }
  });

  // Get patient details
  app.get("/api/patients/:id", isClinicianMiddleware, async (req: Request, res: Response) => {
    try {
      const patientId = parseInt(req.params.id);
      const patient = await storage.getUser(patientId);
      
      if (!patient) {
        return res.status(404).send("Patient not found");
      }
      
      if (patient.role !== "patient") {
        return res.status(400).send("Not a patient record");
      }
      
      return res.json(patient);
    } catch (error) {
      console.error("Error fetching patient:", error);
      return res.status(500).send("Error fetching patient");
    }
  });

  // Assign patient to clinician
  app.post("/api/patients/assign", isClinicianMiddleware, async (req: Request, res: Response) => {
    try {
      const { patientId, clinicianId } = patientAssignmentSchema.parse(req.body);
      
      // In a real app, we would update the assignment in the database
      // For this demo, we'll just return success
      
      return res.json({ success: true, message: "Patient assigned successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      
      console.error("Error assigning patient:", error);
      return res.status(500).send("Error assigning patient");
    }
  });

  // Get all clinical alerts for a clinician
  app.get("/api/clinician/alerts", isClinicianMiddleware, async (req: Request, res: Response) => {
    try {
      // In a real app, we would get alerts from the database
      // For this demo, we'll return dummy data
      const demoAlerts: ClinicalAlert[] = [
        {
          id: 1,
          title: "Abnormal Test Result",
          description: "Blood pressure reading is above normal range",
          patientId: 1,
          patientName: "Sarah Johnson",
          date: new Date().toISOString(),
          severity: "high",
          type: "test_result",
          read: false
        },
        {
          id: 2,
          title: "Missed Appointment",
          description: "Patient missed 28-week checkup appointment",
          patientId: 3,
          patientName: "Emily Williams",
          date: new Date().toISOString(),
          severity: "medium",
          type: "appointment",
          read: false
        },
        {
          id: 3,
          title: "New Test Result",
          description: "Glucose tolerance test results available for review",
          patientId: 1,
          patientName: "Sarah Johnson",
          date: new Date().toISOString(),
          severity: "low",
          type: "test_result",
          read: false
        }
      ];
      
      return res.json(demoAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return res.status(500).send("Error fetching alerts");
    }
  });

  // Mark an alert as read
  app.post("/api/clinician/alerts/:id/read", isClinicianMiddleware, async (req: Request, res: Response) => {
    try {
      const alertId = parseInt(req.params.id);
      
      // In a real app, we would update the alert in the database
      // For this demo, we'll just return success
      
      return res.json({ success: true, message: "Alert marked as read" });
    } catch (error) {
      console.error("Error marking alert as read:", error);
      return res.status(500).send("Error marking alert as read");
    }
  });

  // Get clinician's appointments
  app.get("/api/clinician/appointments", isClinicianMiddleware, async (req: Request, res: Response) => {
    try {
      // In a real app, we would get appointments for this clinician
      // For now, we'll get all appointments from the storage
      const allAppointments = await storage.getAllAppointments();
      
      return res.json(allAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).send("Error fetching appointments");
    }
  });

  // Create an appointment
  app.post("/api/clinician/appointments", isClinicianMiddleware, async (req: Request, res: Response) => {
    try {
      // Use the existing appointment schema from the IStorage interface
      const appointment = await storage.createAppointment(req.body);
      return res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      
      console.error("Error creating appointment:", error);
      return res.status(500).send("Error creating appointment");
    }
  });

  // Get test results pending review
  app.get("/api/clinician/test-results/pending", isClinicianMiddleware, async (req: Request, res: Response) => {
    try {
      // In a real app, we would get pending test results from the database
      // For now, we'll get all test results and filter those with status="follow_up"
      const allTestResults = await storage.getAllTestResults();
      const pendingResults = allTestResults.filter(result => result.status === "follow_up");
      
      return res.json(pendingResults);
    } catch (error) {
      console.error("Error fetching pending test results:", error);
      return res.status(500).send("Error fetching pending test results");
    }
  });

  // Create clinical note
  app.post("/api/clinician/notes", isClinicianMiddleware, async (req: Request, res: Response) => {
    try {
      // In a real app, we would save this to the database
      // For this demo, we'll just return success
      
      return res.status(201).json({
        id: 1,
        ...req.body,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      
      console.error("Error creating clinical note:", error);
      return res.status(500).send("Error creating clinical note");
    }
  });

  // Get clinician statistics
  app.get("/api/clinician/statistics", isClinicianMiddleware, async (req: Request, res: Response) => {
    try {
      // In a real app, we would calculate these from the database
      // For this demo, we'll return dummy data
      
      const statistics = {
        patientCount: 15,
        appointmentsToday: 3,
        pendingTestResults: 4,
        alertsCount: 2,
        appointmentsThisWeek: 12,
        averageAppointmentDuration: 35, // minutes
        patientsByTrimester: {
          first: 4,
          second: 7,
          third: 4
        }
      };
      
      return res.json(statistics);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return res.status(500).send("Error fetching statistics");
    }
  });
}

// Add these helper methods to IStorage in storage.ts
export interface ClinicianStorageMethods {
  getAllPatients(): Promise<any[]>;
  getAllAppointments(): Promise<any[]>;
  getAllTestResults(): Promise<any[]>;
}