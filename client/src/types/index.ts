export type UserRole = "patient" | "clinician";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface Pregnancy {
  id: number;
  patientId: number;
  dueDate: string;
  startDate: string;
  notes?: string;
}

export interface Appointment {
  id: number;
  pregnancyId: number;
  title: string;
  description?: string;
  location?: string;
  clinicianName?: string;
  dateTime: string;
  duration: number;
  notes?: string;
  completed: boolean;
}

export interface VitalStat {
  id: number;
  pregnancyId: number;
  date: string;
  weight?: number; // in grams
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  fundalHeight?: number; // in cm
  notes?: string;
  clinicianId?: number;
}

export interface TestResult {
  id: number;
  pregnancyId: number;
  date: string;
  title: string;
  category: string;
  status: "normal" | "abnormal" | "follow_up";
  results?: any;
  notes?: string;
  clinicianId?: number;
}

export interface Scan {
  id: number;
  pregnancyId: number;
  date: string;
  title: string;
  imageUrl?: string;
  notes?: string;
  clinicianId?: number;
}

export interface Message {
  id: number;
  pregnancyId: number;
  fromId: number;
  toId: number;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface EducationModule {
  id: number;
  title: string;
  description: string;
  content: string;
  weekRange: string;
  imageUrl?: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface PregnancyStats {
  currentWeek: number;
  daysRemaining: number;
  totalDays: number;
  progress: number;
  babySize: string;
  trimester: 1 | 2 | 3;
}

export enum Trimester {
  First = "First Trimester",
  Second = "Second Trimester",
  Third = "Third Trimester"
}
