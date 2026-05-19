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
});

export type Analysis = z.infer<typeof AnalysisSchema>;

const SYSTEM_PROMPT = `You are an expert technical recruiter and resume analyzer.
Given a RESUME and a JOB DESCRIPTION, analyze the fit and return ONLY valid JSON
matching this exact schema:

{
  "overall_score": number (0-100, overall fit),
  "skill_score": number (0-100, technical skill match),
  "gap_analysis": [
    { "skill": string, "in_resume": boolean, "required": boolean }
  ],
  "suggestions": [
    { "original": string (a real line from the resume that could be improved),
      "rewrites": [string, string, string] (3 stronger rewrites using metrics & impact) }
  ]
}

Include at least 8 skills in gap_analysis covering matched, missing, and bonus skills.
Provide 3 suggestion items. Return ONLY the JSON object, no markdown fences.`;

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
