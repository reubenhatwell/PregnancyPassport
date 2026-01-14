-- Supabase migration: schema + RLS policies
-- Assumptions:
-- - Supabase Auth manages users; auth.uid() is the Supabase auth user id.
-- - Application users table stores supabase_uid to link auth users to app roles.
-- - Roles: patient, clinician, admin. Default deny unless explicitly allowed.

-- Helper schema for utility functions
CREATE SCHEMA IF NOT EXISTS app;

-- Helper: get current app user id from Supabase UID
CREATE OR REPLACE FUNCTION app.current_user_id() RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.users WHERE supabase_uid = auth.uid()::text LIMIT 1;
$$;

-- Helper: get current app user role (defaults to 'patient' if not found)
CREATE OR REPLACE FUNCTION app.current_user_role() RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT role::text FROM public.users WHERE supabase_uid = auth.uid()::text LIMIT 1),
    'patient'
  );
$$;

-- Ensure supabase_uid column exists and is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'supabase_uid'
  ) THEN
    ALTER TABLE public.users ADD COLUMN supabase_uid text UNIQUE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'users_supabase_uid_idx'
  ) THEN
    CREATE UNIQUE INDEX users_supabase_uid_idx ON public.users (supabase_uid);
  END IF;
END$$;

-- Enable RLS on all relevant tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_provider_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunisation_history ENABLE ROW LEVEL SECURITY;

-- USERS: self-service, admin full
DROP POLICY IF EXISTS users_select_self ON public.users;
CREATE POLICY users_select_self ON public.users
  FOR SELECT USING (
    supabase_uid = auth.uid()::text OR app.current_user_role() = 'admin'
  );

DROP POLICY IF EXISTS users_insert_self ON public.users;
CREATE POLICY users_insert_self ON public.users
  FOR INSERT WITH CHECK (
    supabase_uid = auth.uid()::text
  );

DROP POLICY IF EXISTS users_update_self ON public.users;
CREATE POLICY users_update_self ON public.users
  FOR UPDATE USING (
    supabase_uid = auth.uid()::text OR app.current_user_role() = 'admin'
  ) WITH CHECK (
    supabase_uid = auth.uid()::text OR app.current_user_role() = 'admin'
  );

-- Helper condition builders
-- Patients own rows where patient_id = current user id
-- Clinicians/Admins can access everything

-- PREGNANCIES
DROP POLICY IF EXISTS pregnancies_patient ON public.pregnancies;
CREATE POLICY pregnancies_patient ON public.pregnancies
  FOR ALL USING (
    (patient_id = app.current_user_id())
    OR app.current_user_role() IN ('clinician','admin')
  ) WITH CHECK (
    (patient_id = app.current_user_id())
    OR app.current_user_role() IN ('clinician','admin')
  );

-- APPOINTMENTS
DROP POLICY IF EXISTS appointments_patient ON public.appointments;
CREATE POLICY appointments_patient ON public.appointments
  FOR ALL USING (
    app.current_user_role() IN ('clinician','admin')
    OR EXISTS (
      SELECT 1 FROM public.pregnancies p
      WHERE p.id = appointments.pregnancy_id
        AND p.patient_id = app.current_user_id()
    )
  ) WITH CHECK (
    app.current_user_role() IN ('clinician','admin')
    OR EXISTS (
      SELECT 1 FROM public.pregnancies p
      WHERE p.id = appointments.pregnancy_id
        AND p.patient_id = app.current_user_id()
    )
  );

-- VITAL STATS
DROP POLICY IF EXISTS vital_stats_patient ON public.vital_stats;
CREATE POLICY vital_stats_patient ON public.vital_stats
  FOR ALL USING (
    app.current_user_role() IN ('clinician','admin')
    OR EXISTS (
      SELECT 1 FROM public.pregnancies p
      WHERE p.id = vital_stats.pregnancy_id
        AND p.patient_id = app.current_user_id()
    )
  ) WITH CHECK (
    app.current_user_role() IN ('clinician','admin')
    OR EXISTS (
      SELECT 1 FROM public.pregnancies p
      WHERE p.id = vital_stats.pregnancy_id
        AND p.patient_id = app.current_user_id()
    )
  );

-- TEST RESULTS
DROP POLICY IF EXISTS test_results_patient ON public.test_results;
CREATE POLICY test_results_patient ON public.test_results
  FOR ALL USING (
    app.current_user_role() IN ('clinician','admin')
    OR EXISTS (
      SELECT 1 FROM public.pregnancies p
      WHERE p.id = test_results.pregnancy_id
        AND p.patient_id = app.current_user_id()
    )
  ) WITH CHECK (
    app.current_user_role() IN ('clinician','admin')
    OR EXISTS (
      SELECT 1 FROM public.pregnancies p
      WHERE p.id = test_results.pregnancy_id
        AND p.patient_id = app.current_user_id()
    )
  );

-- SCANS
DROP POLICY IF EXISTS scans_patient ON public.scans;
CREATE POLICY scans_patient ON public.scans
  FOR ALL USING (
    app.current_user_role() IN ('clinician','admin')
    OR EXISTS (
      SELECT 1 FROM public.pregnancies p
      WHERE p.id = scans.pregnancy_id
        AND p.patient_id = app.current_user_id()
    )
  ) WITH CHECK (
    app.current_user_role() IN ('clinician','admin')
    OR EXISTS (
      SELECT 1 FROM public.pregnancies p
      WHERE p.id = scans.pregnancy_id
        AND p.patient_id = app.current_user_id()
    )
  );

-- MESSAGES
DROP POLICY IF EXISTS messages_participants ON public.messages;
CREATE POLICY messages_participants ON public.messages
  FOR ALL USING (
    app.current_user_role() IN ('clinician','admin')
    OR from_id = app.current_user_id()
    OR to_id = app.current_user_id()
  ) WITH CHECK (
    app.current_user_role() IN ('clinician','admin')
    OR from_id = app.current_user_id()
    OR to_id = app.current_user_id()
  );

-- EDUCATION MODULES: readable by all authenticated; updates by admins
DROP POLICY IF EXISTS education_modules_read ON public.education_modules;
CREATE POLICY education_modules_read ON public.education_modules
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS education_modules_write_admin ON public.education_modules;
CREATE POLICY education_modules_write_admin ON public.education_modules
  FOR ALL USING (app.current_user_role() = 'admin') WITH CHECK (app.current_user_role() = 'admin');

-- EDUCATION PROGRESS: owner only
DROP POLICY IF EXISTS education_progress_owner ON public.education_progress;
CREATE POLICY education_progress_owner ON public.education_progress
  FOR ALL USING (
    user_id = app.current_user_id()
  ) WITH CHECK (
    user_id = app.current_user_id()
  );

-- HEALTH PROVIDERS: read all; write admin
DROP POLICY IF EXISTS health_providers_read ON public.health_providers;
CREATE POLICY health_providers_read ON public.health_providers
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS health_providers_write_admin ON public.health_providers;
CREATE POLICY health_providers_write_admin ON public.health_providers
  FOR ALL USING (app.current_user_role() = 'admin') WITH CHECK (app.current_user_role() = 'admin');

-- PATIENT PROVIDER INTEGRATIONS: owner or admin
DROP POLICY IF EXISTS patient_provider_integrations_owner ON public.patient_provider_integrations;
CREATE POLICY patient_provider_integrations_owner ON public.patient_provider_integrations
  FOR ALL USING (
    app.current_user_role() IN ('clinician','admin')
    OR patient_id = app.current_user_id()
  ) WITH CHECK (
    app.current_user_role() IN ('clinician','admin')
    OR patient_id = app.current_user_id()
  );

-- SECURITY LOGS: admin only
DROP POLICY IF EXISTS security_logs_admin ON public.security_logs;
CREATE POLICY security_logs_admin ON public.security_logs
  FOR ALL USING (app.current_user_role() = 'admin') WITH CHECK (app.current_user_role() = 'admin');

-- DATA CONSENTS: owner or admin
DROP POLICY IF EXISTS data_consents_owner ON public.data_consents;
CREATE POLICY data_consents_owner ON public.data_consents
  FOR ALL USING (
    app.current_user_role() = 'admin'
    OR user_id = app.current_user_id()
  ) WITH CHECK (
    app.current_user_role() = 'admin'
    OR user_id = app.current_user_id()
  );

-- PATIENT VISITS: patient or clinician/admin
DROP POLICY IF EXISTS patient_visits_access ON public.patient_visits;
CREATE POLICY patient_visits_access ON public.patient_visits
  FOR ALL USING (
    app.current_user_role() IN ('clinician','admin')
    OR EXISTS (
      SELECT 1 FROM public.pregnancies p
      WHERE p.id = patient_visits.pregnancy_id
        AND p.patient_id = app.current_user_id()
    )
  ) WITH CHECK (
    app.current_user_role() IN ('clinician','admin')
    OR EXISTS (
      SELECT 1 FROM public.pregnancies p
      WHERE p.id = patient_visits.pregnancy_id
        AND p.patient_id = app.current_user_id()
    )
  );

-- IMMUNISATION HISTORY: patient or clinician/admin
DROP POLICY IF EXISTS immunisation_history_access ON public.immunisation_history;
CREATE POLICY immunisation_history_access ON public.immunisation_history
  FOR ALL USING (
    app.current_user_role() IN ('clinician','admin')
    OR EXISTS (
      SELECT 1 FROM public.pregnancies p
      WHERE p.id = immunisation_history.pregnancy_id
        AND p.patient_id = app.current_user_id()
    )
  ) WITH CHECK (
    app.current_user_role() IN ('clinician','admin')
    OR EXISTS (
      SELECT 1 FROM public.pregnancies p
      WHERE p.id = immunisation_history.pregnancy_id
        AND p.patient_id = app.current_user_id()
    )
  );

-- APPOINTMENT SCOPES FOR CLINICIAN VIEWS: rely on clinician role to see all
-- CLINICIAN ROUTES previously enforced in backend; now via policy above (clinician/admin access all appointments)

-- DEFAULT DENY: ensure no permissive policies remain
