import { 
  users, appointments, pregnancies, vitalStats, testResults, 
  scans, messages, educationModules, educationProgress,
  healthProviders, patientProviderIntegrations, securityLogs,
  dataConsents,
  type User, type InsertUser,
  type Pregnancy, type InsertPregnancy,
  type Appointment, type InsertAppointment,
  type VitalStat, type InsertVitalStat,
  type TestResult, type InsertTestResult,
  type Scan, type InsertScan,
  type Message, type InsertMessage,
  type EducationModule, type InsertEducationModule,
  type EducationProgress, type InsertEducationProgress,
  type HealthProvider, type InsertHealthProvider,
  type PatientProviderIntegration, type InsertPatientProviderIntegration,
  type SecurityLog, type InsertSecurityLog,
  type DataConsent, type InsertDataConsent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { IStorage } from "./storage";
import connectPg from "connect-pg-simple";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Use an in-memory session store if db is not available
    if (process.env.DATABASE_URL) {
      const PgStore = connectPg(session);
      this.sessionStore = new PgStore({ 
        conObject: { connectionString: process.env.DATABASE_URL }, 
        createTableIfMissing: true 
      });
    } else {
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserBySupabaseUid(supabaseUid: string): Promise<User | undefined> {
    if (!db) return undefined;
    const [user] = await db.select().from(users).where(eq(users.supabaseUid, supabaseUid));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not available");
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUserPassword(userId: number, hashedPassword: string): Promise<boolean> {
    if (!db) return false;
    try {
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error("Error updating user password:", error);
      return false;
    }
  }

  // Pregnancy operations
  async getPregnancy(id: number): Promise<Pregnancy | undefined> {
    if (!db) return undefined;
    const [pregnancy] = await db.select().from(pregnancies).where(eq(pregnancies.id, id));
    return pregnancy;
  }

  async getPregnancyByPatientId(patientId: number): Promise<Pregnancy | undefined> {
    if (!db) return undefined;
    const [pregnancy] = await db.select().from(pregnancies).where(eq(pregnancies.patientId, patientId));
    return pregnancy;
  }

  async createPregnancy(insertPregnancy: InsertPregnancy): Promise<Pregnancy> {
    if (!db) throw new Error("Database not available");
    const [pregnancy] = await db.insert(pregnancies).values(insertPregnancy).returning();
    return pregnancy;
  }

  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async getAppointmentsByPregnancyId(pregnancyId: number): Promise<Appointment[]> {
    return db.select().from(appointments)
      .where(eq(appointments.pregnancyId, pregnancyId))
      .orderBy(appointments.dateTime);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<Appointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db.update(appointments)
      .set(appointmentUpdate)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return !!result;
  }

  // Vital Stats operations
  async getVitalStat(id: number): Promise<VitalStat | undefined> {
    const [stat] = await db.select().from(vitalStats).where(eq(vitalStats.id, id));
    return stat;
  }

  async getVitalStatsByPregnancyId(pregnancyId: number): Promise<VitalStat[]> {
    return db.select().from(vitalStats)
      .where(eq(vitalStats.pregnancyId, pregnancyId))
      .orderBy(desc(vitalStats.date));
  }

  async createVitalStat(insertVitalStat: InsertVitalStat): Promise<VitalStat> {
    const [stat] = await db.insert(vitalStats).values(insertVitalStat).returning();
    return stat;
  }

  // Test Results operations
  async getTestResult(id: number): Promise<TestResult | undefined> {
    const [result] = await db.select().from(testResults).where(eq(testResults.id, id));
    return result;
  }

  async getTestResultsByPregnancyId(pregnancyId: number): Promise<TestResult[]> {
    return db.select().from(testResults)
      .where(eq(testResults.pregnancyId, pregnancyId))
      .orderBy(desc(testResults.date));
  }

  async createTestResult(insertTestResult: InsertTestResult): Promise<TestResult> {
    const [result] = await db.insert(testResults).values(insertTestResult).returning();
    return result;
  }

  // Scan operations
  async getScan(id: number): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan;
  }

  async getScansByPregnancyId(pregnancyId: number): Promise<Scan[]> {
    return db.select().from(scans)
      .where(eq(scans.pregnancyId, pregnancyId))
      .orderBy(desc(scans.date));
  }

  async createScan(insertScan: InsertScan): Promise<Scan> {
    const [scan] = await db.insert(scans).values(insertScan).returning();
    return scan;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesByPregnancyId(pregnancyId: number): Promise<Message[]> {
    return db.select().from(messages)
      .where(eq(messages.pregnancyId, pregnancyId))
      .orderBy(messages.timestamp);
  }

  async getMessagesBetweenUsers(pregnancyId: number, user1Id: number, user2Id: number): Promise<Message[]> {
    return db.select().from(messages)
      .where(
        and(
          eq(messages.pregnancyId, pregnancyId),
          and(
            eq(messages.fromId, user1Id),
            eq(messages.toId, user2Id)
          )
        )
      )
      .orderBy(messages.timestamp);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    const result = await db.update(messages)
      .set({ read: true })
      .where(eq(messages.id, id));
    return !!result;
  }

  // Education Module operations
  async getEducationModule(id: number): Promise<EducationModule | undefined> {
    const [module] = await db.select().from(educationModules).where(eq(educationModules.id, id));
    return module;
  }

  async getEducationModulesByWeek(week: number): Promise<EducationModule[]> {
    // We'll parse the weekRange string to find modules that include this week
    const allModules = await this.getAllEducationModules();
    return allModules.filter(module => {
      const range = module.weekRange;
      if (range.includes("-")) {
        const [start, end] = range.split("-").map(w => parseInt(w.trim()));
        return week >= start && week <= end;
      } else {
        return parseInt(range.trim()) === week;
      }
    });
  }

  async getAllEducationModules(): Promise<EducationModule[]> {
    return db.select().from(educationModules);
  }

  async createEducationModule(insertModule: InsertEducationModule): Promise<EducationModule> {
    const [module] = await db.insert(educationModules).values(insertModule).returning();
    return module;
  }

  // Get all patients for clinician dashboard
  async getAllPatients(): Promise<User[]> {
    if (!db) return [];
    return db.select().from(users).where(eq(users.role, "patient"));
  }

  // Get all appointments for clinician view
  async getAllAppointments(): Promise<Appointment[]> {
    if (!db) return [];
    return db.select().from(appointments).orderBy(appointments.dateTime);
  }

  // Get all test results for clinician view
  async getAllTestResults(): Promise<TestResult[]> {
    if (!db) return [];
    return db.select().from(testResults).orderBy(desc(testResults.date));
  }

  // Education progress methods
  async getEducationProgressForUser(userId: number): Promise<EducationProgress[]> {
    if (!db) return [];
    return db.select().from(educationProgress).where(eq(educationProgress.userId, userId));
  }

  async createEducationProgress(insertProgress: InsertEducationProgress): Promise<EducationProgress> {
    if (!db) throw new Error("Database not available");
    const [progress] = await db.insert(educationProgress).values(insertProgress).returning();
    return progress;
  }

  async updateEducationProgress(id: number, updates: Partial<EducationProgress>): Promise<EducationProgress> {
    if (!db) throw new Error("Database not available");
    const [updated] = await db.update(educationProgress)
      .set({...updates, updatedAt: new Date()})
      .where(eq(educationProgress.id, id))
      .returning();
    return updated;
  }

  // Health Provider methods
  async getAllHealthProviders(): Promise<HealthProvider[]> {
    if (!db) return [];
    return db.select().from(healthProviders).where(eq(healthProviders.active, true));
  }

  async getHealthProvider(id: number): Promise<HealthProvider | undefined> {
    if (!db) return undefined;
    const [provider] = await db.select().from(healthProviders).where(eq(healthProviders.id, id));
    return provider;
  }

  async createHealthProvider(insertProvider: InsertHealthProvider): Promise<HealthProvider> {
    if (!db) throw new Error("Database not available");
    const [provider] = await db.insert(healthProviders).values(insertProvider).returning();
    return provider;
  }

  // Patient Provider Integration methods
  async getPatientIntegrations(patientId: number): Promise<PatientProviderIntegration[]> {
    if (!db) return [];
    return db.select().from(patientProviderIntegrations)
      .where(eq(patientProviderIntegrations.patientId, patientId));
  }

  async createPatientIntegration(insertIntegration: InsertPatientProviderIntegration): Promise<PatientProviderIntegration> {
    if (!db) throw new Error("Database not available");
    const [integration] = await db.insert(patientProviderIntegrations).values(insertIntegration).returning();
    return integration;
  }

  async updatePatientIntegration(id: number, updates: Partial<PatientProviderIntegration>): Promise<PatientProviderIntegration> {
    if (!db) throw new Error("Database not available");
    const [updated] = await db.update(patientProviderIntegrations)
      .set({...updates, updatedAt: new Date()})
      .where(eq(patientProviderIntegrations.id, id))
      .returning();
    return updated;
  }

  // Security and Logging methods
  async logSecurityEvent(insertLog: InsertSecurityLog): Promise<SecurityLog> {
    if (!db) throw new Error("Database not available");
    const [log] = await db.insert(securityLogs).values(insertLog).returning();
    return log;
  }

  async getUserSecurityLogs(userId: number): Promise<SecurityLog[]> {
    if (!db) return [];
    return db.select().from(securityLogs)
      .where(eq(securityLogs.userId, userId))
      .orderBy(desc(securityLogs.timestamp));
  }

  // Data Consent methods
  async getUserConsents(userId: number): Promise<DataConsent[]> {
    if (!db) return [];
    return db.select().from(dataConsents).where(eq(dataConsents.userId, userId));
  }

  async createDataConsent(insertConsent: InsertDataConsent): Promise<DataConsent> {
    if (!db) throw new Error("Database not available");
    const [consent] = await db.insert(dataConsents).values(insertConsent).returning();
    return consent;
  }

  async updateDataConsent(id: number, updates: Partial<DataConsent>): Promise<DataConsent> {
    if (!db) throw new Error("Database not available");
    const [updated] = await db.update(dataConsents)
      .set({...updates, updatedAt: new Date()})
      .where(eq(dataConsents.id, id))
      .returning();
    return updated;
  }

  // Demo data initialization methods
  // These are required by the IStorage interface but aren't needed for DB storage
  initializeUsers() {}
  initializePregnancies() {}
  initializeAppointments() {}
  initializeVitalStats() {}
  initializeTestResults() {}
  initializeScans() {}
  initializeMessages() {}
  initializeEducationModules() {}
}
