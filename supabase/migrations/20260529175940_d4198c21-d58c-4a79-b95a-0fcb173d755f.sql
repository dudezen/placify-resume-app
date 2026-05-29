
-- =========================
-- RESUMES
-- =========================
CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  parsed_text TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_resumes_user ON public.resumes(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers manage own resumes - select"
  ON public.resumes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Seekers manage own resumes - insert"
  ON public.resumes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Seekers manage own resumes - update"
  ON public.resumes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Seekers manage own resumes - delete"
  ON public.resumes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER resumes_set_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- JOBS
-- =========================
CREATE TYPE public.job_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE public.employment_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');

CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT NOT NULL,
  employment_type public.employment_type NOT NULL DEFAULT 'full_time',
  salary_min INTEGER,
  salary_max INTEGER,
  status public.job_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_jobs_recruiter ON public.jobs(recruiter_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published jobs visible to authenticated"
  ON public.jobs FOR SELECT TO authenticated
  USING (status = 'published' OR auth.uid() = recruiter_id);
CREATE POLICY "Recruiters insert own jobs"
  ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters update own jobs"
  ON public.jobs FOR UPDATE TO authenticated
  USING (auth.uid() = recruiter_id) WITH CHECK (auth.uid() = recruiter_id);
CREATE POLICY "Recruiters delete own jobs"
  ON public.jobs FOR DELETE TO authenticated
  USING (auth.uid() = recruiter_id);

CREATE TRIGGER jobs_set_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- APPLICATIONS
-- =========================
CREATE TYPE public.application_status AS ENUM ('submitted', 'reviewed', 'shortlisted', 'rejected', 'hired');

CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  match_score INTEGER,
  ats_score INTEGER,
  red_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  green_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  analysis JSONB,
  status public.application_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, seeker_id)
);
CREATE INDEX idx_applications_job ON public.applications(job_id);
CREATE INDEX idx_applications_seeker ON public.applications(seeker_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Seeker sees their own applications
CREATE POLICY "Seekers see own applications"
  ON public.applications FOR SELECT TO authenticated
  USING (auth.uid() = seeker_id);
-- Recruiter sees applications to their jobs
CREATE POLICY "Recruiters see applications to own jobs"
  ON public.applications FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = applications.job_id AND j.recruiter_id = auth.uid()
  ));
CREATE POLICY "Seekers submit own applications"
  ON public.applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = seeker_id);
CREATE POLICY "Seekers update own applications"
  ON public.applications FOR UPDATE TO authenticated
  USING (auth.uid() = seeker_id) WITH CHECK (auth.uid() = seeker_id);
CREATE POLICY "Recruiters update applications to own jobs"
  ON public.applications FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = applications.job_id AND j.recruiter_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = applications.job_id AND j.recruiter_id = auth.uid()
  ));
CREATE POLICY "Seekers delete own applications"
  ON public.applications FOR DELETE TO authenticated
  USING (auth.uid() = seeker_id);

CREATE TRIGGER applications_set_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- RESUME STORAGE BUCKET
-- =========================
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users read own resume files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own resume files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own resume files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own resume files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow recruiters to read resume files attached to applications on their jobs
CREATE POLICY "Recruiters read resume files for own job applications"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'resumes' AND EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      JOIN public.resumes r ON r.id = a.resume_id
      WHERE j.recruiter_id = auth.uid()
        AND r.file_path = storage.objects.name
    )
  );
