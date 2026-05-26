import type { Analysis } from "@/lib/analyze.functions";

const LAST_ANALYSIS = "placify-last-analysis";
const JOBS = "placify-jobs";
const CANDIDATES = "placify-candidates";

export interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  description: string;
  createdAt: number;
  createdBy: string;
}

export type CandidateStatus = "new" | "shortlisted" | "rejected" | "saved";

export interface CandidateRecord {
  id: string;
  jobId: string;
  candidateName: string;
  fileName: string;
  status: CandidateStatus;
  analysis: Analysis;
  createdAt: number;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const lastAnalysis = {
  get: () => read<Analysis | null>(LAST_ANALYSIS, null),
  set: (a: Analysis) => write(LAST_ANALYSIS, a),
  clear: () => {
    if (typeof window !== "undefined") localStorage.removeItem(LAST_ANALYSIS);
  },
};

export const jobs = {
  list: () => read<JobPost[]>(JOBS, []),
  add: (job: Omit<JobPost, "id" | "createdAt">) => {
    const all = read<JobPost[]>(JOBS, []);
    const newJob: JobPost = {
      ...job,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    write(JOBS, [newJob, ...all]);
    return newJob;
  },
  remove: (id: string) => {
    write(
      JOBS,
      read<JobPost[]>(JOBS, []).filter((j) => j.id !== id),
    );
  },
  get: (id: string) => read<JobPost[]>(JOBS, []).find((j) => j.id === id) ?? null,
};

export const candidates = {
  list: () => read<CandidateRecord[]>(CANDIDATES, []),
  add: (c: Omit<CandidateRecord, "id" | "createdAt" | "status"> & { status?: CandidateStatus }) => {
    const all = read<CandidateRecord[]>(CANDIDATES, []);
    const rec: CandidateRecord = {
      ...c,
      status: c.status ?? "new",
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    write(CANDIDATES, [rec, ...all]);
    return rec;
  },
  updateStatus: (id: string, status: CandidateStatus) => {
    const all = read<CandidateRecord[]>(CANDIDATES, []);
    write(
      CANDIDATES,
      all.map((c) => (c.id === id ? { ...c, status } : c)),
    );
  },
  forJob: (jobId: string) => candidates.list().filter((c) => c.jobId === jobId),
};
