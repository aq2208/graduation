/*
  ══════════════════════════════════════════════════════════════
  SUPABASE SETUP — Graduation Page · Quỳnh Hương
  ══════════════════════════════════════════════════════════════

  STEP 1 — Create a Supabase project
  ─────────────────────────────────
  1. Go to https://supabase.com and sign up (free)
  2. Click "New project", give it any name (e.g. "qh-graduation")
  3. Choose a region close to Vietnam (Singapore)
  4. Wait ~2 minutes for it to provision

  STEP 2 — Create the database tables
  ────────────────────────────────────
  1. In your project, go to SQL Editor → New query
  2. Paste and run ALL of the SQL below:

  ┌─────────────────────────────────────────────────────────┐

  -- RSVP submissions
  create table if not exists rsvp_submissions (
    id          uuid default gen_random_uuid() primary key,
    name        text not null,
    message     text,
    created_at  timestamptz default now()
  );

  -- Memory photos (linked to an RSVP)
  create table if not exists memories (
    id          uuid default gen_random_uuid() primary key,
    rsvp_id     uuid references rsvp_submissions(id) on delete cascade,
    image_url   text not null,
    created_at  timestamptz default now()
  );

  -- Enable Row Level Security
  alter table rsvp_submissions enable row level security;
  alter table memories enable row level security;

  -- Allow anyone to read & write (public page)
  create policy "public insert" on rsvp_submissions for insert with check (true);
  create policy "public select" on rsvp_submissions for select using (true);
  create policy "public insert" on memories for insert with check (true);
  create policy "public select" on memories for select using (true);

  -- Enable realtime
  alter table rsvp_submissions replica identity full;
  alter table memories replica identity full;
  alter publication supabase_realtime add table rsvp_submissions;
  alter publication supabase_realtime add table memories;

  └─────────────────────────────────────────────────────────┘

  STEP 3 — Create the photo storage bucket
  ─────────────────────────────────────────
  1. Go to Storage → New bucket
  2. Name it exactly:  memories
  3. Toggle "Public bucket" ON → Save
  4. Click the bucket → Policies → New policy → "For full customization"
  5. Name: "public upload", Operations: INSERT, Policy: true → Save
  6. Repeat for SELECT operation (so images can be viewed publicly)

  STEP 4 — Copy your credentials
  ───────────────────────────────
  1. Go to Project Settings → API
  2. Copy "Project URL" and "anon / public" key
  3. Paste them below ↓

  ══════════════════════════════════════════════════════════════
*/

window.SUPABASE_URL      = '';   // e.g. 'https://abcxyz.supabase.co'
window.SUPABASE_ANON_KEY = '';   // e.g. 'eyJhbGci...'
