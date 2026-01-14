import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb, pgEnum, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session table for auth persistence
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Enums for better type safety and consistent data
export const roleEnum = pgEnum('role_type', ['patient', 'clinician', 'admin']);
export const languageEnum = pgEnum('language_type', ['english', 'arabic', 'chinese', 'vietnamese', 'spanish', 'hindi', 'other']);
export const pregnancyTypeEnum = pgEnum('pregnancy_type_enum', ['singleton', 'twin', 'triplet', 'higher_multiple']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show']);
export const notificationTypeEnum = pgEnum('notification_type', ['appointment', 'test_result', 'message', 'education', 'health_alert']);
export const testResultStatusEnum = pgEnum('test_result_status', ['normal', 'abnormal', 'follow_up']);

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  supabaseUid: text("supabase_uid").unique(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: roleEnum("role").notNull().default("patient"),
  profileImageUrl: text("profile_image_url"),
  phoneNumber: text("phone_number"),
  preferredLanguage: languageEnum("preferred_language").default("english"),
  accessibilitySettings: jsonb("accessibility_settings"),
  notificationPreferences: jsonb("notification_preferences"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Pregnancy Schema
export const pregnancies = pgTable("pregnancies", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  
  // Basic pregnancy information
  dueDate: date("due_date").notNull(),
  startDate: date("start_date").notNull(), 
  lastMenstrualPeriod: date("last_menstrual_period"),
  edbDeterminedBy: text("edb_determined_by"), // LMP/dating scan/other
  pregnancyType: text("pregnancy_type"), // Singleton, Multiple
  notes: text("notes"),
  
  // Patient Identification (Additional fields)
  medicalRecordNumber: text("medical_record_number"),
  sex: text("sex"),
  facility: text("facility"),
  locationWard: text("location_ward"),
  
  // Personal Details
  preferredName: text("preferred_name"),
  emergencyContact: text("emergency_contact"),
  countryOfBirth: text("country_of_birth"),
  interpreterRequired: boolean("interpreter_required"),
  language: text("language"),
  contactNumber: text("contact_number"),
  descent: text("descent"), // Aboriginal, Torres Strait Islander, both, or neither
  culturalReligiousConsiderations: text("cultural_religious_considerations"),
  plannedPlaceOfBirth: text("planned_place_of_birth"),
  birthUnitContactNumber: text("birth_unit_contact_number"),
  modelOfCare: text("model_of_care"),
  leadCareProvider: text("lead_care_provider"),
  leadCareProviderContactNumber: text("lead_care_provider_contact_number"),
  
  // Pregnancy Details
  prePregnancyWeight: integer("pre_pregnancy_weight"),
  bodyMassIndex: integer("body_mass_index"),
  pregnancyIntention: text("pregnancy_intention"),
  bookingWeeks: text("booking_weeks"), // 28 weeks, 36 weeks, or other
  
  // Lifestyle Considerations
  substanceUse: jsonb("substance_use"), // Alcohol, Tobacco, etc
  
  // Antenatal Screening
  hepatitisB: text("hepatitis_b"),
  hepatitisC: text("hepatitis_c"),
  rubella: text("rubella"),
  syphilis: text("syphilis"),
  hiv: text("hiv"),
  groupBStreptococcus: text("group_b_streptococcus"),
  diabetes: text("diabetes"),
  venousThromboembolismRisk: text("venous_thromboembolism_risk"), // Low / Intermediate / High
  
  // Blood Group
  bloodGroup: text("blood_group"),
  rhFactor: text("rh_factor"),
  antibodyScreen: text("antibody_screen"),
  haemoglobin: text("haemoglobin"),
  midstreamUrine: text("midstream_urine"),
  
  // Mental Health
  edinburghPostnatalDepressionScale: integer("edinburgh_postnatal_depression_scale"),
  epdsDate: date("epds_date"),
  epdsReferral: boolean("epds_referral"),
  
  // Prenatal Testing
  prenatalTesting: jsonb("prenatal_testing"), // CVS/Amniocentesis, nuchal translucency, etc
  
  // Previous Pregnancies
  previousPregnancies: jsonb("previous_pregnancies"),
  gravidity: integer("gravidity"), // Number of pregnancies
  parity: integer("parity"), // Number of births
  
  // Health Considerations
  medications: jsonb("medications"),
  adverseReactions: jsonb("adverse_reactions"),
  medicalConsiderations: text("medical_considerations"),
  gynecologicalConsiderations: text("gynecological_considerations"),
  majorSurgeries: text("major_surgeries"),
  mentalHealthDiagnosis: text("mental_health_diagnosis"),
  nonPrescriptionMedication: text("non_prescription_medication"),
  previousThromboticEvents: text("previous_thrombotic_events"),
  vitamins: text("vitamins"),
  otherConsiderations: text("other_considerations"),
  lastPapSmearDate: date("last_pap_smear_date"),
});

export const insertPregnancySchema = createInsertSchema(pregnancies).omit({
  id: true,
});

// Appointment Schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  pregnancyId: integer("pregnancy_id").notNull().references(() => pregnancies.id),
  clinicianId: integer("clinician_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  locationDetails: jsonb("location_details"), // Address, room number, floor, etc.
  clinicianName: text("clinician_name"),
  dateTime: timestamp("date_time").notNull(),
  duration: integer("duration").notNull().default(30), // in minutes
  status: appointmentStatusEnum("status").notNull().default("scheduled"),
  reminderSent: boolean("reminder_sent").notNull().default(false),
  reminderTime: integer("reminder_time").default(24), // hours before appointment
  notes: text("notes"),
  patientNotes: text("patient_notes"), // Notes from the patient about the appointment
  followupNeeded: boolean("followup_needed").default(false),
  followupReason: text("followup_reason"),
  attachments: jsonb("attachments"), // Array of file URLs/metadata
  type: text("type"), // Regular, Ultrasound, Blood Test, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
});

// Vital Stats Schema
export const vitalStats = pgTable("vital_stats", {
  id: serial("id").primaryKey(),
  pregnancyId: integer("pregnancy_id").notNull().references(() => pregnancies.id),
  date: date("date").notNull(),
  weight: integer("weight"), // in grams
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  fundalHeight: integer("fundal_height"), // in cm
  notes: text("notes"),
  clinicianId: integer("clinician_id").references(() => users.id),
});

export const insertVitalStatSchema = createInsertSchema(vitalStats).omit({
  id: true,
});

// Test Results Schema
export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  pregnancyId: integer("pregnancy_id").notNull().references(() => pregnancies.id),
  date: date("date").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  status: text("status", { enum: ["normal", "abnormal", "follow_up"] }).notNull().default("normal"),
  results: jsonb("results"),
  notes: text("notes"),
  clinicianId: integer("clinician_id").references(() => users.id),
});

export const insertTestResultSchema = createInsertSchema(testResults).omit({
  id: true,
});

// Ultrasound Scans Schema
export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  pregnancyId: integer("pregnancy_id").notNull().references(() => pregnancies.id),
  date: date("date").notNull(),
  title: text("title").notNull(),
  imageUrl: text("image_url"),
  notes: text("notes"),
  clinicianId: integer("clinician_id").references(() => users.id),
});

export const insertScanSchema = createInsertSchema(scans).omit({
  id: true,
});

// Messages Schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  pregnancyId: integer("pregnancy_id").notNull().references(() => pregnancies.id),
  fromId: integer("from_id").notNull().references(() => users.id),
  toId: integer("to_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  read: boolean("read").notNull().default(false),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

// Education Module Schema
export const educationModules = pgTable("education_modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  weekRange: text("week_range").notNull(), // e.g. "20-28"
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  tags: jsonb("tags"), // For filtering/categorization
  languages: jsonb("languages"), // Available languages for this content
  difficulty: text("difficulty"), // Easy, Medium, Advanced
  category: text("category"), // Nutrition, Exercise, Prenatal Care, etc.
  resources: jsonb("resources"), // Additional external resources
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Progress on Education Modules
export const educationProgress = pgTable("education_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  moduleId: integer("module_id").notNull().references(() => educationModules.id),
  completed: boolean("completed").notNull().default(false),
  lastAccessed: timestamp("last_accessed"),
  notes: text("notes"),
  bookmark: text("bookmark"), // Store position in video or specific section
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEducationProgressSchema = createInsertSchema(educationProgress).omit({
  id: true,
});

export const insertEducationModuleSchema = createInsertSchema(educationModules).omit({
  id: true,
});

// Export Types 
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Pregnancy = typeof pregnancies.$inferSelect;
export type InsertPregnancy = z.infer<typeof insertPregnancySchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type VitalStat = typeof vitalStats.$inferSelect;
export type InsertVitalStat = z.infer<typeof insertVitalStatSchema>;

export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;

export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Provider Integration
export const healthProviders = pgTable("health_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Hospital, Clinic, Private Practice, etc.
  address: text("address"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  website: text("website"),
  apiEndpoint: text("api_endpoint"),
  apiAuthType: text("api_auth_type"), // OAuth, API Key, etc.
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHealthProviderSchema = createInsertSchema(healthProviders).omit({
  id: true,
});

// Provider Integrations for Patients
export const patientProviderIntegrations = pgTable("patient_provider_integrations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => healthProviders.id),
  authStatus: text("auth_status").notNull().default("pending"), // pending, authorized, revoked
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  scope: text("scope"),
  lastSyncDate: timestamp("last_sync_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPatientProviderIntegrationSchema = createInsertSchema(patientProviderIntegrations).omit({
  id: true,
});

// Security and Audit Logging
export const securityLogs = pgTable("security_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // login, logout, data_access, data_modification, etc.
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertSecurityLogSchema = createInsertSchema(securityLogs).omit({
  id: true,
  timestamp: true,
});

// Data Access Consent Records
export const dataConsents = pgTable("data_consents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  consentType: text("consent_type").notNull(), // research, data_sharing, third_party_access, etc.
  consentGiven: boolean("consent_given").notNull(),
  consentDetails: jsonb("consent_details"),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDataConsentSchema = createInsertSchema(dataConsents).omit({
  id: true,
});

// Patient Visits Schema
export const patientVisits = pgTable("patient_visits", {
  id: serial("id").primaryKey(),
  pregnancyId: integer("pregnancy_id").notNull().references(() => pregnancies.id),
  visitDate: date("visit_date").notNull(),
  doctorName: text("doctor_name").notNull(),
  visitLocation: text("visit_location").notNull(),
  visitNotes: text("visit_notes").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPatientVisitSchema = createInsertSchema(patientVisits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Immunisation History Schema
export const immunisationHistory = pgTable("immunisation_history", {
  id: serial("id").primaryKey(),
  pregnancyId: integer("pregnancy_id").notNull().references(() => pregnancies.id),
  fluDate: date("flu_date"),
  covidDate: date("covid_date"),
  whoopingCoughDate: date("whooping_cough_date"),
  rsvDate: date("rsv_date"),
  antiDDate: date("anti_d_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertImmunisationHistorySchema = createInsertSchema(immunisationHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export Types
export type EducationModule = typeof educationModules.$inferSelect;
export type InsertEducationModule = z.infer<typeof insertEducationModuleSchema>;

export type EducationProgress = typeof educationProgress.$inferSelect;
export type InsertEducationProgress = z.infer<typeof insertEducationProgressSchema>;

export type HealthProvider = typeof healthProviders.$inferSelect;
export type InsertHealthProvider = z.infer<typeof insertHealthProviderSchema>;

export type PatientProviderIntegration = typeof patientProviderIntegrations.$inferSelect;
export type InsertPatientProviderIntegration = z.infer<typeof insertPatientProviderIntegrationSchema>;

export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSecurityLog = z.infer<typeof insertSecurityLogSchema>;

export type DataConsent = typeof dataConsents.$inferSelect;
export type InsertDataConsent = z.infer<typeof insertDataConsentSchema>;

export type PatientVisit = typeof patientVisits.$inferSelect;
export type InsertPatientVisit = z.infer<typeof insertPatientVisitSchema>;

export type ImmunisationHistory = typeof immunisationHistory.$inferSelect;
export type InsertImmunisationHistory = z.infer<typeof insertImmunisationHistorySchema>;
