import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type RoadmapInput = {
  age: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  currentSavings: string;
  primaryGoal: string;
  goalAmount: string;
  riskTolerance: string;
  occupation: string;
};

const SYSTEM_PROMPT = `You are WealthPath AI — an empathetic, expert financial roadmap architect for Indonesian users.

Your job: take a user's financial snapshot and generate a deeply personalized 12-month wealth-building roadmap.

CRITICAL RULES:
1. Output VALID JSON only — no markdown fences, no preamble, no explanation. Raw JSON only.
2. All currency in IDR (Indonesian Rupiah).
3. Be specific, actionable, and locally relevant (mention BCA, Mandiri, Bibit, Bareksa, Pluang, Reksadana, Saham IDX, P2P lending where relevant).
4. Tone: warm but professional. Encouraging but honest.
5. Each milestone must have concrete numbers and deadlines.
6. Weekly tasks must be achievable in 1-3 hours/week.
7. Insights must feel personal — reference their specific situation.

OUTPUT JSON SCHEMA (strictly follow this — output nothing else):
{
  "headline": "string - one inspiring sentence about their journey (max 15 words)",
  "currentArchetype": "string - their current wealth archetype, e.g. 'The Cautious Builder'",
  "targetArchetype": "string - who they will become in 12 months",
  "executiveSummary": "string - 2-3 sentence overview of the strategy",
  "phases": [
    {
      "phaseNumber": 1,
      "phaseName": "string - e.g. Foundation Phase",
      "monthRange": "string - e.g. Month 1-3",
      "objective": "string - main goal of this phase",
      "milestones": [
        {"title": "string", "targetAmount": "string IDR formatted", "deadline": "string month"}
      ],
      "weeklyTasks": ["string", "string", "string"],
      "aiInsight": "string - personalized insight tying to their situation, 2 sentences"
    }
  ],
  "keyMetrics": {
    "monthlyTargetSavings": "string IDR formatted",
    "projectedNetWorthEnd": "string IDR formatted",
    "riskLevel": "string - Low/Medium/High with brief reasoning"
  },
  "personalNote": "string - closing motivational message referencing their specific goal, 2-3 sentences, warm tone"
}

Generate exactly 4 phases covering all 12 months. Each phase: 2-3 milestones, 3-4 weekly tasks, 1 AI insight.`;

function buildUserPrompt(data: RoadmapInput): string {
  return `Generate a personalized 12-month financial roadmap for this Indonesian user:

- Age: ${data.age} years old
- Occupation: ${data.occupation}
- Monthly income: IDR ${data.monthlyIncome}
- Monthly expenses: IDR ${data.monthlyExpenses}
- Current savings: IDR ${data.currentSavings}
- Primary financial goal: ${data.primaryGoal}
- Goal target amount: IDR ${data.goalAmount}
- Risk tolerance: ${data.riskTolerance}

Output only valid JSON. No markdown, no extra text. Start your response with { and end with }.`;
}

function extractRoadmap(rawText: string): Record<string, unknown> | null {
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

/* Call native Gemini API (generativelanguage.googleapis.com) */
async function callGemini(
  model: string,
  apiKey: string,
  userPrompt: string,
  signal: AbortSignal
): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
    }),
  });
  if (res.status === 429 || res.status === 404 || !res.ok) return null;
  const json = await res.json() as Record<string, unknown>;
  return (json.candidates as Array<{ content: { parts: Array<{ text: string }> } }>)
    ?.[0]?.content?.parts?.[0]?.text ?? null;
}

/* Call OpenAI-compatible APIs (OpenRouter, Groq) */
async function callOpenAICompat(
  url: string,
  model: string,
  authHeader: string,
  extraHeaders: Record<string, string>,
  userPrompt: string,
  signal: AbortSignal
): Promise<string | null> {
  const res = await fetch(url, {
    method: "POST",
    signal,
    headers: { Authorization: authHeader, "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });
  if (res.status === 429 || res.status === 404 || !res.ok) return null;
  const json = await res.json() as Record<string, unknown>;
  return (json.choices as Array<{ message: { content: string } }>)?.[0]?.message?.content ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const data: RoadmapInput = await req.json();

    if (!data.age || !data.monthlyIncome || !data.primaryGoal) {
      return NextResponse.json(
        { error: "Missing required fields: age, monthlyIncome, primaryGoal" },
        { status: 400 }
      );
    }

    const googleKey = process.env.GOOGLE_AI_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!googleKey && !groqKey && !openrouterKey) {
      return NextResponse.json({ error: "No AI API key configured." }, { status: 500 });
    }

    const userPrompt = buildUserPrompt(data);
    let roadmap: Record<string, unknown> | null = null;

    /*
     * Total Vercel budget: 60s.
     * Strategy (timed to fit within 55s worst-case):
     *   1. gemma-3-12b-it  — 20s  (fast: ~15s for full roadmap, confirmed working)
     *   2. gemma-3-4b-it   — 18s  (faster fallback)
     *   3. OpenRouter x2   —  8s each  (quick 429 check, skip if rate-limited)
     * Worst-case total: 20+18+8+8 = 54s  ✓
     */

    /* ── 1. Gemini: fast non-thinking models only ── */
    if (googleKey && !roadmap) {
      for (const [model, ms] of [
        ["gemma-3-12b-it", 20000],
        ["gemma-3-4b-it",  18000],
      ] as [string, number][]) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ms);
        try {
          const text = await callGemini(model, googleKey, userPrompt, controller.signal);
          if (text) { roadmap = extractRoadmap(text); if (roadmap) break; }
        } catch { /* timeout — try next */ }
        finally { clearTimeout(timer); }
      }
    }

    /* ── 2. Groq (if key exists) ── */
    if (groqKey && !roadmap) {
      for (const model of ["llama-3.3-70b-versatile", "gemma2-9b-it"]) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 18000);
        try {
          const text = await callOpenAICompat(
            "https://api.groq.com/openai/v1/chat/completions",
            model, `Bearer ${groqKey}`, {}, userPrompt, controller.signal
          );
          if (text) { roadmap = extractRoadmap(text); if (roadmap) break; }
        } catch { /* timeout */ }
        finally { clearTimeout(timer); }
      }
    }

    /* ── 3. OpenRouter fallback (2 models max, 8s each — mainly for 429 skip) ── */
    if (openrouterKey && !roadmap) {
      const OR_POOL = [
        "openai/gpt-oss-20b:free", "google/gemma-4-31b-it:free",
        "openai/gpt-oss-120b:free", "google/gemma-3-12b-it:free",
      ];
      for (let i = OR_POOL.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [OR_POOL[i], OR_POOL[j]] = [OR_POOL[j], OR_POOL[i]];
      }
      for (const model of OR_POOL.slice(0, 2)) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
          const text = await callOpenAICompat(
            "https://openrouter.ai/api/v1/chat/completions",
            model, `Bearer ${openrouterKey}`,
            { "HTTP-Referer": "https://wealthpath-ai-apipromlis-projects.vercel.app", "X-Title": "WealthPath AI" },
            userPrompt, controller.signal
          );
          if (text) { roadmap = extractRoadmap(text); if (roadmap) break; }
        } catch { /* timeout */ }
        finally { clearTimeout(timer); }
      }
    }

    if (!roadmap) {
      throw new Error("AI servers are currently busy — please try again in about a minute.");
    }

    return NextResponse.json({ success: true, roadmap });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Roadmap generation error:", msg);
    return NextResponse.json(
      { error: msg || "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
