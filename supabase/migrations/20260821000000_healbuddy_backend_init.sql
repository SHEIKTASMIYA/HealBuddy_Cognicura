-- HealBuddy Backend Schema Migration
-- Created for Supabase Backend Setup

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. TABLES DEFINITION
-- ==========================================

-- 1.1 Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'te')),
  location TEXT,
  emergency_contact TEXT,
  allergies TEXT[],
  existing_conditions TEXT[],
  current_medicines TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT,
  category TEXT CHECK (category IN ('blood_test', 'scan', 'prescription', 'doctor_note', 'other')),
  report_name TEXT,
  hospital_lab TEXT,
  report_date DATE,
  raw_extracted_text TEXT,
  ai_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Symptoms Table
CREATE TABLE IF NOT EXISTS public.symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT,
  onset_date DATE,
  duration_text TEXT,
  medicines_taken TEXT[],
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'resolved', 'improving', 'worsening')),
  input_method TEXT CHECK (input_method IN ('typed', 'voice')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Medications Table
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT,
  reason TEXT,
  start_date DATE,
  end_date DATE,
  prescribed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Doctor Summaries Table
CREATE TABLE IF NOT EXISTS public.doctor_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary_json JSONB,
  shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_date ON public.reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_date ON public.reports(user_id, report_date DESC);

CREATE INDEX IF NOT EXISTS idx_symptoms_user_id ON public.symptoms(user_id);
CREATE INDEX IF NOT EXISTS idx_symptoms_onset_date ON public.symptoms(onset_date DESC);
CREATE INDEX IF NOT EXISTS idx_symptoms_user_date ON public.symptoms(user_id, onset_date DESC);

CREATE INDEX IF NOT EXISTS idx_medications_user_id ON public.medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_start_date ON public.medications(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_medications_user_date ON public.medications(user_id, start_date DESC);

CREATE INDEX IF NOT EXISTS idx_doctor_summaries_user_id ON public.doctor_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_summaries_created_at ON public.doctor_summaries(created_at DESC);

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_summaries ENABLE ROW LEVEL SECURITY;

-- 3.1 Profiles RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- 3.2 Reports RLS Policies
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reports" ON public.reports;
CREATE POLICY "Users can insert own reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;
CREATE POLICY "Users can update own reports" ON public.reports
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reports" ON public.reports;
CREATE POLICY "Users can delete own reports" ON public.reports
  FOR DELETE USING (auth.uid() = user_id);

-- 3.3 Symptoms RLS Policies
DROP POLICY IF EXISTS "Users can view own symptoms" ON public.symptoms;
CREATE POLICY "Users can view own symptoms" ON public.symptoms
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own symptoms" ON public.symptoms;
CREATE POLICY "Users can insert own symptoms" ON public.symptoms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own symptoms" ON public.symptoms;
CREATE POLICY "Users can update own symptoms" ON public.symptoms
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own symptoms" ON public.symptoms;
CREATE POLICY "Users can delete own symptoms" ON public.symptoms
  FOR DELETE USING (auth.uid() = user_id);

-- 3.4 Medications RLS Policies
DROP POLICY IF EXISTS "Users can view own medications" ON public.medications;
CREATE POLICY "Users can view own medications" ON public.medications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own medications" ON public.medications;
CREATE POLICY "Users can insert own medications" ON public.medications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own medications" ON public.medications;
CREATE POLICY "Users can update own medications" ON public.medications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own medications" ON public.medications;
CREATE POLICY "Users can delete own medications" ON public.medications
  FOR DELETE USING (auth.uid() = user_id);

-- 3.5 Doctor Summaries RLS Policies
DROP POLICY IF EXISTS "Users can view own doctor summaries" ON public.doctor_summaries;
CREATE POLICY "Users can view own doctor summaries" ON public.doctor_summaries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own doctor summaries" ON public.doctor_summaries;
CREATE POLICY "Users can insert own doctor summaries" ON public.doctor_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own doctor summaries" ON public.doctor_summaries;
CREATE POLICY "Users can update own doctor summaries" ON public.doctor_summaries
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own doctor summaries" ON public.doctor_summaries;
CREATE POLICY "Users can delete own doctor summaries" ON public.doctor_summaries
  FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 4. AUTOMATIC PROFILE TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 5. HEALTH TIMELINE RPC FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_health_timeline(p_user_id UUID)
RETURNS TABLE (
  event_id UUID,
  event_type TEXT,
  event_date DATE,
  created_at TIMESTAMPTZ,
  title TEXT,
  subtitle TEXT,
  details JSONB
) AS $$
BEGIN
  -- Security check: Ensure caller can only access their own timeline
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only access your own health timeline.';
  END IF;

  RETURN QUERY
  SELECT 
    r.id AS event_id,
    'report'::TEXT AS event_type,
    r.report_date AS event_date,
    r.created_at,
    COALESCE(r.report_name, 'Medical Report') AS title,
    COALESCE(r.hospital_lab, 'Report') AS subtitle,
    jsonb_build_object(
      'file_url', r.file_url,
      'category', r.category,
      'raw_extracted_text', r.raw_extracted_text,
      'ai_summary', r.ai_summary
    ) AS details
  FROM public.reports r
  WHERE r.user_id = p_user_id

  UNION ALL

  SELECT 
    s.id AS event_id,
    'symptom'::TEXT AS event_type,
    s.onset_date AS event_date,
    s.created_at,
    COALESCE(s.description, 'Symptom Entry') AS title,
    COALESCE(s.duration_text, 'Symptom') AS subtitle,
    jsonb_build_object(
      'medicines_taken', s.medicines_taken,
      'status', s.status,
      'input_method', s.input_method
    ) AS details
  FROM public.symptoms s
  WHERE s.user_id = p_user_id

  UNION ALL

  SELECT 
    m.id AS event_id,
    'medication'::TEXT AS event_type,
    m.start_date AS event_date,
    m.created_at,
    COALESCE(m.name, 'Medication') AS title,
    COALESCE(m.reason, 'Prescription') AS subtitle,
    jsonb_build_object(
      'end_date', m.end_date,
      'prescribed_by', m.prescribed_by,
      'notes', m.notes
    ) AS details
  FROM public.medications m
  WHERE m.user_id = p_user_id

  ORDER BY event_date DESC NULLS LAST, created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 6. SUPABASE STORAGE BUCKETS & POLICIES
-- ==========================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('reports', 'reports', FALSE, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('avatars', 'avatars', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = FALSE;

-- Storage Policies for 'reports' bucket
DROP POLICY IF EXISTS "Users can read own reports files" ON storage.objects;
CREATE POLICY "Users can read own reports files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can upload own reports files" ON storage.objects;
CREATE POLICY "Users can upload own reports files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own reports files" ON storage.objects;
CREATE POLICY "Users can update own reports files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own reports files" ON storage.objects;
CREATE POLICY "Users can delete own reports files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'reports' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage Policies for 'avatars' bucket
DROP POLICY IF EXISTS "Users can read own avatar files" ON storage.objects;
CREATE POLICY "Users can read own avatar files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can upload own avatar files" ON storage.objects;
CREATE POLICY "Users can upload own avatar files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own avatar files" ON storage.objects;
CREATE POLICY "Users can update own avatar files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own avatar files" ON storage.objects;
CREATE POLICY "Users can delete own avatar files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );
