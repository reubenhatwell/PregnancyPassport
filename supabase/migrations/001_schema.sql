-- Migration to align Supabase Postgres schema with shared/schema.ts (including supabase_uid)
-- Safe to run multiple times; uses IF NOT EXISTS / conditional alters.

-- Enums
DO $$ BEGIN
  CREATE TYPE role_type AS ENUM ('patient', 'clinician', 'admin');
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE language_type AS ENUM ('english', 'arabic', 'chinese', 'vietnamese', 'spanish', 'hindi', 'other');
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show');
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Sessions (optional)
CREATE TABLE IF NOT EXISTS public.sessions (
  sid varchar PRIMARY KEY,
  sess jsonb NOT NULL,
  expire timestamp NOT NULL
);

-- Users
CREATE TABLE IF NOT EXISTS public.users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  supabase_uid text UNIQUE,
  email text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role role_type NOT NULL DEFAULT 'patient',
  profile_image_url text,
  phone_number text,
  preferred_language language_type DEFAULT 'english',
  accessibility_settings jsonb,
  notification_preferences jsonb,
  last_login_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'supabase_uid'
  ) THEN
    ALTER TABLE public.users ADD COLUMN supabase_uid text UNIQUE;
  END IF;
END $$;

-- Pregnancies
CREATE TABLE IF NOT EXISTS public.pregnancies (
  id serial PRIMARY KEY,
  patient_id integer NOT NULL REFERENCES public.users(id),
  due_date date NOT NULL,
  start_date date NOT NULL,
  last_menstrual_period date,
  edb_determined_by text,
  pregnancy_type text,
  notes text,
  medical_record_number text,
  sex text,
  facility text,
  location_ward text,
  preferred_name text,
  emergency_contact text,
  country_of_birth text,
  interpreter_required boolean,
  language text,
  contact_number text,
  descent text,
  cultural_religious_considerations text,
  planned_place_of_birth text,
  birth_unit_contact_number text,
  model_of_care text,
  lead_care_provider text,
  lead_care_provider_contact_number text,
  pre_pregnancy_weight integer,
  body_mass_index integer,
  pregnancy_intention text,
  booking_weeks text,
  substance_use jsonb,
  hepatitis_b text,
  hepatitis_c text,
  rubella text,
  syphilis text,
  hiv text,
  group_b_streptococcus text,
  diabetes text,
  venous_thromboembolism_risk text,
  blood_group text,
  rh_factor text,
  antibody_screen text,
  haemoglobin text,
  midstream_urine text,
  edinburgh_postnatal_depression_scale integer,
  epds_date date,
  epds_referral boolean,
  prenatal_testing jsonb,
  previous_pregnancies jsonb,
  gravidity integer,
  parity integer,
  medications jsonb,
  adverse_reactions jsonb,
  medical_considerations text,
  gynecological_considerations text,
  major_surgeries text,
  mental_health_diagnosis text,
  non_prescription_medication text,
  previous_thrombotic_events text,
  vitamins text,
  other_considerations text,
  last_pap_smear_date date
);

-- Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id serial PRIMARY KEY,
  pregnancy_id integer NOT NULL REFERENCES public.pregnancies(id),
  clinician_id integer REFERENCES public.users(id),
  title text NOT NULL,
  description text,
  location text,
  location_details jsonb,
  clinician_name text,
  date_time timestamp NOT NULL,
  duration integer NOT NULL DEFAULT 30,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  reminder_sent boolean NOT NULL DEFAULT false,
  reminder_time integer DEFAULT 24,
  notes text,
  patient_notes text,
  followup_needed boolean DEFAULT false,
  followup_reason text,
  attachments jsonb,
  type text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Vital stats
CREATE TABLE IF NOT EXISTS public.vital_stats (
  id serial PRIMARY KEY,
  pregnancy_id integer NOT NULL REFERENCES public.pregnancies(id),
  date date NOT NULL,
  weight integer,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  fundal_height integer,
  notes text,
  clinician_id integer REFERENCES public.users(id)
);

-- Test results
CREATE TABLE IF NOT EXISTS public.test_results (
  id serial PRIMARY KEY,
  pregnancy_id integer NOT NULL REFERENCES public.pregnancies(id),
  date date NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'normal',
  results jsonb,
  notes text,
  clinician_id integer REFERENCES public.users(id)
);

-- Scans
CREATE TABLE IF NOT EXISTS public.scans (
  id serial PRIMARY KEY,
  pregnancy_id integer NOT NULL REFERENCES public.pregnancies(id),
  date date NOT NULL,
  title text NOT NULL,
  image_url text,
  notes text,
  clinician_id integer REFERENCES public.users(id)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id serial PRIMARY KEY,
  pregnancy_id integer NOT NULL REFERENCES public.pregnancies(id),
  from_id integer NOT NULL REFERENCES public.users(id),
  to_id integer NOT NULL REFERENCES public.users(id),
  message text NOT NULL,
  "timestamp" timestamp NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false
);

-- Education modules
CREATE TABLE IF NOT EXISTS public.education_modules (
  id serial PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  week_range text NOT NULL,
  image_url text,
  video_url text,
  tags jsonb,
  languages jsonb,
  difficulty text,
  category text,
  resources jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Education progress
CREATE TABLE IF NOT EXISTS public.education_progress (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES public.users(id),
  module_id integer NOT NULL REFERENCES public.education_modules(id),
  completed boolean NOT NULL DEFAULT false,
  last_accessed timestamp,
  notes text,
  bookmark text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Health providers
CREATE TABLE IF NOT EXISTS public.health_providers (
  id serial PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  address text,
  contact_phone text,
  contact_email text,
  website text,
  api_endpoint text,
  api_auth_type text,
  active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Patient provider integrations
CREATE TABLE IF NOT EXISTS public.patient_provider_integrations (
  id serial PRIMARY KEY,
  patient_id integer NOT NULL REFERENCES public.users(id),
  provider_id integer NOT NULL REFERENCES public.health_providers(id),
  auth_status text NOT NULL DEFAULT 'pending',
  access_token text,
  refresh_token text,
  token_expiry timestamp,
  scope text,
  last_sync_date timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Security logs
CREATE TABLE IF NOT EXISTS public.security_logs (
  id serial PRIMARY KEY,
  user_id integer REFERENCES public.users(id),
  action text NOT NULL,
  ip_address text,
  user_agent text,
  details jsonb,
  "timestamp" timestamp DEFAULT now()
);

-- Data consents
CREATE TABLE IF NOT EXISTS public.data_consents (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES public.users(id),
  consent_type text NOT NULL,
  consent_given boolean NOT NULL,
  consent_details jsonb,
  expiry_date timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Patient visits
CREATE TABLE IF NOT EXISTS public.patient_visits (
  id serial PRIMARY KEY,
  pregnancy_id integer NOT NULL REFERENCES public.pregnancies(id),
  visit_date date NOT NULL,
  doctor_name text NOT NULL,
  visit_location text NOT NULL,
  visit_notes text NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Immunisation history
CREATE TABLE IF NOT EXISTS public.immunisation_history (
  id serial PRIMARY KEY,
  pregnancy_id integer NOT NULL REFERENCES public.pregnancies(id),
  flu_date date,
  covid_date date,
  whooping_cough_date date,
  rsv_date date,
  anti_d_date date,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
