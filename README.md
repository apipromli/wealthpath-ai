# WealthPath AI 🌟

> Your wealth journey, mapped in seconds.

An AI-powered web application that generates deeply personalized 12-month financial roadmaps based on your unique situation, goals, and risk tolerance. No generic advice — just actionable, context-aware strategy.

**Live Demo:** [https://wealthpath-ai.vercel.app](https://wealthpath-ai.vercel.app)

Built for **Wealthypeople.id Stage 2 Developer Recruitment** by [Apip Romli](https://apipromli.github.io/portofolio/).

---

## ✨ What It Does

WealthPath AI takes a user's financial snapshot — age, income, expenses, savings, goals, risk tolerance — and uses Claude AI (Anthropic) to generate:

- **Wealth Archetype Analysis** — Identifies who you are now and who you'll become in 12 months
- **4-Phase Roadmap** — Foundation, Acceleration, Compound Growth, and Strategic Expansion phases
- **Concrete Milestones** — Specific IDR amounts with deadlines per phase
- **Weekly Action Items** — Tasks you can actually do in 1-3 hours/week
- **AI Insights** — Personalized observations that reference your specific situation
- **Locally Relevant** — Mentions Indonesian platforms (Bibit, Bareksa, Pluang, BCA, etc.)

## 🎯 Why This Matters

Most financial advice is one-size-fits-all. WealthPath AI uses Claude's reasoning capability to deeply understand each user's unique constraints and aspirations, then constructs a roadmap that feels written *for them* — not for a demographic.

**AI is not a chatbot here. AI is the product.**

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| AI | Anthropic Claude (claude-sonnet-4) |
| Deployment | Vercel |

## 🧠 How AI Is Integrated

The integration is server-side and structured. Here's the flow:

1. **User submits financial profile** via form (8 fields)
2. **Frontend POSTs** to `/api/generate-roadmap`
3. **Server-side route** constructs a carefully engineered system prompt that:
   - Defines Claude's role as a financial roadmap architect
   - Enforces Indonesian context (IDR, local platforms)
   - Specifies a strict JSON output schema
   - Demands specificity, actionability, and personalization
4. **Claude returns structured JSON** with archetypes, phases, milestones, tasks, and insights
5. **Frontend renders** the roadmap with progressive animations

The API key never touches the client. All Claude calls happen on Vercel serverless functions.

## 🎨 Branding

- **Name:** WealthPath AI
- **Tagline:** Your wealth journey, mapped in seconds.
- **Aesthetic:** Editorial luxury — midnight blue + royal gold, serif display typography (Playfair Display) paired with refined sans-serif body (Inter)
- **Logo Concept:** An ascending path with milestone nodes leading to a north star — symbolizing clarity, progress, and direction in personal finance

### Color Palette

| Color | Hex | Use |
|-------|-----|-----|
| Midnight | `#0A1628` | Primary dark, text |
| Deep Sea | `#1E3A5F` | Secondary dark |
| Royal Gold | `#D4AF37` | Primary accent |
| Bright Gold | `#FFD700` | Hover states, highlights |
| Cream | `#FAFAF7` | Background |

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- An Anthropic API key ([get one here](https://console.anthropic.com))

### Setup

```bash
# Clone the repo
git clone https://github.com/apipromli/wealthpath-ai.git
cd wealthpath-ai

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Then edit .env.local and add your ANTHROPIC_API_KEY

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add `ANTHROPIC_API_KEY` in Vercel project settings → Environment Variables.

## 📂 Project Structure

```
wealthpath-ai/
├── app/
│   ├── api/
│   │   └── generate-roadmap/
│   │       └── route.ts         # Claude API integration
│   ├── globals.css              # Tailwind + custom styles
│   ├── layout.tsx               # Root layout & metadata
│   └── page.tsx                 # Main UI (landing → form → roadmap)
├── public/
│   ├── logo-icon.svg            # Square icon
│   └── logo-primary.svg         # Wordmark + icon
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

## 🌟 What Makes This Project Unique

1. **Not Just a Chatbot** — The interface is a guided product flow, not a chat window. AI is the engine, not the interaction model.
2. **Indonesian Context** — Most "wealth AI" tools are US-centric. This one speaks IDR, mentions Bibit/Bareksa/Pluang, and understands local financial culture.
3. **Structured AI Output** — Uses prompt engineering to enforce a strict JSON schema. The frontend renders rich, animated UI from this structured data — turning AI text into a *visual product*.
4. **Editorial Design Language** — Most fintech feels cold. WealthPath uses serif typography and gold accents to feel like a wealth advisor's bespoke deliverable.
5. **One-Shot Roadmap, Not Iteration** — Inspired by how a real human advisor works: gather context once, deliver a comprehensive plan. No back-and-forth UX friction.

## 📜 License

Built as a recruitment submission for Wealthypeople.id. Not for redistribution.

## 👤 Author

**Apip Romli**  
Software Engineer | Web Developer  
- Portfolio: [apipromli.github.io/portofolio](https://apipromli.github.io/portofolio/)
- LinkedIn: [linkedin.com/in/apip-romli-305109251](https://linkedin.com/in/apip-romli-305109251)
- GitHub: [@apipromli](https://github.com/apipromli)
- Email: apipromli08@gmail.com

---

*Built with care, in 36 hours, for Wealthypeople.id Stage 2 Recruitment — April 2026.*
