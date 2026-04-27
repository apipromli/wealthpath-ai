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

export async function POST(req: NextRequest) {
  try {
    const data: RoadmapInput = await req.json();

    if (!data.age || !data.monthlyIncome || !data.primaryGoal) {
      return NextResponse.json(
        { error: "Missing required fields: age, monthlyIncome, primaryGoal" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://wealthpath-fc5ypi9o4-apipromlis-projects.vercel.app",
        "X-Title": "WealthPath AI",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(data) },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${errBody}`);
    }

    const json = await response.json();
    const rawText: string = json.choices?.[0]?.message?.content ?? "";

    if (!rawText) throw new Error("Empty response from AI model");

    // Strip markdown code fences if present
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const roadmap = JSON.parse(cleaned);

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
