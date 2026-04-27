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

type ModelCandidate = { url: string; model: string; authHeader: string };

function parseRoadmap(rawText: string): Record<string, unknown> | null {
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

export async function POST(req: NextRequest) {
  try {
    const data: RoadmapInput = await req.json();

    if (!data.age || !data.monthlyIncome || !data.primaryGoal) {
      return NextResponse.json(
        { error: "Missing required fields: age, monthlyIncome, primaryGoal" },
        { status: 400 }
      );
    }

    const groqKey = process.env.GROQ_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!groqKey && !openrouterKey) {
      return NextResponse.json(
        { error: "No AI API key configured on the server." },
        { status: 500 }
      );
    }

    /* Build candidate list: Groq first (fast + reliable), then OpenRouter fallback */
    const candidates: ModelCandidate[] = [];

    if (groqKey) {
      for (const model of [
        "llama-3.3-70b-versatile",
        "llama3-70b-8192",
        "gemma2-9b-it",
        "llama-3.1-8b-instant",
      ]) {
        candidates.push({
          url: "https://api.groq.com/openai/v1/chat/completions",
          model,
          authHeader: `Bearer ${groqKey}`,
        });
      }
    }

    if (openrouterKey) {
      const OR_POOL = [
        "openai/gpt-oss-120b:free",
        "openai/gpt-oss-20b:free",
        "google/gemma-4-31b-it:free",
        "nvidia/nemotron-3-super-120b-a12b:free",
        "qwen/qwen3-next-80b-a3b-instruct:free",
        "google/gemma-3-27b-it:free",
        "nousresearch/hermes-3-llama-3.1-405b:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemma-3-12b-it:free",
      ];
      /* Shuffle OpenRouter pool */
      for (let i = OR_POOL.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [OR_POOL[i], OR_POOL[j]] = [OR_POOL[j], OR_POOL[i]];
      }
      for (const model of OR_POOL.slice(0, 5)) {
        candidates.push({
          url: "https://openrouter.ai/api/v1/chat/completions",
          model,
          authHeader: `Bearer ${openrouterKey}`,
        });
      }
    }

    let roadmap: Record<string, unknown> | null = null;
    let lastError = "";

    for (const { url, model, authHeader } of candidates) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 28000);

      try {
        const extraHeaders: Record<string, string> = url.includes("openrouter")
          ? {
              "HTTP-Referer": "https://wealthpath-ai-apipromlis-projects.vercel.app",
              "X-Title": "WealthPath AI",
            }
          : {};

        const response = await fetch(url, {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            ...extraHeaders,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: buildUserPrompt(data) },
            ],
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });

        if (response.status === 429 || response.status === 404) {
          lastError = `${model} unavailable (${response.status})`;
          continue;
        }

        if (!response.ok) {
          lastError = `${model} error ${response.status}`;
          continue;
        }

        const json = await response.json() as Record<string, unknown>;
        const rawText: string =
          (json.choices as Array<{ message: { content: string } }>)?.[0]?.message?.content ?? "";

        if (!rawText) { lastError = `${model} empty response`; continue; }

        const parsed = parseRoadmap(rawText);
        if (!parsed) { lastError = `${model} returned invalid JSON`; continue; }

        roadmap = parsed;
        break;
      } catch {
        lastError = `${model} timed out`;
        continue;
      } finally {
        clearTimeout(timer);
      }
    }

    if (!roadmap) {
      throw new Error(
        "AI servers are currently busy — please try again in about a minute."
      );
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
