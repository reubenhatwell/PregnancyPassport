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
  
  // Basic pregnancy information
  dueDate: string;
  startDate: string;
  lastMenstrualPeriod?: string;
  edbDeterminedBy?: string; // LMP/dating scan/other
  pregnancyType?: string; // Singleton, Multiple
  notes?: string;
  
  // Patient Identification (Additional fields)
  medicalRecordNumber?: string;
  sex?: string;
  facility?: string;
  locationWard?: string;
  
  // Personal Details
  preferredName?: string;
  emergencyContact?: string;
  countryOfBirth?: string;
  interpreterRequired?: boolean;
  language?: string;
  contactNumber?: string;
  descent?: string; // Aboriginal, Torres Strait Islander, both, or neither
  culturalReligiousConsiderations?: string;
  plannedPlaceOfBirth?: string;
  birthUnitContactNumber?: string;
  modelOfCare?: string;
  leadCareProvider?: string;
  leadCareProviderContactNumber?: string;
  
  // Pregnancy Details
  prePregnancyWeight?: number;
  bodyMassIndex?: number;
  pregnancyIntention?: string;
  bookingWeeks?: string; // 28 weeks, 36 weeks, or other
  
  // Lifestyle Considerations
  substanceUse?: any; // Alcohol, Tobacco, etc
  
  // Antenatal Screening
  hepatitisB?: string;
  hepatitisC?: string;
  rubella?: string;
  syphilis?: string;
  hiv?: string;
  groupBStreptococcus?: string;
  diabetes?: string;
  venousThromboembolismRisk?: string; // Low / Intermediate / High
  
  // Blood Group
  bloodGroup?: string;
  rhFactor?: string;
  antibodyScreen?: string;
  haemoglobin?: string;
  midstreamUrine?: string;
  
  // Mental Health
  edinburghPostnatalDepressionScale?: number;
  epdsDate?: string;
  epdsReferral?: boolean;
  
  // Prenatal Testing
  prenatalTesting?: any; // CVS/Amniocentesis, nuchal translucency, etc
  
  // Previous Pregnancies
  previousPregnancies?: any;
  gravidity?: number; // Number of pregnancies
  parity?: number; // Number of births
  
  // Health Considerations
  medications?: any;
  adverseReactions?: any;
  medicalConsiderations?: string;
  gynecologicalConsiderations?: string;
  majorSurgeries?: string;
  mentalHealthDiagnosis?: string;
  nonPrescriptionMedication?: string;
  previousThromboticEvents?: string;
  vitamins?: string;
  otherConsiderations?: string;
  lastPapSmearDate?: string;
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
  email: string;
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
