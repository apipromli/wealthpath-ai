"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, TrendingUp, Target, Calendar,
  CheckCircle2, Loader2, Compass, Moon, Sun,
  Copy, Check, Printer, ChevronDown, ChevronUp,
  ArrowUp, BarChart3, Wallet, Shield, MapPin, Zap,
  Users, Star, HelpCircle, ChevronRight,
} from "lucide-react";

/* ─── TYPES ─────────────────────────────────────────────── */
type Step = "landing" | "form" | "loading" | "result";

type FormData = {
  age: string;
  occupation: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  currentSavings: string;
  primaryGoal: string;
  goalAmount: string;
  riskTolerance: string;
};

type Phase = {
  phaseNumber: number;
  phaseName: string;
  monthRange: string;
  objective: string;
  milestones: Array<{ title: string; targetAmount: string; deadline: string }>;
  weeklyTasks: string[];
  aiInsight: string;
};

type Roadmap = {
  headline: string;
  currentArchetype: string;
  targetArchetype: string;
  executiveSummary: string;
  phases: Phase[];
  keyMetrics: {
    monthlyTargetSavings: string;
    projectedNetWorthEnd: string;
    riskLevel: string;
  };
  personalNote: string;
};

type Particle = { top: string; left: string; duration: string; delay: string };

/* ─── THEME HOOK ─────────────────────────────────────────── */
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("wp-theme") as "light" | "dark" | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const initial = stored || preferred;
    setTheme(initial);
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("wp-theme", next);
      return next;
    });
  }, []);

  return { theme, toggle, mounted };
}

/* ─── HELPERS ───────────────────────────────────────────── */
function formatIDRDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const LOADING_STEPS = [
  "Analyzing your financial profile…",
  "Identifying your wealth archetype…",
  "Mapping your 12-month strategy…",
  "Crafting personalized insights…",
];

const STATS = [
  { value: "4 Phases", label: "Structured Journey", icon: Target },
  { value: "12 Months", label: "Clear Roadmap", icon: Calendar },
  { value: "AI-Powered", label: "Personalized Advice", icon: Sparkles },
];

/* ─── LOGO ──────────────────────────────────────────────── */
const Logo = () => (
  <div className="flex items-center gap-3">
    {/* Icon — matches branding/logo-icon.svg exactly */}
    <svg
      width="40" height="40"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
        <linearGradient id="logoDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A1628" />
          <stop offset="100%" stopColor="#1E3A5F" />
        </linearGradient>
      </defs>
      {/* Background rounded square */}
      <rect width="80" height="80" rx="16" fill="url(#logoDarkGrad)" />
      {/* Ascending path with milestone nodes */}
      <path
        d="M 18 60 L 30 50 L 42 40 L 54 28 L 64 18"
        stroke="url(#logoGoldGrad)" strokeWidth="3.5"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <circle cx="18" cy="60" r="3.5" fill="#FFD700" />
      <circle cx="30" cy="50" r="3" fill="#FFD700" opacity="0.85" />
      <circle cx="42" cy="40" r="3" fill="#FFD700" opacity="0.85" />
      <circle cx="54" cy="28" r="3" fill="#FFD700" opacity="0.85" />
      <circle cx="64" cy="18" r="5" fill="#FFD700" />
      {/* Star / north light at apex */}
      <path
        d="M 64 10 L 65.5 16.5 L 72 18 L 65.5 19.5 L 64 26 L 62.5 19.5 L 56 18 L 62.5 16.5 Z"
        fill="white" opacity="0.9"
      />
    </svg>
    <div>
      <div className="font-display text-xl font-bold leading-none text-midnight dark:text-cream">
        Wealth<span className="gradient-text">Path</span>
      </div>
      <div className="text-[9px] tracking-[0.3em] text-midnight/50 dark:text-cream/40 mt-0.5">
        AI · ROADMAP
      </div>
    </div>
  </div>
);

/* ─── THEME TOGGLE ──────────────────────────────────────── */
const ThemeToggle = ({
  theme,
  toggle,
  mounted,
}: {
  theme: "light" | "dark";
  toggle: () => void;
  mounted: boolean;
}) => (
  <button
    onClick={toggle}
    aria-label="Toggle theme"
    className="w-9 h-9 rounded-xl flex items-center justify-center border border-midnight/10 dark:border-cream/10 bg-white dark:bg-dark-surface hover:bg-cream dark:hover:bg-dark-card text-midnight dark:text-cream transition-all duration-200 hover:scale-105 active:scale-95"
  >
    {mounted ? (
      theme === "dark" ? (
        <Sun className="w-4 h-4 text-royal-gold" />
      ) : (
        <Moon className="w-4 h-4" />
      )
    ) : (
      <span className="w-4 h-4" />
    )}
  </button>
);

/* ─── FORM FIELD ────────────────────────────────────────── */
function Field({
  label,
  placeholder,
  value,
  onChange,
  hint,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-midnight dark:text-cream mb-1.5">
        {label}
      </label>
      {hint && (
        <p className="text-xs text-midnight/50 dark:text-cream/40 mb-2">{hint}</p>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-cream dark:bg-dark-surface border border-midnight/15 dark:border-cream/10 rounded-xl text-midnight dark:text-cream placeholder:text-midnight/35 dark:placeholder:text-cream/25 focus:outline-none focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 transition-all text-sm"
      />
    </div>
  );
}

function IDRField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (raw: string) => void;
}) {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
    onChange(raw);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-midnight dark:text-cream mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-midnight/50 dark:text-cream/40 font-medium select-none">
          Rp
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={formatIDRDisplay(value)}
          onChange={handleInput}
          placeholder="0"
          className="w-full pl-10 pr-4 py-3 bg-cream dark:bg-dark-surface border border-midnight/15 dark:border-cream/10 rounded-xl text-midnight dark:text-cream placeholder:text-midnight/35 dark:placeholder:text-cream/25 focus:outline-none focus:border-royal-gold focus:ring-2 focus:ring-royal-gold/20 transition-all text-sm"
        />
      </div>
    </div>
  );
}

/* ─── FAQ ITEM ──────────────────────────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-midnight/8 dark:border-cream/8 rounded-2xl overflow-hidden bg-white dark:bg-dark-surface">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-cream/50 dark:hover:bg-dark-card/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <HelpCircle className="w-4 h-4 text-royal-gold flex-shrink-0" />
          <span className="font-medium text-midnight dark:text-cream text-sm">{question}</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-midnight/40 dark:text-cream/40 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-midnight/40 dark:text-cream/40 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.18 } }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1 text-sm text-midnight/60 dark:text-cream/50 leading-relaxed border-t border-midnight/5 dark:border-cream/5 ml-7">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────── */
export default function Home() {
  const { theme, toggle, mounted } = useTheme();

  const [step, setStep] = useState<Step>("landing");
  const [formData, setFormData] = useState<FormData>({
    age: "",
    occupation: "",
    monthlyIncome: "",
    monthlyExpenses: "",
    currentSavings: "",
    primaryGoal: "",
    goalAmount: "",
    riskTolerance: "Moderate",
  });
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [error, setError] = useState<string>("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(
    new Set([0])
  );

  /* Generate particles client-side to avoid hydration mismatch */
  useEffect(() => {
    setParticles(
      Array.from({ length: 28 }, () => ({
        top: `${Math.random() * 90 + 5}%`,
        left: `${Math.random() * 90 + 5}%`,
        duration: `${(Math.random() * 3 + 3).toFixed(1)}s`,
        delay: `${(Math.random() * 4).toFixed(1)}s`,
      }))
    );
  }, []);

  /* Scroll-to-top visibility */
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Loading step progression */
  useEffect(() => {
    if (step !== "loading") { setLoadingStep(0); return; }
    const timers = [
      setTimeout(() => setLoadingStep(1), 8000),
      setTimeout(() => setLoadingStep(2), 16000),
      setTimeout(() => setLoadingStep(3), 24000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const handleChange = (k: keyof FormData, v: string) =>
    setFormData((p) => ({ ...p, [k]: v }));

  const canSubmit =
    formData.age.trim() &&
    formData.monthlyIncome.trim() &&
    formData.primaryGoal.trim();

  const generateRoadmap = async () => {
    setStep("loading");
    setError("");
    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.status === 504) {
        throw new Error("AI servers are currently busy — please try again in about a minute.");
      }
      let data: { error?: string; roadmap?: Roadmap };
      try {
        data = await res.json();
      } catch {
        throw new Error("AI servers are currently busy — please try again in about a minute.");
      }
      if (!res.ok) throw new Error(data.error || "Failed to generate roadmap");
      setRoadmap(data.roadmap!);
      setStep("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("form");
    }
  };

  const handleShare = async () => {
    if (!roadmap) return;
    const text = [
      `WealthPath AI — ${roadmap.headline}`,
      "",
      roadmap.executiveSummary,
      "",
      `Current: ${roadmap.currentArchetype}`,
      `Target: ${roadmap.targetArchetype}`,
      "",
      `Monthly Savings Target: ${roadmap.keyMetrics.monthlyTargetSavings}`,
      `Projected Net Worth (Y1): ${roadmap.keyMetrics.projectedNetWorthEnd}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const togglePhase = (i: number) =>
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const resetToLanding = () => {
    setStep("landing");
    setRoadmap(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── FADE VARIANTS ── */
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
    }),
    exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
  };

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <main className="min-h-screen bg-cream dark:bg-dark-bg transition-colors duration-300">

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-cream/80 dark:bg-dark-bg/80 border-b border-midnight/5 dark:border-cream/5 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            {step !== "landing" && (
              <button
                onClick={resetToLanding}
                className="text-sm text-midnight/60 dark:text-cream/50 hover:text-midnight dark:hover:text-cream transition-colors"
              >
                ← Start Over
              </button>
            )}
            <ThemeToggle theme={theme} toggle={toggle} mounted={mounted} />
          </div>
        </div>
      </header>

      {/* ── PAGE SECTIONS ── */}
      <AnimatePresence mode="wait">

        {/* ━━━━━━ LANDING ━━━━━━ */}
        {step === "landing" && (
          <motion.section
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {/* HERO */}
            <div className="hero-bg min-h-screen flex items-center justify-center pt-20 px-6 relative overflow-hidden">
              {/* Animated particles */}
              <div className="absolute inset-0 pointer-events-none">
                {particles.map((p, i) => (
                  <div
                    key={i}
                    className="particle absolute w-1 h-1 bg-bright-gold rounded-full"
                    style={
                      {
                        top: p.top,
                        left: p.left,
                        "--duration": p.duration,
                        "--delay": p.delay,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>

              {/* Radial glow behind headline */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-royal-gold/5 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                  variants={fadeUp} initial="hidden" animate="show" custom={0}
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-royal-gold/10 border border-royal-gold/30 text-royal-gold text-xs tracking-widest mb-8">
                    <Sparkles className="w-3 h-3" />
                    AI-POWERED · PERSONALIZED · ACTIONABLE
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeUp} initial="hidden" animate="show" custom={1}
                  className="font-display text-5xl md:text-7xl text-cream font-bold leading-tight mb-6"
                >
                  Your wealth journey,
                  <br />
                  <span className="gradient-text italic">mapped in seconds.</span>
                </motion.h1>

                <motion.p
                  variants={fadeUp} initial="hidden" animate="show" custom={2}
                  className="text-cream/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                  Stop guessing. Get an AI-generated 12-month roadmap with
                  concrete milestones, weekly actions, and insights tailored to
                  your reality — not generic advice.
                </motion.p>

                <motion.div
                  variants={fadeUp} initial="hidden" animate="show" custom={3}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setStep("form")}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-royal-gold text-midnight font-semibold rounded-full hover:bg-bright-gold transition-colors gold-glow"
                  >
                    Build My Roadmap
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <span className="text-cream/40 text-sm">Free · No sign-up · ~2 min</span>
                </motion.div>

                {/* Stat pills */}
                <motion.div
                  variants={fadeUp} initial="hidden" animate="show" custom={4}
                  className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-20"
                >
                  {STATS.map((s, i) => (
                    <div
                      key={i}
                      className="bg-cream/5 border border-cream/10 rounded-2xl p-4 backdrop-blur-sm text-center"
                    >
                      <s.icon className="w-5 h-5 text-royal-gold mx-auto mb-2" />
                      <div className="text-cream font-semibold text-sm">{s.value}</div>
                      <div className="text-cream/50 text-[11px] mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </motion.div>

                {/* Feature cards */}
                <motion.div
                  variants={fadeUp} initial="hidden" animate="show" custom={5}
                  className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto"
                >
                  {[
                    {
                      icon: Compass,
                      title: "Personalized",
                      desc: "AI analyzes your unique financial DNA",
                    },
                    {
                      icon: Target,
                      title: "Actionable",
                      desc: "Weekly tasks, not vague advice",
                    },
                    {
                      icon: TrendingUp,
                      title: "Realistic",
                      desc: "Built from your real numbers",
                    },
                  ].map((f, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -4 }}
                      className="text-left bg-cream/5 border border-cream/10 rounded-2xl p-6 backdrop-blur-sm cursor-default"
                    >
                      <f.icon className="w-6 h-6 text-royal-gold mb-3" />
                      <div className="text-cream font-semibold mb-1">{f.title}</div>
                      <div className="text-cream/60 text-sm">{f.desc}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* HOW IT WORKS */}
            <div className="bg-cream dark:bg-dark-bg py-24 px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-14">
                  <span className="text-xs tracking-widest text-royal-gold uppercase">Process</span>
                  <h2 className="font-display text-4xl font-bold mt-2 text-midnight dark:text-cream">
                    Three steps to clarity
                  </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: Wallet,
                      step: "01",
                      title: "Share your numbers",
                      desc: "Income, expenses, savings, and your biggest financial goal. Takes under 2 minutes.",
                    },
                    {
                      icon: Sparkles,
                      step: "02",
                      title: "AI builds your plan",
                      desc: "AI analyzes your situation and crafts a 4-phase, 12-month roadmap personalized to you.",
                    },
                    {
                      icon: Shield,
                      step: "03",
                      title: "Execute with confidence",
                      desc: "Follow weekly tasks, hit milestones, and track your progress toward financial freedom.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="relative">
                      <div className="text-6xl font-display font-bold text-royal-gold/10 dark:text-royal-gold/15 mb-4 select-none">
                        {item.step}
                      </div>
                      <item.icon className="w-7 h-7 text-royal-gold mb-3" />
                      <h3 className="font-display text-xl font-semibold mb-2 text-midnight dark:text-cream">
                        {item.title}
                      </h3>
                      <p className="text-midnight/60 dark:text-cream/50 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                      {i < 2 && (
                        <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 text-royal-gold/30 text-2xl select-none">
                          →
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WHAT YOU GET */}
            <div className="bg-midnight py-24 px-6 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-royal-gold/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-royal-gold/3 rounded-full blur-3xl" />
              </div>
              <div className="max-w-5xl mx-auto relative">
                <div className="text-center mb-14">
                  <span className="text-xs tracking-widest text-royal-gold uppercase">Deliverable</span>
                  <h2 className="font-display text-4xl font-bold mt-2 text-cream">
                    What&apos;s inside your roadmap
                  </h2>
                  <p className="text-cream/50 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
                    Not a generic template. A structured strategic plan built from your exact numbers.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    {
                      icon: Target,
                      title: "Wealth Archetypes",
                      desc: "Know where you stand today and who you'll become in 12 months.",
                      badge: "Identity",
                    },
                    {
                      icon: MapPin,
                      title: "4 Strategic Phases",
                      desc: "Foundation → Acceleration → Compound Growth → Strategic Expansion.",
                      badge: "Structure",
                    },
                    {
                      icon: TrendingUp,
                      title: "IDR Milestones",
                      desc: "Concrete Rupiah targets with specific deadlines — no vague goals.",
                      badge: "Precision",
                    },
                    {
                      icon: Calendar,
                      title: "Weekly Action Tasks",
                      desc: "3–4 achievable tasks per phase, designed for 1–3 hours per week.",
                      badge: "Execution",
                    },
                    {
                      icon: Zap,
                      title: "AI Insights",
                      desc: "Personalized commentary that references your actual income, age, and goal.",
                      badge: "Intelligence",
                    },
                    {
                      icon: BarChart3,
                      title: "Key Metrics Dashboard",
                      desc: "Monthly savings target, projected net worth, and risk assessment.",
                      badge: "Analytics",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      className="bg-cream/5 border border-cream/10 rounded-2xl p-6 hover:border-royal-gold/30 hover:bg-cream/8 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-royal-gold/10 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-royal-gold" />
                        </div>
                        <span className="text-[10px] tracking-widest text-royal-gold/60 uppercase">{item.badge}</span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-cream mb-2">{item.title}</h3>
                      <p className="text-cream/50 text-sm leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* BUILT FOR INDONESIA */}
            <div className="bg-cream dark:bg-dark-bg py-24 px-6">
              <div className="max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <span className="text-xs tracking-widest text-royal-gold uppercase">Local Context</span>
                    <h2 className="font-display text-4xl font-bold mt-2 mb-4 text-midnight dark:text-cream leading-tight">
                      Built for Indonesian professionals
                    </h2>
                    <p className="text-midnight/60 dark:text-cream/50 text-base leading-relaxed mb-6">
                      Every recommendation is grounded in the Indonesian financial landscape — not copied from US-centric templates.
                      The AI thinks in Rupiah and knows where to put your money.
                    </p>
                    <div className="space-y-3">
                      {[
                        { label: "All amounts in IDR (Indonesian Rupiah)", icon: "🇮🇩" },
                        { label: "References Bibit, Bareksa & Pluang for investing", icon: "📈" },
                        { label: "Mentions BCA, Mandiri & local banking", icon: "🏦" },
                        { label: "Accounts for IDX stocks & Reksadana", icon: "💹" },
                        { label: "Understands Indonesian income & expense reality", icon: "✅" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-midnight/70 dark:text-cream/60">
                          <span className="text-base">{item.icon}</span>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-midnight to-deep-sea rounded-3xl p-8 text-cream relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-royal-gold/10 rounded-full blur-2xl" />
                    <div className="text-[11px] tracking-widest text-royal-gold uppercase mb-4">Sample Archetype</div>
                    <div className="font-display text-2xl font-bold text-cream mb-2">The Ambitious Builder</div>
                    <div className="text-cream/50 text-sm mb-6">25 yo · Software Developer · Jakarta</div>
                    <div className="space-y-3">
                      {[
                        { label: "Monthly Savings Target", value: "Rp 3.500.000" },
                        { label: "12-Month Goal", value: "Rp 50.000.000" },
                        { label: "Risk Level", value: "Moderate-Aggressive" },
                      ].map((m, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-cream/8 pb-3">
                          <span className="text-cream/50 text-xs">{m.label}</span>
                          <span className="text-royal-gold font-semibold text-sm">{m.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-royal-gold flex-shrink-0 mt-0.5" />
                      <p className="text-cream/60 text-xs leading-relaxed italic">
                        &quot;Prioritaskan Bibit Reksa Dana Pasar Uang untuk dana darurat 3 bulan dulu,
                        baru alihkan ke Saham IDX Blue Chip…&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TESTIMONIALS / SAMPLE PROFILES */}
            <div className="bg-cream dark:bg-dark-bg border-t border-midnight/5 dark:border-cream/5 py-20 px-6">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <span className="text-xs tracking-widest text-royal-gold uppercase">Who It&apos;s For</span>
                  <h2 className="font-display text-4xl font-bold mt-2 text-midnight dark:text-cream">
                    Every financial starting point
                  </h2>
                  <p className="text-midnight/50 dark:text-cream/40 mt-2 text-sm">
                    WealthPath AI adapts to where you are, not where a template says you should be.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      emoji: "🧑‍💼",
                      name: "Fresh Graduate",
                      income: "Rp 5–8 jt/bln",
                      goal: "Emergency fund + first investment",
                      archetype: "The Cautious Starter",
                    },
                    {
                      emoji: "👩‍💻",
                      name: "Mid-Career Professional",
                      income: "Rp 12–20 jt/bln",
                      goal: "Down payment rumah",
                      archetype: "The Ambitious Builder",
                    },
                    {
                      emoji: "🧑‍🍳",
                      name: "Freelancer / UMKM",
                      income: "Rp 8–25 jt/bln",
                      goal: "Modal usaha & diversifikasi",
                      archetype: "The Independent Grower",
                    },
                  ].map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className="bg-white dark:bg-dark-surface border border-midnight/8 dark:border-cream/8 rounded-2xl p-6 card-hover"
                    >
                      <div className="text-3xl mb-4">{p.emoji}</div>
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-3 h-3 text-royal-gold" />
                        <span className="text-xs text-royal-gold font-medium tracking-wide">{p.archetype}</span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-midnight dark:text-cream mb-3">{p.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-midnight/60 dark:text-cream/50">
                          <Wallet className="w-3.5 h-3.5 text-royal-gold/60" />
                          {p.income}
                        </div>
                        <div className="flex items-center gap-2 text-midnight/60 dark:text-cream/50">
                          <Target className="w-3.5 h-3.5 text-royal-gold/60" />
                          {p.goal}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-cream dark:bg-dark-bg border-t border-midnight/5 dark:border-cream/5 py-24 px-6">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-14">
                  <span className="text-xs tracking-widest text-royal-gold uppercase">FAQ</span>
                  <h2 className="font-display text-4xl font-bold mt-2 text-midnight dark:text-cream">
                    Common questions
                  </h2>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      q: "Apakah ini benar-benar gratis?",
                      a: "Ya, 100% gratis. Tidak perlu daftar akun, tidak ada biaya tersembunyi. Masukkan data, dapatkan roadmap.",
                    },
                    {
                      q: "Seberapa akurat roadmap yang dihasilkan?",
                      a: "Roadmap dibangun langsung dari angka yang kamu berikan. Semakin akurat datamu, semakin relevan hasilnya. AI menggunakan konteks Indonesia (IDR, platform lokal) untuk menjaga relevansi.",
                    },
                    {
                      q: "Apakah data keuangan saya aman?",
                      a: "Data hanya digunakan untuk menghasilkan roadmap dan tidak disimpan di server kami. Setiap sesi adalah fresh request yang langsung diproses AI.",
                    },
                    {
                      q: "Berapa lama proses pembuatan roadmap?",
                      a: "Rata-rata 15–30 detik. Kamu akan melihat progress AI secara real-time selama prosesnya berlangsung.",
                    },
                    {
                      q: "Bisakah saya membuat roadmap lebih dari sekali?",
                      a: "Ya, kamu bisa generate ulang kapan saja — misalnya ketika situasi keuanganmu berubah atau ingin mencoba skenario berbeda.",
                    },
                  ].map((faq, i) => (
                    <FAQItem key={i} question={faq.q} answer={faq.a} />
                  ))}
                </div>
              </div>
            </div>

            {/* FINAL CTA */}
            <div className="bg-gradient-to-br from-midnight via-deep-sea to-midnight py-24 px-6 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-royal-gold/8 rounded-full blur-3xl" />
              </div>
              <div className="max-w-2xl mx-auto text-center relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Users className="w-8 h-8 text-royal-gold mx-auto mb-6" />
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-4 leading-tight">
                    Your 12-month roadmap is{" "}
                    <span className="gradient-text italic">waiting.</span>
                  </h2>
                  <p className="text-cream/60 text-lg mb-8 leading-relaxed">
                    Stop postponing your financial future. It takes 2 minutes.
                    The roadmap takes 30 seconds. The clarity is permanent.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setStep("form")}
                    className="group inline-flex items-center gap-3 px-10 py-5 bg-royal-gold text-midnight font-semibold rounded-full hover:bg-bright-gold transition-colors gold-glow text-lg"
                  >
                    Build My Roadmap — Free
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <p className="text-cream/30 text-xs mt-4">
                    No account · No credit card · No BS
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ━━━━━━ FORM ━━━━━━ */}
        {step === "form" && (
          <motion.section
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="min-h-screen pt-32 pb-24 px-6"
          >
            <div className="max-w-2xl mx-auto">
              <div className="mb-10">
                <span className="text-xs tracking-widest text-royal-gold uppercase">
                  Financial Profile
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-3 text-midnight dark:text-cream">
                  Tell us your story
                </h2>
                <p className="text-midnight/60 dark:text-cream/50">
                  Honest answers produce a more accurate roadmap. Takes ~2 minutes.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-800 dark:text-amber-300 text-sm leading-relaxed"
                >
                  <strong className="block mb-1">
                    {error.includes("busy") ? "⏳ AI sedang sibuk" : "❌ Terjadi kesalahan"}
                  </strong>
                  {error.includes("busy")
                    ? "Semua model AI sedang dalam antrian. Tunggu ~1 menit lalu coba lagi — datamu sudah tersimpan di form."
                    : error}
                </motion.div>
              )}

              <div className="space-y-5 bg-white dark:bg-dark-surface border border-midnight/8 dark:border-cream/8 rounded-3xl p-8 shadow-sm">
                {/* Personal */}
                <div className="pb-4 border-b border-midnight/8 dark:border-cream/8">
                  <p className="text-[11px] tracking-widest text-midnight/40 dark:text-cream/30 uppercase mb-4">
                    About You
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="Age"
                      placeholder="e.g. 25"
                      value={formData.age}
                      onChange={(v) => handleChange("age", v)}
                    />
                    <Field
                      label="Occupation"
                      placeholder="e.g. Software Developer"
                      value={formData.occupation}
                      onChange={(v) => handleChange("occupation", v)}
                    />
                  </div>
                </div>

                {/* Finances */}
                <div className="pb-4 border-b border-midnight/8 dark:border-cream/8">
                  <p className="text-[11px] tracking-widest text-midnight/40 dark:text-cream/30 uppercase mb-4">
                    Finances
                  </p>
                  <div className="space-y-4">
                    <IDRField
                      label="Monthly Income"
                      value={formData.monthlyIncome}
                      onChange={(v) => handleChange("monthlyIncome", v)}
                    />
                    <IDRField
                      label="Monthly Expenses"
                      value={formData.monthlyExpenses}
                      onChange={(v) => handleChange("monthlyExpenses", v)}
                    />
                    <IDRField
                      label="Current Savings"
                      value={formData.currentSavings}
                      onChange={(v) => handleChange("currentSavings", v)}
                    />
                  </div>
                </div>

                {/* Goal */}
                <div>
                  <p className="text-[11px] tracking-widest text-midnight/40 dark:text-cream/30 uppercase mb-4">
                    Your Goal
                  </p>
                  <div className="space-y-4">
                    <Field
                      label="Primary Financial Goal"
                      placeholder="e.g. Buy a house, Start a business, Emergency fund"
                      value={formData.primaryGoal}
                      onChange={(v) => handleChange("primaryGoal", v)}
                    />
                    <IDRField
                      label="Target Amount"
                      value={formData.goalAmount}
                      onChange={(v) => handleChange("goalAmount", v)}
                    />

                    {/* Risk tolerance */}
                    <div>
                      <label className="block text-sm font-medium text-midnight dark:text-cream mb-2">
                        Risk Tolerance
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "Conservative", label: "Conservative", sub: "Stable & safe" },
                          { value: "Moderate", label: "Moderate", sub: "Balanced" },
                          { value: "Aggressive", label: "Aggressive", sub: "High growth" },
                        ].map((r) => (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => handleChange("riskTolerance", r.value)}
                            className={`px-3 py-3 rounded-xl border text-left transition-all ${
                              formData.riskTolerance === r.value
                                ? "bg-midnight dark:bg-deep-sea text-cream border-midnight dark:border-deep-sea"
                                : "bg-cream dark:bg-dark-bg border-midnight/15 dark:border-cream/10 text-midnight dark:text-cream hover:border-royal-gold/50"
                            }`}
                          >
                            <div className="text-sm font-medium">{r.label}</div>
                            <div className={`text-[11px] mt-0.5 ${formData.riskTolerance === r.value ? "text-cream/60" : "text-midnight/40 dark:text-cream/40"}`}>
                              {r.sub}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={generateRoadmap}
                  disabled={!canSubmit}
                  className="w-full py-4 bg-midnight dark:bg-royal-gold text-cream dark:text-midnight font-semibold rounded-xl hover:bg-deep-sea dark:hover:bg-bright-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 gold-glow-sm"
                >
                  Generate My Roadmap <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* ━━━━━━ LOADING ━━━━━━ */}
        {step === "loading" && (
          <motion.section
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center px-6 pt-20"
          >
            <div className="text-center max-w-md w-full">
              {/* Animated logo mark */}
              <div className="relative w-20 h-20 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-royal-gold/20 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-midnight to-deep-sea flex items-center justify-center shadow-xl gold-glow">
                  <svg viewBox="0 0 80 80" className="w-10 h-10 animate-float">
                    <path d="M 18 60 L 30 50 L 42 40 L 54 28 L 64 18" stroke="#FFD700" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                    <circle cx="18" cy="60" r="3.5" fill="#FFD700" />
                    <circle cx="64" cy="18" r="5" fill="#FFD700" />
                  </svg>
                </div>
              </div>

              <h3 className="font-display text-3xl font-bold mb-3 text-midnight dark:text-cream">
                Building your roadmap…
              </h3>
              <p className="text-midnight/60 dark:text-cream/50 mb-10 text-sm leading-relaxed">
                AI is analyzing your financial DNA and crafting a
                personalized 12-month strategy.
              </p>

              {/* Step indicators */}
              <div className="space-y-3 text-left bg-white dark:bg-dark-surface border border-midnight/8 dark:border-cream/8 rounded-2xl p-6">
                {LOADING_STEPS.map((label, i) => {
                  const done = i < loadingStep;
                  const active = i === loadingStep;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                        {done ? (
                          <CheckCircle2 className="step-complete w-5 h-5 text-royal-gold" />
                        ) : active ? (
                          <Loader2 className="w-5 h-5 text-royal-gold animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-midnight/20 dark:border-cream/20" />
                        )}
                      </div>
                      <span
                        className={`text-sm transition-colors duration-300 ${
                          done
                            ? "text-royal-gold line-through opacity-60"
                            : active
                            ? "text-midnight dark:text-cream font-medium"
                            : "text-midnight/35 dark:text-cream/30"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}

        {/* ━━━━━━ RESULT ━━━━━━ */}
        {step === "result" && roadmap && (
          <motion.section
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0 }}
            className="pt-28 pb-24 px-6"
          >
            <div className="max-w-4xl mx-auto">

              {/* Header + actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                <div>
                  <span className="text-xs tracking-widest text-royal-gold uppercase">
                    Your Personalized Roadmap
                  </span>
                  <h1 className="font-display text-3xl md:text-4xl font-bold mt-1 text-midnight dark:text-cream leading-tight">
                    {roadmap.headline}
                  </h1>
                </div>
                <div className="flex items-center gap-2 no-print flex-shrink-0">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-midnight/15 dark:border-cream/15 text-sm text-midnight dark:text-cream hover:bg-white dark:hover:bg-dark-surface transition-all"
                  >
                    {copied ? (
                      <><Check className="w-4 h-4 text-royal-gold" /> Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Share</>
                    )}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-midnight/15 dark:border-cream/15 text-sm text-midnight dark:text-cream hover:bg-white dark:hover:bg-dark-surface transition-all"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                </div>
              </div>

              {/* Executive summary */}
              <p className="text-midnight/70 dark:text-cream/60 text-base leading-relaxed mb-10 max-w-2xl">
                {roadmap.executiveSummary}
              </p>

              {/* Archetype card */}
              <div className="bg-gradient-to-br from-midnight to-deep-sea text-cream rounded-3xl p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-royal-gold/5 rounded-full blur-3xl translate-x-16 -translate-y-16 pointer-events-none" />
                <div className="grid md:grid-cols-2 gap-8 items-center relative">
                  <div>
                    <div className="text-cream/40 text-[11px] tracking-widest mb-2 uppercase">
                      Current Archetype
                    </div>
                    <div className="font-display text-2xl text-cream/90">
                      {roadmap.currentArchetype}
                    </div>
                  </div>
                  <div>
                    <div className="text-royal-gold text-[11px] tracking-widest mb-2 uppercase">
                      → Target (12 Months)
                    </div>
                    <div className="font-display text-2xl text-royal-gold">
                      {roadmap.targetArchetype}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid md:grid-cols-3 gap-4 mb-12">
                {[
                  { label: "Monthly Target Savings", value: roadmap.keyMetrics.monthlyTargetSavings, icon: Wallet },
                  { label: "Projected Net Worth (Y1)", value: roadmap.keyMetrics.projectedNetWorthEnd, icon: BarChart3 },
                  { label: "Risk Level", value: roadmap.keyMetrics.riskLevel, icon: Shield },
                ].map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
                    className="card-hover bg-white dark:bg-dark-surface border border-midnight/8 dark:border-cream/8 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <m.icon className="w-4 h-4 text-royal-gold" />
                      <div className="text-[11px] text-midnight/50 dark:text-cream/40 tracking-wider uppercase">
                        {m.label}
                      </div>
                    </div>
                    <div className="font-display text-xl font-semibold text-midnight dark:text-cream">
                      {m.value}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Phases */}
              <div className="mb-12">
                <h2 className="font-display text-3xl font-bold mb-6 text-midnight dark:text-cream">
                  The 12-Month Path
                </h2>

                {/* Phase timeline bar */}
                <div className="flex gap-1 mb-6 rounded-full overflow-hidden h-2 bg-midnight/8 dark:bg-cream/8">
                  {roadmap.phases.map((_, i) => (
                    <div
                      key={i}
                      className="h-full flex-1 rounded-full"
                      style={{ background: `rgba(212,175,55,${0.4 + i * 0.15})` }}
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  {roadmap.phases.map((phase, i) => {
                    const isOpen = expandedPhases.has(i);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
                        className="bg-white dark:bg-dark-surface border border-midnight/8 dark:border-cream/8 rounded-3xl overflow-hidden"
                      >
                        {/* Phase header — always visible */}
                        <button
                          onClick={() => togglePhase(i)}
                          className="w-full flex items-center gap-4 p-6 text-left hover:bg-cream/50 dark:hover:bg-dark-card/50 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-midnight dark:bg-deep-sea text-royal-gold font-display font-bold text-lg flex items-center justify-center flex-shrink-0">
                            {phase.phaseNumber}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <span className="font-display text-xl font-bold text-midnight dark:text-cream">
                                {phase.phaseName}
                              </span>
                              <span className="text-xs tracking-widest text-royal-gold bg-royal-gold/10 px-3 py-1 rounded-full">
                                {phase.monthRange}
                              </span>
                            </div>
                            <p className="text-midnight/60 dark:text-cream/50 text-sm truncate">
                              {phase.objective}
                            </p>
                          </div>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-midnight/40 dark:text-cream/40 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-midnight/40 dark:text-cream/40 flex-shrink-0" />
                          )}
                        </button>

                        {/* Phase body — collapsible */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
                              exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6 pt-0">
                                <div className="grid md:grid-cols-2 gap-6 mt-2">
                                  <div>
                                    <div className="flex items-center gap-2 text-[11px] tracking-widest text-midnight/50 dark:text-cream/40 uppercase mb-3">
                                      <Target className="w-3 h-3" /> Milestones
                                    </div>
                                    <div className="space-y-3">
                                      {phase.milestones.map((m, j) => (
                                        <div key={j} className="border-l-2 border-royal-gold pl-4">
                                          <div className="font-medium text-sm text-midnight dark:text-cream">
                                            {m.title}
                                          </div>
                                          <div className="text-xs text-midnight/50 dark:text-cream/40 mt-0.5">
                                            {m.targetAmount} · {m.deadline}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 text-[11px] tracking-widest text-midnight/50 dark:text-cream/40 uppercase mb-3">
                                      <Calendar className="w-3 h-3" /> Weekly Tasks
                                    </div>
                                    <ul className="space-y-2">
                                      {phase.weeklyTasks.map((t, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm">
                                          <CheckCircle2 className="w-4 h-4 text-royal-gold flex-shrink-0 mt-0.5" />
                                          <span className="text-midnight/80 dark:text-cream/70">{t}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>

                                <div className="mt-6 pt-5 border-t border-midnight/8 dark:border-cream/8 flex items-start gap-3 bg-cream/50 dark:bg-dark-card/50 -mx-6 -mb-6 px-6 py-5 rounded-b-3xl">
                                  <Sparkles className="w-5 h-5 text-royal-gold flex-shrink-0 mt-0.5" />
                                  <div>
                                    <div className="text-[11px] tracking-widest text-royal-gold uppercase mb-1">
                                      AI Insight
                                    </div>
                                    <p className="text-sm text-midnight/80 dark:text-cream/70 italic leading-relaxed">
                                      {phase.aiInsight}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Personal note */}
              <div className="bg-gradient-to-br from-royal-gold/10 to-bright-gold/5 border border-royal-gold/20 dark:border-royal-gold/15 rounded-3xl p-8 text-center mb-12">
                <Sparkles className="w-6 h-6 text-royal-gold mx-auto mb-4" />
                <p className="font-display text-xl italic text-midnight/80 dark:text-cream/80 leading-relaxed max-w-2xl mx-auto">
                  &ldquo;{roadmap.personalNote}&rdquo;
                </p>
                <div className="text-xs tracking-widest text-royal-gold mt-4 uppercase">
                  — WealthPath AI
                </div>
              </div>

              {/* Footer CTA */}
              <div className="text-center no-print">
                <button
                  onClick={resetToLanding}
                  className="text-sm text-midnight/60 dark:text-cream/50 hover:text-midnight dark:hover:text-cream underline underline-offset-4 transition-colors"
                >
                  Generate another roadmap
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <footer className="border-t border-midnight/8 dark:border-cream/8 py-12 px-6 bg-cream dark:bg-dark-bg transition-colors">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
            <div className="flex flex-col items-center md:items-start gap-3">
              <Logo />
              <p className="text-sm text-midnight/50 dark:text-cream/40 max-w-xs text-center md:text-left leading-relaxed">
                Your wealth journey, mapped in seconds. AI-powered financial roadmaps for Indonesian professionals.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-2 text-sm text-midnight/50 dark:text-cream/40">
              <div className="font-medium text-midnight/70 dark:text-cream/60 mb-1 col-span-2 md:col-span-1">Features</div>
              <div>12-Month Roadmap</div>
              <div>Wealth Archetypes</div>
              <div>IDR Milestones</div>
              <div>Weekly Action Plan</div>
              <div>AI Insights</div>
              <div>Print & Export</div>
            </div>
          </div>
          <div className="border-t border-midnight/8 dark:border-cream/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-midnight/35 dark:text-cream/25">
            <span>© 2026 WealthPath AI. Built with Next.js &amp; AI.</span>
            <span>Untuk profesional muda Indonesia 🇮🇩</span>
          </div>
        </div>
      </footer>

      {/* ── SCROLL TO TOP ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="no-print fixed bottom-6 right-6 z-50 w-10 h-10 bg-royal-gold text-midnight rounded-full flex items-center justify-center shadow-lg hover:bg-bright-gold transition-colors hover:scale-110 active:scale-95"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}
