import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in dev rather than silently hitting a blank backend.
  // eslint-disable-next-line no-console
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your project values.'
  );
}

// A single authenticated client, reused everywhere. `persistSession: true`
// stores session & refresh tokens in localStorage so returning users stay logged in.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// ---- Schema this app expects (created in your Supabase project) ----
export const TABLES = {
  profiles: 'profiles',
  reports: 'reports',
  symptoms: 'symptoms',
  medications: 'medications',
  doctorSummaries: 'doctor_summaries'
};

export const BUCKETS = {
  reports: import.meta.env.VITE_SUPABASE_REPORTS_BUCKET || 'reports',
  avatars: import.meta.env.VITE_SUPABASE_AVATARS_BUCKET || 'avatars'
};

export const REPORTS_BUCKET = BUCKETS.reports;
export const AVATARS_BUCKET = BUCKETS.avatars;

export const PROCESS_REPORT_FUNCTION =
  import.meta.env.VITE_SUPABASE_PROCESS_REPORT_FUNCTION || 'process-report';

/*
Expected tables (RLS enabled on every table: auth.uid() = user_id or auth.uid() = id for profiles):

profiles
  id                    uuid primary key references auth.users(id) on delete cascade
  full_name             text
  date_of_birth         date
  gender                text
  preferred_language    text default 'en' ('en' | 'te')
  location              text
  emergency_contact     text
  allergies             text[]
  existing_conditions   text[]
  onboarding_completed boolean default false
  created_at            timestamptz default now()
  updated_at            timestamptz default now()

reports
  id                    uuid primary key default gen_random_uuid()
  user_id               uuid references profiles(id) on delete cascade
  file_url              text
  category              text ('blood_test', 'scan', 'prescription', 'doctor_note', 'other')
  report_name           text
  hospital_lab          text
  report_date           date
  raw_extracted_text    text
  ai_summary            jsonb ({what_is_this, your_result, term_explanations, discuss_with_doctor})
  created_at            timestamptz default now()

symptoms
  id                    uuid primary key default gen_random_uuid()
  user_id               uuid references profiles(id) on delete cascade
  description           text
  onset_date            date
  duration_text         text
  medicines_taken       text[]
  status                text default 'ongoing'
  input_method          text ('typed' | 'voice')
  created_at            timestamptz default now()

medications
  id                    uuid primary key default gen_random_uuid()
  user_id               uuid references profiles(id) on delete cascade
  name                  text
  reason                text
  start_date            date
  end_date              date
  prescribed_by         text
  notes                 text
  created_at            timestamptz default now()

doctor_summaries
  id                    uuid primary key default gen_random_uuid()
  user_id               uuid references profiles(id) on delete cascade
  summary_json          jsonb
  shared                boolean default false
  created_at            timestamptz default now()
*/

