# HealBuddy 

A mobile-first React frontend for HealBuddy, connecting to your existing
Supabase project (auth, database, storage). This app does **not** create or
modify any tables — it only reads/writes to the schema described below using
the logged-in user's own Supabase session (never a service key).

## 1. Setup

```bash
npm install
cp .env.example .env
# fill in .env with your Supabase project URL + anon key
npm run dev
```

Build for production:
```bash
npm run build   # outputs to dist/
```

## 2. Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key (RLS-protected, safe for browser) |
| `VITE_SUPABASE_REPORTS_BUCKET` | Storage bucket name for uploaded reports (default `reports`) |
| `VITE_SUPABASE_PROCESS_REPORT_FUNCTION` | Edge Function name that extracts/summarizes a report (default `process-report`) |

## 3. Expected database schema

This app assumes the following tables already exist, with Row Level Security
enabled so a user can only see/edit rows where `user_id = auth.uid()` (for
`profiles`, the row's own `id` **is** `auth.uid()`). Full column list is also
documented as a comment in `src/supabaseClient.js`.

```sql
-- profiles: one row per user, id = auth.users.id
id uuid primary key references auth.users(id)
full_name text
dob date
gender text
preferred_language text        -- 'en' | 'te'
location text
emergency_contact text
existing_conditions text
allergies text
current_medicines text
created_at timestamptz default now()

-- reports: one row per uploaded report
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users(id)
file_path text                 -- path inside the storage bucket
file_name text
mime_type text
status text                    -- 'processing' | 'done' | 'error'
test_name text
result_text text               -- "Your result", plain language
what_is_this text
terms jsonb                    -- [{ term, explanation }]
discuss_points jsonb           -- [string]
error_message text
created_at timestamptz default now()

-- symptoms: one row per logged symptom
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users(id)
description text
duration_text text
medicines_taken text
source text                    -- 'voice' | 'text'
red_flag boolean default false
created_at timestamptz default now()
updated_at timestamptz
```

If your real column or table names differ, update the constants at the top
of `src/supabaseClient.js` (`TABLES`) — nothing else in the app needs to
change, since every query goes through those constants.

### Suggested RLS policies (adjust to your project)

```sql
alter table profiles enable row level security;
create policy "own profile" on profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

alter table reports enable row level security;
create policy "own reports" on reports for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table symptoms enable row level security;
create policy "own symptoms" on symptoms for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Storage bucket `reports` should similarly restrict access so a user can only
read/write objects under their own `auth.uid()` folder prefix (the app
uploads to `<uid>/<timestamp>-<uuid>.<ext>`).

## 4. Report processing (extract + summarize)

Upload → Supabase Storage → a `reports` row is inserted with
`status: 'processing'` → the app calls
`supabase.functions.invoke('process-report', { reportId, language })`.

You need an Edge Function (already deployed on your project, name
configurable via `VITE_SUPABASE_PROCESS_REPORT_FUNCTION`) that:
1. Reads the file from Storage using `file_path`.
2. Extracts text (OCR for images, text extraction for PDFs).
3. Summarizes it into: `test_name`, `what_is_this`, `result_text`, `terms`
   (array of `{term, explanation}`), `discuss_points` (array of strings) —
   written in the requested `language` ('en' or 'te'), **never phrased as a
   diagnosis**.
4. Updates the `reports` row with those fields and `status: 'done'`
   (or `status: 'error'` + `error_message` on failure).

The frontend re-fetches the row after invoking the function and renders
whatever `status` it finds — it never fabricates report content itself. If
no such function is deployed yet, uploads will appear stuck in
"Processing…" until one exists.

## 5. Auth

Supports either:
- **Mobile + OTP** — `supabase.auth.signInWithOtp({ phone })` then
  `verifyOtp({ phone, token, type: 'sms' })`. Requires SMS OTP configured in
  your Supabase Auth settings (e.g. Twilio).
- **Email + password** — `signUp` / `signInWithPassword`.

Sessions persist via Supabase's own localStorage-backed session (see
`persistSession: true` in `src/supabaseClient.js`), so closing and reopening
the app keeps the user logged in until they explicitly log out.

## 6. Language

Only English (`en`) and Telugu (`te`) are supported. The choice is stored on
`profiles.preferred_language` and applied on every login, in Settings, and
by the voice assistant (uses `en-IN` / `te-IN` for recognition + speech
synthesis via the Web Speech API).

## 7. Voice assistant

Implemented with the browser's `SpeechRecognition` / `speechSynthesis` APIs
(`src/lib/useSpeech.js`). Support varies by browser — the app always shows a
typed alternative, and hides/disables the mic button (with an explanatory
message) when the API isn't available.

## 8. Emergency / red-flag handling

`src/lib/redFlags.js` does simple keyword matching (chest pain, difficulty
breathing, severe bleeding, stroke signs, etc., in English and Telugu). If a
logged symptom's description matches, the flow stops immediately and shows
the fixed message: *"This may require urgent medical attention. Please seek
immediate local medical or emergency assistance."* — the entry is **not**
saved as a normal symptom in that flow. This is basic keyword matching, not
a clinical triage system.

## 9. Safety rules baked into the UI

- Report/symptom screens always show a fixed disclaimer footer.
- No screen ever states a diagnosis — findings are phrased as "may be worth
  discussing with a professional."
- The Doctor Summary is always shown for review/edit first; nothing is
  auto-shared. Sharing uses the device's native share sheet
  (`navigator.share`) or copy-to-clipboard, only on explicit tap.

## 10. Screens included (MVP only, per spec)

Splash · Login/Signup · Create Profile · Dashboard · Upload Report · Report
Understanding · Record Symptoms (type or voice) · Symptom History · My
Health History · Doctor-Ready Summary · Settings. No other screens are
included.
