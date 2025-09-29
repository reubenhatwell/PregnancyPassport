import { 
  users, 
  User, 
  InsertUser,
  pregnancies,
  Pregnancy,
  InsertPregnancy,
  appointments,
  Appointment,
  InsertAppointment,
  vitalStats,
  VitalStat,
  InsertVitalStat,
  testResults,
  TestResult,
  InsertTestResult,
  scans,
  Scan,
  InsertScan,
  messages,
  Message,
  InsertMessage,
  educationModules,
  EducationModule,
  InsertEducationModule,
  securityLogs,
  SecurityLog,
  InsertSecurityLog,
  dataConsents,
  DataConsent,
  InsertDataConsent,
  patientVisits,
  PatientVisit,
  InsertPatientVisit,
  immunisationHistory,
  ImmunisationHistory,
  InsertImmunisationHistory
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

type SessionStore = session.Store;

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<boolean>;
  getAllPatients(): Promise<User[]>; // Get all users with role="patient"
  
  // Security audit logging
  logSecurityEvent(insertLog: InsertSecurityLog): Promise<SecurityLog>;
  getUserSecurityLogs(userId: number): Promise<SecurityLog[]>;
  
  // Pregnancy operations
  getPregnancy(id: number): Promise<Pregnancy | undefined>;
  getPregnancyByPatientId(patientId: number): Promise<Pregnancy | undefined>;
  createPregnancy(pregnancy: InsertPregnancy): Promise<Pregnancy>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByPregnancyId(pregnancyId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  getAllAppointments(): Promise<Appointment[]>; // Get all appointments for clinician view
  
  // Vital Stats operations
  getVitalStat(id: number): Promise<VitalStat | undefined>;
  getVitalStatsByPregnancyId(pregnancyId: number): Promise<VitalStat[]>;
  createVitalStat(vitalStat: InsertVitalStat): Promise<VitalStat>;
  
  // Test Results operations
  getTestResult(id: number): Promise<TestResult | undefined>;
  getTestResultsByPregnancyId(pregnancyId: number): Promise<TestResult[]>;
  createTestResult(testResult: InsertTestResult): Promise<TestResult>;
  getAllTestResults(): Promise<TestResult[]>; // Get all test results for clinician view
  
  // Scan operations
  getScan(id: number): Promise<Scan | undefined>;
  getScansByPregnancyId(pregnancyId: number): Promise<Scan[]>;
  createScan(scan: InsertScan): Promise<Scan>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByPregnancyId(pregnancyId: number): Promise<Message[]>;
  getMessagesBetweenUsers(pregnancyId: number, user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<boolean>;
  
  // Education Module operations
  getEducationModule(id: number): Promise<EducationModule | undefined>;
  getEducationModulesByWeek(week: number): Promise<EducationModule[]>;
  getAllEducationModules(): Promise<EducationModule[]>;
  createEducationModule(module: InsertEducationModule): Promise<EducationModule>;
  
  // Patient Visit operations
  getPatientVisit(id: number): Promise<PatientVisit | undefined>;
  getPatientVisitsByPregnancyId(pregnancyId: number): Promise<PatientVisit[]>;
  createPatientVisit(visit: InsertPatientVisit): Promise<PatientVisit>;
  updatePatientVisit(id: number, visitUpdate: Partial<PatientVisit>): Promise<PatientVisit | undefined>;
  deletePatientVisit(id: number): Promise<boolean>;
  
  // Immunisation History operations
  getImmunisationHistory(id: number): Promise<ImmunisationHistory | undefined>;
  getImmunisationHistoryByPregnancyId(pregnancyId: number): Promise<ImmunisationHistory | undefined>;
  createImmunisationHistory(history: InsertImmunisationHistory): Promise<ImmunisationHistory>;
  updateImmunisationHistory(id: number, historyUpdate: Partial<ImmunisationHistory>): Promise<ImmunisationHistory | undefined>;
  
  // Initialize methods for demo data
  initializeUsers(): void;
  initializePregnancies(): void;
  initializeAppointments(): void;
  initializeVitalStats(): void;
  initializeTestResults(): void;
  initializeScans(): void;
  initializeMessages(): void;
  initializeEducationModules(): void;
  
  // Session store
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private pregnancies: Map<number, Pregnancy>;
  private appointments: Map<number, Appointment>;
  private vitalStats: Map<number, VitalStat>;
  private testResults: Map<number, TestResult>;
  private scans: Map<number, Scan>;
  private messages: Map<number, Message>;
  private educationModules: Map<number, EducationModule>;
  private patientVisits: Map<number, PatientVisit>;
  private immunisationHistory: Map<number, ImmunisationHistory>;
  private securityLogs: Map<number, SecurityLog>;
  private dataConsents: Map<number, DataConsent>;
  
  sessionStore: SessionStore;
  
  private userIdCounter: number;
  private pregnancyIdCounter: number;
  private appointmentIdCounter: number;
  private vitalStatIdCounter: number;
  private testResultIdCounter: number;
  private scanIdCounter: number;
  private messageIdCounter: number;
  private educationModuleIdCounter: number;
  private patientVisitIdCounter: number;
  private immunisationHistoryIdCounter: number;
  private securityLogIdCounter: number;
  private dataConsentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.pregnancies = new Map();
    this.appointments = new Map();
    this.vitalStats = new Map();
    this.testResults = new Map();
    this.scans = new Map();
    this.messages = new Map();
    this.educationModules = new Map();
    this.patientVisits = new Map();
    this.immunisationHistory = new Map();
    this.securityLogs = new Map();
    this.dataConsents = new Map();
    
    this.userIdCounter = 1;
    this.pregnancyIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.vitalStatIdCounter = 1;
    this.testResultIdCounter = 1;
    this.scanIdCounter = 1;
    this.messageIdCounter = 1;
    this.educationModuleIdCounter = 1;
    this.patientVisitIdCounter = 1;
    this.immunisationHistoryIdCounter = 1;
    this.securityLogIdCounter = 1;
    this.dataConsentIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initializeUsers();
    this.initializePregnancies();
    this.initializeAppointments();
    this.initializeVitalStats();
    this.initializeTestResults();
    this.initializeScans();
    this.initializeMessages();
    this.initializeEducationModules();
    this.initializeImmunisationHistory();
  }

  // User Operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPassword(userId: number, hashedPassword: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;
    
    user.password = hashedPassword;
    this.users.set(userId, user);
    return true;
  }

  // Pregnancy Operations
  async getPregnancy(id: number): Promise<Pregnancy | undefined> {
    return this.pregnancies.get(id);
  }
  
  async getPregnancyByPatientId(patientId: number): Promise<Pregnancy | undefined> {
    return Array.from(this.pregnancies.values()).find(
      (pregnancy) => pregnancy.patientId === patientId,
    );
  }
  
  async createPregnancy(insertPregnancy: InsertPregnancy): Promise<Pregnancy> {
    const id = this.pregnancyIdCounter++;
    const pregnancy: Pregnancy = { ...insertPregnancy, id };
    this.pregnancies.set(id, pregnancy);
    return pregnancy;
  }
  
  // Appointment Operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getAppointmentsByPregnancyId(pregnancyId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.pregnancyId === pregnancyId,
    );
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const appointment: Appointment = { ...insertAppointment, id };
    this.appointments.set(id, appointment);
    return appointment;
  }
  
  async updateAppointment(id: number, appointmentUpdate: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = await this.getAppointment(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...appointmentUpdate };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }
  
  // Vital Stats Operations
  async getVitalStat(id: number): Promise<VitalStat | undefined> {
    return this.vitalStats.get(id);
  }
  
  async getVitalStatsByPregnancyId(pregnancyId: number): Promise<VitalStat[]> {
    return Array.from(this.vitalStats.values())
      .filter((stat) => stat.pregnancyId === pregnancyId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async createVitalStat(insertVitalStat: InsertVitalStat): Promise<VitalStat> {
    const id = this.vitalStatIdCounter++;
    const vitalStat: VitalStat = { ...insertVitalStat, id };
    this.vitalStats.set(id, vitalStat);
    return vitalStat;
  }
  
  // Test Results Operations
  async getTestResult(id: number): Promise<TestResult | undefined> {
    return this.testResults.get(id);
  }
  
  async getTestResultsByPregnancyId(pregnancyId: number): Promise<TestResult[]> {
    return Array.from(this.testResults.values())
      .filter((result) => result.pregnancyId === pregnancyId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async createTestResult(insertTestResult: InsertTestResult): Promise<TestResult> {
    const id = this.testResultIdCounter++;
    const testResult: TestResult = { ...insertTestResult, id };
    this.testResults.set(id, testResult);
    return testResult;
  }
  
  // Scan Operations
  async getScan(id: number): Promise<Scan | undefined> {
    return this.scans.get(id);
  }
  
  async getScansByPregnancyId(pregnancyId: number): Promise<Scan[]> {
    return Array.from(this.scans.values())
      .filter((scan) => scan.pregnancyId === pregnancyId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async createScan(insertScan: InsertScan): Promise<Scan> {
    const id = this.scanIdCounter++;
    const scan: Scan = { ...insertScan, id };
    this.scans.set(id, scan);
    return scan;
  }
  
  // Message Operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesByPregnancyId(pregnancyId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.pregnancyId === pregnancyId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  async getMessagesBetweenUsers(pregnancyId: number, user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => 
        message.pregnancyId === pregnancyId && 
        ((message.fromId === user1Id && message.toId === user2Id) || 
         (message.fromId === user2Id && message.toId === user1Id))
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: new Date(),
      read: false
    };
    this.messages.set(id, message);
    return message;
  }
  
  async markMessageAsRead(id: number): Promise<boolean> {
    const message = await this.getMessage(id);
    if (!message) return false;
    
    message.read = true;
    this.messages.set(id, message);
    return true;
  }
  
  // Education Module Operations
  async getEducationModule(id: number): Promise<EducationModule | undefined> {
    return this.educationModules.get(id);
  }
  
  async getEducationModulesByWeek(week: number): Promise<EducationModule[]> {
    return Array.from(this.educationModules.values()).filter((module) => {
      const [start, end] = module.weekRange.split('-').map(Number);
      return week >= start && week <= end;
    });
  }
  
  async getAllEducationModules(): Promise<EducationModule[]> {
    return Array.from(this.educationModules.values());
  }
  
  async createEducationModule(insertModule: InsertEducationModule): Promise<EducationModule> {
    const id = this.educationModuleIdCounter++;
    const module: EducationModule = { ...insertModule, id };
    this.educationModules.set(id, module);
    return module;
  }
  
  // Clinician methods
  async getAllPatients(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "patient");
  }
  
  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }
  
  async getAllTestResults(): Promise<TestResult[]> {
    return Array.from(this.testResults.values());
  }
  
  // Initialize methods for demo data
  initializeUsers() {
    // Create a patient user
    const patient = {
      id: this.userIdCounter++,
      username: "sarah.patient",
      // Using different secure hashes for each user - DO NOT add plaintext comments
      password: "$2b$10$L9TkHyOvMFGJPe4P.OeZ8OM5FsWfvmW1QWab12hzD0kl/G1.seM5W",
      email: "sarah@example.com",
      firstName: "Sarah",
      lastName: "Johnson",
      role: "patient" as const
    };
    this.users.set(patient.id, patient);
    
    // Create a clinician user
    const clinician = {
      id: this.userIdCounter++,
      username: "dr.smith",
      password: "$2b$10$HQBpMvZZ4ThLmGIGt7NDWu7.QVPbFfEMyCJTF5BQvkJO.mmWV3Yl.",
      email: "dr.smith@hospital.com",
      firstName: "Jane",
      lastName: "Smith",
      role: "clinician" as const
    };
    this.users.set(clinician.id, clinician);
    
    // Create another patient user
    const patient2 = {
      id: this.userIdCounter++,
      username: "emily.williams",
      password: "$2b$10$dX4j.RCc7XHm6TxuOiWk8.upLQa0W9.yfPX1RbTL6PV4WHJYkZ8zK",
      email: "emily@example.com",
      firstName: "Emily",
      lastName: "Williams",
      role: "patient" as const
    };
    this.users.set(patient2.id, patient2);
    
    // Create beta testing clinician (password: Clinitian1!)
    const betaClinician = {
      id: this.userIdCounter++,
      username: "clinitian1",
      password: "5640f2d6163358b906a273592021b5ec44d37b64f69bcb918a03d436e77ac2ff7cf219cd1f64a2f544ed272fcf38ae4eedd2f8a45b470e161194cad5899bb040.319223de532312449a70ac1b347ba80c",
      email: "clinitian1@test.com",
      firstName: "Beta",
      lastName: "Clinician",
      role: "clinician" as const
    };
    this.users.set(betaClinician.id, betaClinician);
  }
  
  initializePregnancies() {
    // Pregnancy for Sarah Johnson (patient id 1)
    const pregnancy1 = {
      id: this.pregnancyIdCounter++,
      patientId: 1, // Sarah Johnson
      dueDate: "2025-08-15", // About 28 weeks along from today
      startDate: "2024-11-08", // Conception date
      notes: "First pregnancy, low risk, normal progression"
    };
    this.pregnancies.set(pregnancy1.id, pregnancy1);
    
    // Pregnancy for Emily Williams (patient id 3)
    const pregnancy2 = {
      id: this.pregnancyIdCounter++,
      patientId: 3, // Emily Williams
      dueDate: "2025-10-23", // About 16 weeks along from today
      startDate: "2025-01-16", // Conception date
      notes: "Second pregnancy, previous C-section"
    };
    this.pregnancies.set(pregnancy2.id, pregnancy2);
  }
  
  initializeAppointments() {
    // Past appointments for Sarah Johnson
    const pastAppointments = [
      {
        id: this.appointmentIdCounter++,
        pregnancyId: 1,
        title: "Initial Prenatal Visit",
        description: "First pregnancy confirmation and initial assessment",
        location: "Women's Health Center",
        clinicianName: "Dr. Jane Smith",
        dateTime: "2024-12-05T10:00:00Z",
        duration: 60,
        notes: "Confirmed pregnancy, provided prenatal vitamins prescription",
        completed: true
      },
      {
        id: this.appointmentIdCounter++,
        pregnancyId: 1,
        title: "12-Week Ultrasound",
        description: "First trimester screening and nuchal translucency scan",
        location: "Women's Health Center",
        clinicianName: "Dr. Jane Smith",
        dateTime: "2025-01-28T14:30:00Z",
        duration: 45,
        notes: "Normal development, low risk assessment",
        completed: true
      },
      {
        id: this.appointmentIdCounter++,
        pregnancyId: 1,
        title: "20-Week Anatomy Scan",
        description: "Detailed ultrasound to check baby's development",
        location: "Imaging Department, City Hospital",
        clinicianName: "Dr. Michael Chen",
        dateTime: "2025-03-15T11:15:00Z",
        duration: 60,
        notes: "All anatomical structures developing normally",
        completed: true
      }
    ];
    
    // Future appointments for Sarah Johnson
    const futureAppointments = [
      {
        id: this.appointmentIdCounter++,
        pregnancyId: 1,
        title: "28-Week Checkup",
        description: "Glucose screening test and routine checkup",
        location: "Women's Health Center",
        clinicianName: "Dr. Jane Smith",
        dateTime: "2025-05-12T09:30:00Z",
        duration: 45,
        notes: "",
        completed: false
      },
      {
        id: this.appointmentIdCounter++,
        pregnancyId: 1,
        title: "32-Week Checkup",
        description: "Review test results and growth assessment",
        location: "Women's Health Center",
        clinicianName: "Dr. Jane Smith",
        dateTime: "2025-06-10T13:45:00Z",
        duration: 30,
        notes: "",
        completed: false
      },
      {
        id: this.appointmentIdCounter++,
        pregnancyId: 1,
        title: "Childbirth Education Class",
        description: "Session 1: Preparation for childbirth",
        location: "Education Center, Floor 3",
        clinicianName: "Midwife Emma Roberts",
        dateTime: "2025-06-18T18:00:00Z",
        duration: 120,
        notes: "",
        completed: false
      }
    ];
    
    // Appointments for Emily Williams
    const appointments2 = [
      {
        id: this.appointmentIdCounter++,
        pregnancyId: 2,
        title: "Initial Prenatal Visit",
        description: "Second pregnancy confirmation",
        location: "Women's Health Center",
        clinicianName: "Dr. Jane Smith",
        dateTime: "2025-02-20T11:00:00Z",
        duration: 60,
        notes: "Confirmed pregnancy, discussed previous C-section history",
        completed: true
      },
      {
        id: this.appointmentIdCounter++,
        pregnancyId: 2,
        title: "12-Week Ultrasound",
        description: "First trimester screening",
        location: "Women's Health Center",
        clinicianName: "Dr. Jane Smith",
        dateTime: "2025-04-15T15:30:00Z",
        duration: 45,
        notes: "Normal development",
        completed: true
      },
      {
        id: this.appointmentIdCounter++,
        pregnancyId: 2,
        title: "20-Week Anatomy Scan",
        description: "Detailed ultrasound and VBAC consultation",
        location: "Imaging Department, City Hospital",
        clinicianName: "Dr. Lisa Wong",
        dateTime: "2025-05-30T13:00:00Z",
        duration: 75,
        notes: "",
        completed: false
      }
    ];
    
    [...pastAppointments, ...futureAppointments, ...appointments2].forEach(appointment => {
      this.appointments.set(appointment.id, appointment);
    });
  }
  
  initializeVitalStats() {
    // Vital stats for Sarah Johnson (pregnancy id 1)
    const vitalStats = [
      {
        id: this.vitalStatIdCounter++,
        pregnancyId: 1,
        date: "2024-12-05",
        weight: 62500, // in grams (62.5 kg)
        bloodPressureSystolic: 118,
        bloodPressureDiastolic: 75,
        fundalHeight: null, // too early
        notes: "Initial measurement, all normal",
        clinicianId: 2
      },
      {
        id: this.vitalStatIdCounter++,
        pregnancyId: 1,
        date: "2025-01-28",
        weight: 64100, // in grams (64.1 kg)
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 78,
        fundalHeight: 12, // in cm
        notes: "Normal weight gain of 1.6kg in first trimester",
        clinicianId: 2
      },
      {
        id: this.vitalStatIdCounter++,
        pregnancyId: 1,
        date: "2025-03-15",
        weight: 67300, // in grams (67.3 kg)
        bloodPressureSystolic: 122,
        bloodPressureDiastolic: 76,
        fundalHeight: 20, // in cm
        notes: "Fundal height matches gestational age",
        clinicianId: 2
      },
      {
        id: this.vitalStatIdCounter++,
        pregnancyId: 1,
        date: "2025-04-20",
        weight: 69800, // in grams (69.8 kg)
        bloodPressureSystolic: 124,
        bloodPressureDiastolic: 78,
        fundalHeight: 24, // in cm
        notes: "Normal progression",
        clinicianId: 2
      }
    ];
    
    // Vital stats for Emily Williams (pregnancy id 2)
    const vitalStats2 = [
      {
        id: this.vitalStatIdCounter++,
        pregnancyId: 2,
        date: "2025-02-20",
        weight: 70200, // in grams (70.2 kg)
        bloodPressureSystolic: 125,
        bloodPressureDiastolic: 80,
        fundalHeight: null, // too early
        notes: "Initial measurement, slightly elevated blood pressure, monitoring",
        clinicianId: 2
      },
      {
        id: this.vitalStatIdCounter++,
        pregnancyId: 2,
        date: "2025-04-15",
        weight: 71500, // in grams (71.5 kg)
        bloodPressureSystolic: 122,
        bloodPressureDiastolic: 78,
        fundalHeight: 12, // in cm
        notes: "Blood pressure improved with lifestyle adjustments",
        clinicianId: 2
      }
    ];
    
    [...vitalStats, ...vitalStats2].forEach(stat => {
      this.vitalStats.set(stat.id, stat);
    });
  }
  
  initializeTestResults() {
    // Test results for Sarah Johnson (pregnancy id 1)
    const testResults = [
      {
        id: this.testResultIdCounter++,
        pregnancyId: 1,
        date: "2024-12-05",
        title: "Initial Blood Work",
        category: "Blood Test",
        status: "normal",
        results: {
          hemoglobin: "13.2 g/dL",
          hematocrit: "39%",
          bloodType: "O+",
          rhFactor: "positive"
        },
        notes: "All levels normal, confirmed blood type",
        clinicianId: 2
      },
      {
        id: this.testResultIdCounter++,
        pregnancyId: 1,
        date: "2025-01-28",
        title: "First Trimester Screening",
        category: "Genetic Screening",
        status: "normal",
        results: {
          trisomy21Risk: "1:5200",
          trisomy18Risk: "1:10400",
          trisomy13Risk: "1:15600"
        },
        notes: "Low risk for common chromosomal conditions",
        clinicianId: 2
      },
      {
        id: this.testResultIdCounter++,
        pregnancyId: 1,
        date: "2025-03-15",
        title: "Complete Blood Count",
        category: "Blood Test",
        status: "follow_up",
        results: {
          hemoglobin: "11.1 g/dL",
          hematocrit: "33%",
          plateletCount: "250,000/µL"
        },
        notes: "Hemoglobin slightly low, recommend iron supplementation",
        clinicianId: 2
      }
    ];
    
    // Test results for Emily Williams (pregnancy id 2)
    const testResults2 = [
      {
        id: this.testResultIdCounter++,
        pregnancyId: 2,
        date: "2025-02-20",
        title: "Initial Blood Work",
        category: "Blood Test",
        status: "normal",
        results: {
          hemoglobin: "12.8 g/dL",
          hematocrit: "38%",
          bloodType: "A+",
          rhFactor: "positive"
        },
        notes: "All levels normal",
        clinicianId: 2
      },
      {
        id: this.testResultIdCounter++,
        pregnancyId: 2,
        date: "2025-03-10",
        title: "Urine Analysis",
        category: "Urine Test",
        status: "abnormal",
        results: {
          protein: "trace",
          glucose: "negative",
          leukocytes: "positive"
        },
        notes: "Possible UTI, culture ordered",
        clinicianId: 2
      }
    ];
    
    [...testResults, ...testResults2].forEach(result => {
      this.testResults.set(result.id, result);
    });
  }
  
  initializeScans() {
    // Scans for Sarah Johnson (pregnancy id 1)
    const scans = [
      {
        id: this.scanIdCounter++,
        pregnancyId: 1,
        date: "2025-01-28",
        title: "12-Week Ultrasound",
        imageUrl: "https://images.unsplash.com/photo-1577640905050-83665df24f38?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600",
        notes: "Crown-rump length 6.2cm, corresponding to 12w3d. Normal development.",
        clinicianId: 2
      },
      {
        id: this.scanIdCounter++,
        pregnancyId: 1,
        date: "2025-03-15",
        title: "20-Week Anatomy Scan",
        imageUrl: "https://images.unsplash.com/photo-1631815585553-a871c0647a88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600",
        notes: "All organ systems visualized and developing normally. Estimated weight 350g.",
        clinicianId: 2
      }
    ];
    
    // Scans for Emily Williams (pregnancy id 2)
    const scans2 = [
      {
        id: this.scanIdCounter++,
        pregnancyId: 2,
        date: "2025-04-15",
        title: "12-Week Ultrasound",
        imageUrl: "https://images.unsplash.com/photo-1584582867089-733d707b1a5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600",
        notes: "Crown-rump length 6.5cm, corresponding to 12w5d. Normal development.",
        clinicianId: 2
      }
    ];
    
    [...scans, ...scans2].forEach(scan => {
      this.scans.set(scan.id, scan);
    });
  }
  
  initializeMessages() {
    // Messages between Sarah Johnson (patient id 1) and Dr. Smith (clinician id 2)
    const messages = [
      {
        id: this.messageIdCounter++,
        pregnancyId: 1,
        fromId: 1,
        toId: 2,
        message: "Hi Dr. Smith, I've been experiencing some mild cramping. Is this normal?",
        timestamp: new Date("2025-02-10T14:32:00Z"),
        read: true
      },
      {
        id: this.messageIdCounter++,
        pregnancyId: 1,
        fromId: 2,
        toId: 1,
        message: "Hello Sarah, mild cramping is common in the second trimester as your uterus expands. If it becomes severe or is accompanied by bleeding, please call the office immediately.",
        timestamp: new Date("2025-02-10T15:45:00Z"),
        read: true
      },
      {
        id: this.messageIdCounter++,
        pregnancyId: 1,
        fromId: 1,
        toId: 2,
        message: "Thank you for the quick response! The cramping has actually subsided now.",
        timestamp: new Date("2025-02-10T16:20:00Z"),
        read: true
      },
      {
        id: this.messageIdCounter++,
        pregnancyId: 1,
        fromId: 2,
        toId: 1,
        message: "I'm glad to hear that. Don't hesitate to reach out if you have any other concerns.",
        timestamp: new Date("2025-02-10T17:05:00Z"),
        read: false
      },
      {
        id: this.messageIdCounter++,
        pregnancyId: 1,
        fromId: 1,
        toId: 2,
        message: "Dr. Smith, just checking if I need to prepare anything special for my 28-week appointment next month?",
        timestamp: new Date("2025-04-25T10:15:00Z"),
        read: true
      },
      {
        id: this.messageIdCounter++,
        pregnancyId: 1,
        fromId: 2,
        toId: 1,
        message: "For your 28-week visit, we'll be doing the glucose screening test. Please don't eat for 2 hours before the appointment. No other special preparation needed.",
        timestamp: new Date("2025-04-25T11:30:00Z"),
        read: false
      }
    ];
    
    // Messages between Emily Williams (patient id 3) and Dr. Smith (clinician id 2)
    const messages2 = [
      {
        id: this.messageIdCounter++,
        pregnancyId: 2,
        fromId: 3,
        toId: 2,
        message: "Dr. Smith, I'm concerned about the possibility of another C-section. Can we discuss VBAC options at my next appointment?",
        timestamp: new Date("2025-04-20T09:45:00Z"),
        read: true
      },
      {
        id: this.messageIdCounter++,
        pregnancyId: 2,
        fromId: 2,
        toId: 3,
        message: "Hi Emily, absolutely. I've scheduled extra time for your 20-week appointment to discuss VBAC options and create a birth plan that addresses your concerns.",
        timestamp: new Date("2025-04-20T11:20:00Z"),
        read: true
      },
      {
        id: this.messageIdCounter++,
        pregnancyId: 2,
        fromId: 3,
        toId: 2,
        message: "Thank you so much, I appreciate your support.",
        timestamp: new Date("2025-04-20T12:05:00Z"),
        read: true
      }
    ];
    
    [...messages, ...messages2].forEach(message => {
      this.messages.set(message.id, message);
    });
  }
  
  // Security audit logging methods
  async logSecurityEvent(insertLog: InsertSecurityLog): Promise<SecurityLog> {
    const id = this.securityLogIdCounter++;
    const timestamp = new Date();
    
    const securityLog: SecurityLog = {
      ...insertLog,
      id,
      timestamp
    };
    
    this.securityLogs.set(id, securityLog);
    return securityLog;
  }
  
  async getUserSecurityLogs(userId: number): Promise<SecurityLog[]> {
    return Array.from(this.securityLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  initializeEducationModules() {
    const modules = [
      {
        title: "Nutrition in the Second Trimester",
        description: "Important nutrients for your baby's development during weeks 20-28.",
        content: "During the second trimester, it's important to focus on foods rich in iron, calcium, and omega-3 fatty acids...",
        weekRange: "20-28",
        imageUrl: "https://images.unsplash.com/photo-1493770348161-369560ae357d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=350"
      },
      {
        title: "Safe Exercises in Mid-Pregnancy",
        description: "Staying active safely as your body changes in the second trimester.",
        content: "Exercise during pregnancy can help reduce back pain, promote healthy weight gain, and improve sleep...",
        weekRange: "20-28",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=350"
      },
      {
        title: "Preparing Your Birth Plan",
        description: "What to consider when creating your personalized birth preferences.",
        content: "A birth plan is a document that communicates your preferences for labor and delivery to your healthcare providers...",
        weekRange: "20-40",
        imageUrl: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=350"
      },
      {
        title: "First Trimester Development",
        description: "Key developmental milestones during weeks 1-12 of pregnancy.",
        content: "Your baby's development happens rapidly during the first trimester...",
        weekRange: "1-12",
        imageUrl: "https://images.unsplash.com/photo-1527787637257-50fd50f8cb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=350"
      },
      {
        title: "Managing Third Trimester Discomfort",
        description: "Tips for sleeping better and reducing common discomforts in late pregnancy.",
        content: "As your baby grows larger, you may experience more discomfort...",
        weekRange: "29-40",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=350"
      },
      {
        title: "Fetal Movement Tracking",
        description: "Understanding and tracking your baby's movements.",
        content: "Starting around 28 weeks, it's important to monitor your baby's movements...",
        weekRange: "28-40",
        imageUrl: "https://images.unsplash.com/photo-1584187839513-f17c9932806a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=350"
      },
      {
        title: "Common Pregnancy Symptoms",
        description: "What to expect in each trimester.",
        content: "Pregnancy brings many physical and emotional changes...",
        weekRange: "1-40",
        imageUrl: "https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=350"
      }
    ];
    
    modules.forEach((module, index) => {
      this.educationModules.set(index + 1, {
        ...module,
        id: index + 1
      });
    });
    
    this.educationModuleIdCounter = modules.length + 1;
  }

  // Patient Visit operations
  async getPatientVisit(id: number): Promise<PatientVisit | undefined> {
    return this.patientVisits.get(id);
  }

  async getPatientVisitsByPregnancyId(pregnancyId: number): Promise<PatientVisit[]> {
    return Array.from(this.patientVisits.values())
      .filter(visit => visit.pregnancyId === pregnancyId)
      .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  }

  async createPatientVisit(visit: InsertPatientVisit): Promise<PatientVisit> {
    const newVisit: PatientVisit = {
      ...visit,
      id: this.patientVisitIdCounter++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.patientVisits.set(newVisit.id, newVisit);
    return newVisit;
  }

  async updatePatientVisit(id: number, visitUpdate: Partial<PatientVisit>): Promise<PatientVisit | undefined> {
    const existingVisit = this.patientVisits.get(id);
    if (!existingVisit) return undefined;

    const updatedVisit: PatientVisit = {
      ...existingVisit,
      ...visitUpdate,
      id,
      updatedAt: new Date(),
    };
    this.patientVisits.set(id, updatedVisit);
    return updatedVisit;
  }

  async deletePatientVisit(id: number): Promise<boolean> {
    return this.patientVisits.delete(id);
  }

  // Immunisation History operations
  async getImmunisationHistory(id: number): Promise<ImmunisationHistory | undefined> {
    return this.immunisationHistory.get(id);
  }

  async getImmunisationHistoryByPregnancyId(pregnancyId: number): Promise<ImmunisationHistory | undefined> {
    return Array.from(this.immunisationHistory.values())
      .find(history => history.pregnancyId === pregnancyId);
  }

  async createImmunisationHistory(history: InsertImmunisationHistory): Promise<ImmunisationHistory> {
    const id = this.immunisationHistoryIdCounter++;
    const newHistory: ImmunisationHistory = {
      ...history,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.immunisationHistory.set(id, newHistory);
    return newHistory;
  }

  async updateImmunisationHistory(id: number, historyUpdate: Partial<ImmunisationHistory>): Promise<ImmunisationHistory | undefined> {
    const existing = this.immunisationHistory.get(id);
    if (!existing) return undefined;
    
    const updatedHistory: ImmunisationHistory = {
      ...existing,
      ...historyUpdate,
      id,
      updatedAt: new Date(),
    };
    this.immunisationHistory.set(id, updatedHistory);
    return updatedHistory;
  }

  initializeImmunisationHistory() {
    // Add sample immunisation data for demo pregnancies
    this.immunisationHistory.set(1, {
      id: 1,
      pregnancyId: 1,
      fluDate: "2024-10-15",
      covidDate: "2024-09-20",
      whoopingCoughDate: "2024-11-05",
      rsvDate: null,
      antiDDate: "2024-12-10",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-12-10"),
    });

    this.immunisationHistory.set(2, {
      id: 2,
      pregnancyId: 2,
      fluDate: "2024-09-10",
      covidDate: "2024-08-15",
      whoopingCoughDate: null,
      rsvDate: "2024-11-20",
      antiDDate: "2024-08-25",
      createdAt: new Date("2024-01-20"),
      updatedAt: new Date("2024-11-20"),
    });

    this.immunisationHistoryIdCounter = 3;
  }
}

// Import our DatabaseStorage class
import { DatabaseStorage } from './database-storage';

// MemStorage is already exported by the class declaration above

// Use DatabaseStorage if DATABASE_URL is set, otherwise fallback to MemStorage
import { DatabaseStorage } from "./database-storage";

// Temporarily use MemStorage until DatabaseStorage implements all IStorage methods
export const storage = new MemStorage();

// TODO: Restore DatabaseStorage when patient visit and immunisation history methods are implemented
// export const storage = process.env.DATABASE_URL 
//   ? new DatabaseStorage() 
//   : new MemStorage();
