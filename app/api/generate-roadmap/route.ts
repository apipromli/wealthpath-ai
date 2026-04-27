import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
1. Output VALID JSON only — no markdown fences, no preamble.
2. All currency in IDR (Indonesian Rupiah).
3. Be specific, actionable, and locally relevant (mention BCA, Mandiri, Bibit, Bareksa, Pluang, Reksadana, Saham IDX, P2P lending where relevant).
4. Tone: warm but professional. Encouraging but honest.
5. Each milestone must have concrete numbers and deadlines.
6. Weekly tasks must be achievable in 1-3 hours/week.
7. Insights must feel personal — reference their specific situation.

OUTPUT JSON SCHEMA:
{
  "headline": "string - one inspiring sentence about their journey (max 15 words)",
  "currentArchetype": "string - their current wealth archetype, e.g. 'The Cautious Builder', 'The Ambitious Starter'",
  "targetArchetype": "string - who they'll become in 12 months",
  "executiveSummary": "string - 2-3 sentence overview of the strategy",
  "phases": [
    {
      "phaseNumber": 1,
      "phaseName": "string - e.g. 'Foundation Phase'",
      "monthRange": "string - e.g. 'Month 1-3'",
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
    "riskLevel": "string - Low/Medium/High with reasoning"
  },
  "personalNote": "string - a closing motivational message that references their specific goal, 2-3 sentences, warm tone"
}

Generate exactly 4 phases covering all 12 months. Each phase has 2-3 milestones, 3-4 weekly tasks, and 1 AI insight.`;

function buildUserPrompt(data: RoadmapInput): string {
  return `Generate a personalized 12-month financial roadmap for this person:

- Age: ${data.age} years old
- Occupation: ${data.occupation}
- Monthly income: IDR ${data.monthlyIncome}
- Monthly expenses: IDR ${data.monthlyExpenses}
- Current savings: IDR ${data.currentSavings}
- Primary goal: ${data.primaryGoal}
- Goal target amount: IDR ${data.goalAmount}
- Risk tolerance: ${data.riskTolerance}

Make it specific, actionable, and tailored to their reality. Calculate realistic numbers based on their cash flow.`;
}

export async function POST(req: NextRequest) {
  try {
    const data: RoadmapInput = await req.json();

    // Basic validation
    if (!data.age || !data.monthlyIncome || !data.primaryGoal) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildUserPrompt(data) },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    let rawText = textBlock.text.trim();
    rawText = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    const roadmap = JSON.parse(rawText);

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
