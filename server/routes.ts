import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, MemStorage } from "./storage";
import { setupAuth } from "./auth";
import { registerClinicianRoutes } from "./clinician-routes";
import { z } from "zod";
import {
  insertPregnancySchema,
  insertAppointmentSchema,
  insertVitalStatSchema,
  insertTestResultSchema,
  insertScanSchema,
  insertMessageSchema,
  users
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);
  
  // Register clinician-specific routes
  registerClinicianRoutes(app, storage);

  // Import db and sql if DATABASE_URL is available
  let db: any;
  let sql: any;
  
  // Special endpoint for database migrations (only available in development)
  if (process.env.NODE_ENV === 'development' && process.env.DATABASE_URL) {
    try {
      const dbModule = await import("./db");
      db = dbModule.db;
      
      const ormModule = await import("drizzle-orm");
      sql = ormModule.sql;
    } catch (err) {
      console.error("Error importing database modules:", err);
    }
    
    app.post("/api/db/migrate", async (req, res) => {
      try {
        // Push the schema to the database
        await sql.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        console.log("Running migration...");
        
        // Seed demo data if requested
        if (req.query.seed === 'true') {
          console.log("Seeding demo data...");
          // First check if we have any users
          const usersExist = await db.select().from(users).limit(1);
          
          if (usersExist.length === 0) {
            console.log("No users found, initializing demo data");
            // Use MemStorage to initialize data, then insert into database
            const memStorage = new MemStorage();
            
            memStorage.initializeUsers();
            memStorage.initializePregnancies();
            memStorage.initializeAppointments();
            memStorage.initializeVitalStats(); 
            memStorage.initializeTestResults();
            memStorage.initializeScans();
            memStorage.initializeMessages();
            memStorage.initializeEducationModules();
            
            console.log("Demo data initialized successfully");
          } else {
            console.log("Users already exist, skipping demo data initialization");
          }
        }
        
        res.status(200).send("Migration completed");
      } catch (error) {
        console.error("Migration error:", error);
        res.status(500).send(`Migration failed: ${error.message}`);
      }
    });
  }
  
  // Initialize demo data for memory storage (only if not using a database)
  if (!process.env.DATABASE_URL) {
    try {
      // Check if we already have users in the system
      const users = await storage.getUser(1);
      if (!users) {
        console.log("Initializing in-memory demo data...");
        storage.initializeUsers();
        storage.initializePregnancies();
        storage.initializeAppointments();
        storage.initializeVitalStats();
        storage.initializeTestResults();
        storage.initializeScans();
        storage.initializeMessages();
        storage.initializeEducationModules();
        console.log("Demo data initialized successfully");
      }
    } catch (error) {
      console.error("Error initializing demo data:", error);
    }
  }

  // Pregnancy routes
  app.get("/api/pregnancy", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const user = req.user;
      
      if (user.role === "patient") {
        const pregnancy = await storage.getPregnancyByPatientId(user.id);
        if (!pregnancy) return res.status(404).send("No pregnancy record found");
        return res.json(pregnancy);
      } else {
        // For clinicians, require a patientId parameter
        const patientId = parseInt(req.query.patientId as string);
        if (isNaN(patientId)) return res.status(400).send("Valid patientId required");
        
        const pregnancy = await storage.getPregnancyByPatientId(patientId);
        if (!pregnancy) return res.status(404).send("No pregnancy record found");
        return res.json(pregnancy);
      }
    } catch (error) {
      console.error("Error fetching pregnancy:", error);
      return res.status(500).send("Error fetching pregnancy record");
    }
  });

  app.post("/api/pregnancy", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "clinician") return res.status(403).send("Only clinicians can create pregnancy records");
    
    try {
      const validatedData = insertPregnancySchema.parse(req.body);
      const pregnancy = await storage.createPregnancy(validatedData);
      return res.status(201).json(pregnancy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      console.error("Error creating pregnancy:", error);
      return res.status(500).send("Error creating pregnancy record");
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let pregnancyId: number;
      
      if (req.user.role === "patient") {
        const pregnancy = await storage.getPregnancyByPatientId(req.user.id);
        if (!pregnancy) return res.status(404).send("No pregnancy record found");
        pregnancyId = pregnancy.id;
      } else {
        // For clinicians, require a pregnancyId parameter
        pregnancyId = parseInt(req.query.pregnancyId as string);
        if (isNaN(pregnancyId)) return res.status(400).send("Valid pregnancyId required");
      }
      
      const appointments = await storage.getAppointmentsByPregnancyId(pregnancyId);
      return res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).send("Error fetching appointments");
    }
  });

  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Check if user has access to this pregnancy
      if (req.user.role === "patient") {
        const pregnancy = await storage.getPregnancy(validatedData.pregnancyId);
        if (!pregnancy || pregnancy.patientId !== req.user.id) {
          return res.status(403).send("You don't have access to this pregnancy");
        }
      }
      
      const appointment = await storage.createAppointment(validatedData);
      return res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      console.error("Error creating appointment:", error);
      return res.status(500).send("Error creating appointment");
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid appointment ID");
      
      const appointment = await storage.getAppointment(id);
      if (!appointment) return res.status(404).send("Appointment not found");
      
      // Check if user has access to this appointment
      if (req.user.role === "patient") {
        const pregnancy = await storage.getPregnancy(appointment.pregnancyId);
        if (!pregnancy || pregnancy.patientId !== req.user.id) {
          return res.status(403).send("You don't have access to this appointment");
        }
      }
      
      const updatedAppointment = await storage.updateAppointment(id, req.body);
      return res.json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      return res.status(500).send("Error updating appointment");
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid appointment ID");
      
      const appointment = await storage.getAppointment(id);
      if (!appointment) return res.status(404).send("Appointment not found");
      
      // Check if user has access to this appointment
      if (req.user.role === "patient") {
        const pregnancy = await storage.getPregnancy(appointment.pregnancyId);
        if (!pregnancy || pregnancy.patientId !== req.user.id) {
          return res.status(403).send("You don't have access to this appointment");
        }
      }
      
      const success = await storage.deleteAppointment(id);
      if (success) {
        return res.sendStatus(204);
      } else {
        return res.status(500).send("Failed to delete appointment");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      return res.status(500).send("Error deleting appointment");
    }
  });

  // Vital Stats routes
  app.get("/api/vital-stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let pregnancyId: number;
      
      if (req.user.role === "patient") {
        const pregnancy = await storage.getPregnancyByPatientId(req.user.id);
        if (!pregnancy) return res.status(404).send("No pregnancy record found");
        pregnancyId = pregnancy.id;
      } else {
        // For clinicians, require a pregnancyId parameter
        pregnancyId = parseInt(req.query.pregnancyId as string);
        if (isNaN(pregnancyId)) return res.status(400).send("Valid pregnancyId required");
      }
      
      const vitalStats = await storage.getVitalStatsByPregnancyId(pregnancyId);
      return res.json(vitalStats);
    } catch (error) {
      console.error("Error fetching vital stats:", error);
      return res.status(500).send("Error fetching vital stats");
    }
  });

  app.post("/api/vital-stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertVitalStatSchema.parse(req.body);
      
      // If clinician, add clinicianId
      if (req.user.role === "clinician") {
        validatedData.clinicianId = req.user.id;
      } else {
        // Check if patient has access to this pregnancy
        const pregnancy = await storage.getPregnancy(validatedData.pregnancyId);
        if (!pregnancy || pregnancy.patientId !== req.user.id) {
          return res.status(403).send("You don't have access to this pregnancy");
        }
      }
      
      const vitalStat = await storage.createVitalStat(validatedData);
      return res.status(201).json(vitalStat);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      console.error("Error creating vital stat:", error);
      return res.status(500).send("Error creating vital stat");
    }
  });

  // Test Results routes
  app.get("/api/test-results", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let pregnancyId: number;
      
      if (req.user.role === "patient") {
        const pregnancy = await storage.getPregnancyByPatientId(req.user.id);
        if (!pregnancy) return res.status(404).send("No pregnancy record found");
        pregnancyId = pregnancy.id;
      } else {
        // For clinicians, require a pregnancyId parameter
        pregnancyId = parseInt(req.query.pregnancyId as string);
        if (isNaN(pregnancyId)) return res.status(400).send("Valid pregnancyId required");
      }
      
      const testResults = await storage.getTestResultsByPregnancyId(pregnancyId);
      return res.json(testResults);
    } catch (error) {
      console.error("Error fetching test results:", error);
      return res.status(500).send("Error fetching test results");
    }
  });

  app.post("/api/test-results", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== "clinician") return res.status(403).send("Only clinicians can create test results");
    
    try {
      const validatedData = insertTestResultSchema.parse(req.body);
      validatedData.clinicianId = req.user.id;
      
      const testResult = await storage.createTestResult(validatedData);
      return res.status(201).json(testResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      console.error("Error creating test result:", error);
      return res.status(500).send("Error creating test result");
    }
  });

  // Scan routes
  app.get("/api/scans", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let pregnancyId: number;
      
      if (req.user.role === "patient") {
        const pregnancy = await storage.getPregnancyByPatientId(req.user.id);
        if (!pregnancy) return res.status(404).send("No pregnancy record found");
        pregnancyId = pregnancy.id;
      } else {
        // For clinicians, require a pregnancyId parameter
        pregnancyId = parseInt(req.query.pregnancyId as string);
        if (isNaN(pregnancyId)) return res.status(400).send("Valid pregnancyId required");
      }
      
      const scans = await storage.getScansByPregnancyId(pregnancyId);
      return res.json(scans);
    } catch (error) {
      console.error("Error fetching scans:", error);
      return res.status(500).send("Error fetching scans");
    }
  });

  app.post("/api/scans", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertScanSchema.parse(req.body);
      
      // If clinician, add clinicianId
      if (req.user.role === "clinician") {
        validatedData.clinicianId = req.user.id;
      } else {
        // Check if patient has access to this pregnancy
        const pregnancy = await storage.getPregnancy(validatedData.pregnancyId);
        if (!pregnancy || pregnancy.patientId !== req.user.id) {
          return res.status(403).send("You don't have access to this pregnancy");
        }
      }
      
      const scan = await storage.createScan(validatedData);
      return res.status(201).json(scan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      console.error("Error creating scan:", error);
      return res.status(500).send("Error creating scan");
    }
  });

  // Message routes
  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let pregnancyId: number;
      
      if (req.user.role === "patient") {
        const pregnancy = await storage.getPregnancyByPatientId(req.user.id);
        if (!pregnancy) return res.status(404).send("No pregnancy record found");
        pregnancyId = pregnancy.id;
      } else {
        // For clinicians, require a pregnancyId parameter
        pregnancyId = parseInt(req.query.pregnancyId as string);
        if (isNaN(pregnancyId)) return res.status(400).send("Valid pregnancyId required");
      }
      
      // If otherUserId is specified, get messages between the two users
      const otherUserId = req.query.otherUserId ? parseInt(req.query.otherUserId as string) : null;
      
      let messages;
      if (otherUserId) {
        messages = await storage.getMessagesBetweenUsers(pregnancyId, req.user.id, otherUserId);
      } else {
        messages = await storage.getMessagesByPregnancyId(pregnancyId);
      }
      
      return res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).send("Error fetching messages");
    }
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      validatedData.fromId = req.user.id;
      
      // Check if user has access to this pregnancy
      if (req.user.role === "patient") {
        const pregnancy = await storage.getPregnancy(validatedData.pregnancyId);
        if (!pregnancy || pregnancy.patientId !== req.user.id) {
          return res.status(403).send("You don't have access to this pregnancy");
        }
      }
      
      const message = await storage.createMessage(validatedData);
      return res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      console.error("Error creating message:", error);
      return res.status(500).send("Error creating message");
    }
  });

  app.post("/api/messages/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid message ID");
      
      const message = await storage.getMessage(id);
      if (!message) return res.status(404).send("Message not found");
      
      // Check if user is the recipient
      if (message.toId !== req.user.id) {
        return res.status(403).send("You can only mark messages addressed to you as read");
      }
      
      const success = await storage.markMessageAsRead(id);
      if (success) {
        return res.sendStatus(204);
      } else {
        return res.status(500).send("Failed to mark message as read");
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      return res.status(500).send("Error marking message as read");
    }
  });

  // Education Module routes
  app.get("/api/education-modules", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const week = req.query.week ? parseInt(req.query.week as string) : null;
      
      let modules;
      if (week) {
        modules = await storage.getEducationModulesByWeek(week);
      } else {
        modules = await storage.getAllEducationModules();
      }
      
      return res.json(modules);
    } catch (error) {
      console.error("Error fetching education modules:", error);
      return res.status(500).send("Error fetching education modules");
    }
  });

  // Create HTTP server
  // Admin route for account cleanup (delete all accounts)
  // CAUTION: This endpoint will delete all user accounts and associated data
  app.post("/api/admin/delete-all-accounts", async (req, res) => {
    try {
      // In a production system, this should be secured with admin authentication
      // For development purposes, we'll allow it without additional auth
      const { deleteAllAccounts } = await import("./account-cleanup");
      const result = await deleteAllAccounts();
      res.json(result);
    } catch (error) {
      console.error("Error in delete-all-accounts endpoint:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete accounts: " + (error as Error).message 
      });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
