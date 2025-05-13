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
  dueDate: date("due_date").notNull(),
  startDate: date("start_date").notNull(),
  notes: text("notes"),
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
