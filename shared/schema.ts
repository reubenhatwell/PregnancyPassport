import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role", { enum: ["patient", "clinician"] }).notNull().default("patient"),
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
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  clinicianName: text("clinician_name"),
  dateTime: timestamp("date_time").notNull(),
  duration: integer("duration").notNull().default(30), // in minutes
  notes: text("notes"),
  completed: boolean("completed").notNull().default(false),
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

export type EducationModule = typeof educationModules.$inferSelect;
export type InsertEducationModule = z.infer<typeof insertEducationModuleSchema>;
