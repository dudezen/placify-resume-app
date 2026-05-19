import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  resumeText: z.string().min(20).max(50000),
  jd: z.string().min(20).max(20000),
});

const AnalysisSchema = z.object({
  overall_score: z.number(),
  skill_score: z.number(),
  gap_analysis: z.array(
    z.object({
      skill: z.string(),
      in_resume: z.boolean(),
      required: z.boolean(),
    }),
  ),
  suggestions: z.array(
    z.object({
      original: z.string(),
      rewrites: z.array(z.string()),
    }),
  ),
  ats_simulation: z.object({
    parse_score: z.number(),
    verdict: z.enum(["pass", "borderline", "reject"]),
    keyword_matches: z.array(
      z.object({
        keyword: z.string(),
        resume_count: z.number(),
        required: z.boolean(),
        status: z.enum(["good", "low", "missing", "stuffed"]),
      }),
    ),
    format_flags: z.array(
      z.object({
        issue: z.string(),
        severity: z.enum(["info", "warn", "error"]),
      }),
    ),
    extracted_fields: z.object({
      name: z.string(),
      email: z.string(),
      years_experience: z.string(),
      skills: z.array(z.string()),
    }),
  }),
  recruiter_view: z.object({
    decision: z.enum(["yes", "maybe", "no"]),
    one_liner: z.string(),
    strengths: z.array(z.string()),
    concerns: z.array(z.string()),
    seniority_match: z.string(),
    story: z.string(),
  }),
  career_roadmap: z.array(
    z.object({
      skill: z.string(),
      priority: z.enum(["critical", "high", "medium"]),
      why_it_matters: z.string(),
      time_to_ready: z.string(),
      phases: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
          duration: z.string(),
        }),
      ),
      resources: z.array(z.string()),
      resume_bullet_template: z.string(),
    }),
  ),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

const SYSTEM_PROMPT = `You are an expert technical recruiter, ATS engineer, and career coach.
Given a RESUME and a JOB DESCRIPTION, analyze fit and return ONLY valid JSON
matching this EXACT schema (no markdown fences, no extra fields):

{
  "overall_score": number 0-100,
  "skill_score": number 0-100,
  "gap_analysis": [
    { "skill": string, "in_resume": boolean, "required": boolean }
  ],  // at least 8 items, mix of matched / missing / bonus
  "suggestions": [
    { "original": string (a real line from the resume),
      "rewrites": [string, string, string] (3 stronger rewrites with metrics & impact) }
  ],  // exactly 3 items

  "ats_simulation": {
    "parse_score": number 0-100,
    "verdict": "pass" | "borderline" | "reject",
    "keyword_matches": [
      { "keyword": string, "resume_count": number, "required": boolean,
        "status": "good" | "low" | "missing" | "stuffed" }
    ],  // 6-10 of the most important JD keywords
    "format_flags": [
      { "issue": string (concrete parseability note),
        "severity": "info" | "warn" | "error" }
    ],  // 3-5 flags
    "extracted_fields": {
      "name": string, "email": string,
      "years_experience": string (e.g. "3 years"),
      "skills": [string]  // top 8 detected
    }
  },

  "recruiter_view": {
    "decision": "yes" | "maybe" | "no",
    "one_liner": string (1 sentence verdict),
    "strengths": [string, string, string],  // exactly 3, tied to JD
    "concerns": [string, string, string],   // exactly 3 red flags
    "seniority_match": string (e.g. "Mid-level candidate vs Senior role"),
    "story": string ("Resume tells the story of a ___")
  },

  "career_roadmap": [
    {
      "skill": string,           // a critical missing/weak skill from the JD
      "priority": "critical" | "high" | "medium",
      "why_it_matters": string,  // 1 sentence on JD relevance
      "time_to_ready": string,   // e.g. "4-6 weeks"
      "phases": [
        { "name": "Foundations", "description": string, "duration": string },
        { "name": "Hands-on Project", "description": string, "duration": string },
        { "name": "Portfolio Proof", "description": string, "duration": string }
      ],
      "resources": [string, string, string],  // 2-3 concrete suggestions
      "resume_bullet_template": string         // ready-to-paste bullet
    }
  ]  // up to 5 items, highest priority first
}

Return ONLY the JSON object.`;

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<Analysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `RESUME:\n${data.resumeText}\n\n---\n\nJOB DESCRIPTION:\n${data.jd}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
      throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    const cleaned = content.trim().replace(/^```json\s*|\s*```$/g, "");

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("AI returned malformed JSON. Please try again.");
    }
    return AnalysisSchema.parse(parsed);
  });
