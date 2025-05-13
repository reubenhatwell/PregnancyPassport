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
  InsertEducationModule
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  
  // Vital Stats operations
  getVitalStat(id: number): Promise<VitalStat | undefined>;
  getVitalStatsByPregnancyId(pregnancyId: number): Promise<VitalStat[]>;
  createVitalStat(vitalStat: InsertVitalStat): Promise<VitalStat>;
  
  // Test Results operations
  getTestResult(id: number): Promise<TestResult | undefined>;
  getTestResultsByPregnancyId(pregnancyId: number): Promise<TestResult[]>;
  createTestResult(testResult: InsertTestResult): Promise<TestResult>;
  
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
  
  // Session store
  sessionStore: session.SessionStore;
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
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private pregnancyIdCounter: number;
  private appointmentIdCounter: number;
  private vitalStatIdCounter: number;
  private testResultIdCounter: number;
  private scanIdCounter: number;
  private messageIdCounter: number;
  private educationModuleIdCounter: number;

  constructor() {
    this.users = new Map();
    this.pregnancies = new Map();
    this.appointments = new Map();
    this.vitalStats = new Map();
    this.testResults = new Map();
    this.scans = new Map();
    this.messages = new Map();
    this.educationModules = new Map();
    
    this.userIdCounter = 1;
    this.pregnancyIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.vitalStatIdCounter = 1;
    this.testResultIdCounter = 1;
    this.scanIdCounter = 1;
    this.messageIdCounter = 1;
    this.educationModuleIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample education modules
    this.initializeEducationModules();
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
  
  // Initialize education modules with some data
  private initializeEducationModules() {
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
}

export const storage = new MemStorage();
