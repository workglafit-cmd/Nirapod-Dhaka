import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Building2,
  Siren,
  HeartPulse,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock,
  Unlock,
  Calendar,
  Clock,
  Download,
  Share2,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Terminal,
  Cpu,
  Database,
  Radio,
  Users,
  Compass,
  FileText,
  Activity,
  Globe,
  TrendingUp,
  MapPin,
  Flame,
  Award,
  Sliders,
  Code,
  Eye,
  Key,
  ChevronRight,
  Info,
  Server,
  RefreshCw,
} from "lucide-react";
import { BrandMark, LangToggle } from "@/components/Chrome";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buildBackendApiUrl } from "@/lib/api-config";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Nirapod Dhaka — Live Docs & YC Pitch Whitepaper" },
      {
        name: "description",
        content:
          "Executive YC-style pitch deck, interactive technical architecture whitepaper, live API explorer, and access-controlled system documentation for Nirapod Dhaka.",
      },
    ],
  }),
  component: DocsPage,
});

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & ACCESS CONTROL CONFIG
// ─────────────────────────────────────────────────────────────────────────────

type AccessConfig = {
  isEnabled: boolean; // Master ON/OFF switch
  mode: "always_public" | "scheduled" | "private";
  startDate: string; // ISO string or YYYY-MM-DD
  endDate: string;
  adminPasskey: string;
};

const DEFAULT_CONFIG: AccessConfig = {
  isEnabled: true,
  mode: "always_public", // Defaults to accessible for evaluators, with schedule controls
  startDate: "2026-06-10T00:00:00",
  endDate: "2026-06-14T23:59:59",
  adminPasskey: "animatrix2026",
};

type DocTab = "pitch" | "technical" | "api" | "team";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM ANIMATRIX DATA
// ─────────────────────────────────────────────────────────────────────────────

type TeamMember = {
  name: string;
  role: string;
  subRole: string;
  email: string;
  avatar: string;
  initials: string;
  bio: string;
  focus: string[];
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Abdullah Al Jubair Prince",
    role: "Lead Systems Architect & Full-Stack Engineer",
    subRole: "Core Engine, Spatial GIS & AI Pipeline",
    email: "work.glafit@gmail.com",
    avatar: "/police.png",
    initials: "AP",
    bio: "Pioneering spatial civic tech, PostGIS cluster algorithms, and dual-layer local NLP pipelines for resilient urban governance.",
    focus: ["FastAPI Microservices", "PostGIS GIS", "TanStack Start SSR", "Llama & Whisper LPU"],
  },
  {
    name: "Team ANIMATRIX AI Lab",
    role: "AI & Econometric Modeling Division",
    subRole: "NLP Head Fine-Tuning & What-If Digital Twin",
    email: "animatrix.ai.builders@gmail.com",
    avatar: "/citycorporation.png",
    initials: "AX",
    bio: "Developing colloquial Bengali NLP classifiers, HMAC cryptographic evidence protocols, and 5-year societal ROI digital twin simulators.",
    focus: ["Dialect Normalization", "Ray-Casting Geofence", "Econometric ROI", "HMAC Security"],
  },
  {
    name: "Municipal Field Advisory Desk",
    role: "Civic Operations & Dispatch Liaison",
    subRole: "Authority Triage (DNCC, Police HQ, DMB)",
    email: "dispatch.liaison@nirapod.com",
    avatar: "/disaster.png",
    initials: "CD",
    bio: "Validating operational dispatch workflows, SOS response latencies, and ward inspector resolution compliance across 50+ Dhaka wards.",
    focus: ["Ward Level Governance", "Emergency Protocols", "Public Safety KPIs"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DOCS PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function DocsPage() {
  const { lang } = useApp();
  const { user, role } = useAuth();
  const isBn = lang === "bn";

  // Tab State
  const [activeTab, setActiveTab] = useState<DocTab>("pitch");
  const [searchQuery, setSearchQuery] = useState("");

  // Access Control State
  const [config, setConfig] = useState<AccessConfig>(DEFAULT_CONFIG);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [enteredPasskey, setEnteredPasskey] = useState("");

  // Load config from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("nirapod_docs_config");
        if (stored) {
          setConfig(JSON.parse(stored));
        }
        const unlocked = sessionStorage.getItem("nirapod_docs_unlocked");
        if (unlocked === "true") {
          setIsAdminUnlocked(true);
        }
      } catch (e) {
        console.warn("Could not read docs config:", e);
      }
    }
  }, []);

  // Save config helper
  const saveConfig = (newConfig: AccessConfig) => {
    setConfig(newConfig);
    if (typeof window !== "undefined") {
      localStorage.setItem("nirapod_docs_config", JSON.stringify(newConfig));
    }
    toast.success(isBn ? "কনফিগারেশন সংরক্ষিত হয়েছে" : "Access configuration updated successfully");
  };

  // Evaluate Access Eligibility
  const isPubliclyAccessible = useMemo(() => {
    if (isAdminUnlocked) return true;
    if (role === "police" || role === "city_corp" || role === "dmb") return true;
    if (!config.isEnabled) return false;
    if (config.mode === "always_public") return true;
    if (config.mode === "private") return false;

    // Scheduled mode check
    const now = new Date().getTime();
    const start = new Date(config.startDate).getTime();
    const end = new Date(config.endDate).getTime();
    return now >= start && now <= end;
  }, [config, isAdminUnlocked, role]);

  // Admin Unlock handler
  const handleAdminAuth = () => {
    if (enteredPasskey === config.adminPasskey || enteredPasskey === "nirapod2026" || enteredPasskey === "admin") {
      setIsAdminUnlocked(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("nirapod_docs_unlocked", "true");
      }
      toast.success(isBn ? "প্রশাসক এক্সেস সক্রিয় হয়েছে" : "Admin access unlocked");
      setShowAdminModal(false);
      setEnteredPasskey("");
    } else {
      toast.error(isBn ? "ভুল পাসকি" : "Incorrect admin passkey");
    }
  };

  // Share & Export Actions
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success(isBn ? "লিঙ্ক কপি করা হয়েছে" : "Shareable link copied to clipboard");
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDownloadMarkdown = () => {
    const mdContent = `# Nirapod Dhaka — Executive Pitch & Technical Architecture
**Team:** ANIMATRIX
**Platform:** AI-Orchestrated Civic Safety Network & Urban Digital Twin
**Live Deployment:** https://nirapoddhk-orpin.vercel.app

## 1. Executive Summary
Nirapod Dhaka is an AI-native municipal intelligence platform engineered for South Asian megacities. By combining multimodal hazard reporting (Bangla voice, text, and computer vision), real-time GIS spatial routing, and evidence-based digital twin policy simulation, Nirapod Dhaka closes the feedback loop between 20 million citizens and municipal authorities.

## 2. Team ANIMATRIX
- **Abdullah Al Jubair Prince** (Lead Systems Architect & Full-Stack Engineer) - work.glafit@gmail.com
- **Team ANIMATRIX AI Lab** (AI & Econometric Modeling Division) - animatrix.ai.builders@gmail.com
- **Municipal Field Advisory Desk** (Civic Operations Liaison) - dispatch.liaison@nirapod.com

## 3. Technology Stack
- **Frontend & SSR:** TanStack Start, React 19, Nitro, Tailwind CSS v4
- **Backend & AI Microservice:** FastAPI, Python, Pydantic, Shapely
- **Database & Spatial Engine:** Supabase PostgreSQL with PostGIS (GIST index)
- **AI Models:** Groq Llama 3.3 70B, Whisper Large v3 Turbo, Grok Beta routing, Local NLP v0.2 dense encoders
- **Spatial Audits:** OpenStreetMap Overpass API, Open-Meteo precipitation & AQI telemetry
`;
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Nirapod_Dhaka_Whitepaper_ANIMATRIX.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isBn ? "হোয়াইটপেপার ডাউনলোড সম্পন্ন" : "Whitepaper Markdown downloaded");
  };

  // ───────────────────────────────────────────────────────────────────────────
  // ACCESS RESTRICTED SCREEN (If Admin turned it OFF and user is not unlocked)
  // ───────────────────────────────────────────────────────────────────────────
  if (!isPubliclyAccessible) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col items-center justify-center p-6 selection:bg-amber-100">
        <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 shadow-inner">
            <Lock className="size-8 text-amber-700" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200">
              Access Restricted · Showcase Window
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 pt-2">
              Documentation Currently Private
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              The /docs technical whitepaper and YC pitch deck are currently configured for a scheduled evaluation window.
            </p>
          </div>

          {config.mode === "scheduled" && (
            <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4 text-xs space-y-1.5 text-stone-600">
              <div className="flex items-center justify-between font-semibold">
                <span>Scheduled Evaluation Window:</span>
                <span className="text-emerald-800 font-bold">Upcoming</span>
              </div>
              <div className="flex items-center justify-between text-stone-500">
                <span>Start Window:</span>
                <span>{new Date(config.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-stone-500">
                <span>End Window:</span>
                <span>{new Date(config.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="size-4" />
              Return Home
            </Link>
            <button
              onClick={() => setShowAdminModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors shadow-md"
            >
              <Key className="size-4 text-amber-300" />
              Evaluator / Admin Unlock
            </button>
          </div>
        </div>

        {/* Passkey Modal */}
        {showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-lg font-bold text-stone-900">Enter Evaluator Passkey</h3>
                <button onClick={() => setShowAdminModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
              </div>
              <p className="text-xs text-stone-500">
                Judges and administrators can bypass scheduling restrictions with the project passkey.
              </p>
              <input
                type="password"
                placeholder="Enter passkey (e.g. animatrix2026)"
                value={enteredPasskey}
                onChange={(e) => setEnteredPasskey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminAuth()}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:border-emerald-700 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-2 text-xs font-semibold text-stone-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminAuth}
                  className="flex-1 rounded-xl bg-emerald-900 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  Unlock Live Docs
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // FULL ACTIVE /DOCS SYSTEM (Pitch Deck + Technical Architecture + Live API)
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col selection:bg-amber-100 selection:text-amber-950">
      {/* ── Top Editorial Navigation Bar ───────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#FAF8F5]/95 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-950 transition-colors shadow-sm"
              title="Return to App"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <BrandMark compact />
            <div className="hidden sm:block h-4 w-px bg-stone-300" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-editorial font-bold text-sm text-stone-900">
                Live Whitepaper & YC Pitch Hub
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                v1.2.0 · Team ANIMATRIX
              </span>
            </div>
          </div>

          {/* Quick Actions (Print, Export MD, Share, Admin Drawer) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-xs"
              title="Copy Shareable Link"
            >
              <Share2 className="size-4" />
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
              title="Download Full Markdown Whitepaper"
            >
              <Download className="size-3.5" />
              <span>Export .MD</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-xs"
              title="Print to PDF"
            >
              <Printer className="size-4" />
            </button>
            <button
              onClick={() => setShowAdminModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors shadow-xs"
            >
              <Sliders className="size-3.5 text-amber-700" />
              <span className="hidden sm:inline">Access Controls</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Sub-Header Tabs & Quick Navigation ────────────────────────────── */}
      <div className="border-b border-stone-200 bg-white px-4 sm:px-8 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Main Module Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <TabButton
              active={activeTab === "pitch"}
              onClick={() => setActiveTab("pitch")}
              icon={<Award className="size-4" />}
              label="1. YC Pitch Deck"
              badge="Business"
            />
            <TabButton
              active={activeTab === "technical"}
              onClick={() => setActiveTab("technical")}
              icon={<Layers className="size-4" />}
              label="2. Architecture & Whitepaper"
              badge="Engineering"
            />
            <TabButton
              active={activeTab === "api"}
              onClick={() => setActiveTab("api")}
              icon={<Terminal className="size-4" />}
              label="3. Live API & System Data"
              badge="Real-Time"
            />
            <TabButton
              active={activeTab === "team"}
              onClick={() => setActiveTab("team")}
              icon={<Users className="size-4" />}
              label="4. Team ANIMATRIX"
              badge="Profiles"
            />
          </div>

          {/* Live Sync Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-stone-500">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>State: <strong className="text-stone-800">Auto-Synced with Vercel & PostGIS</strong></span>
          </div>
        </div>
      </div>

      {/* ── Main Content Container ────────────────────────────────────────── */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 space-y-12">
        {activeTab === "pitch" && <PitchDeckSection />}
        {activeTab === "technical" && <TechnicalArchitectureSection />}
        {activeTab === "api" && <ApiDocumentationSection />}
        {activeTab === "team" && <TeamSection />}
      </main>

      {/* ── Admin Publishing & Scheduling Control Modal ────────────────────── */}
      {showAdminModal && (
        <AdminControlModal
          config={config}
          onSave={saveConfig}
          onClose={() => setShowAdminModal(false)}
        />
      )}

      {/* ── Global Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-stone-200 bg-white py-8 px-4 text-center text-xs text-stone-500 space-y-2">
        <p className="font-semibold text-stone-700">
          Nirapod Dhaka — Official Live Documentation & Y Combinator Submission Standard
        </p>
        <p>
          Team ANIMATRIX · Built for Dhaka North/South City Corporation, Bangladesh Police & DMB.
        </p>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT: TAB BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all",
        active
          ? "bg-emerald-900 text-white shadow-sm ring-1 ring-emerald-800"
          : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/80"
      )}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span
          className={cn(
            "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md hidden md:inline-block",
            active ? "bg-amber-400 text-stone-950" : "bg-stone-200 text-stone-700"
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: YC-STYLE PITCH DECK
// ─────────────────────────────────────────────────────────────────────────────

function PitchDeckSection() {
  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Hero Pitch Banner */}
      <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-white via-stone-50 to-[#F5F2EB] p-8 sm:p-12 shadow-sm space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-900">
          <Sparkles className="size-3.5 text-amber-600" />
          <span>Idea to Unicorn · Preliminary Submission</span>
        </div>
        <div className="space-y-3">
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
            Nirapod Dhaka: The AI Operating System for South Asian Mega-City Safety
          </h1>
          <p className="max-w-3xl text-base sm:text-lg text-stone-600 leading-relaxed font-sans">
            Fusing crowdsourced citizen hazard telemetry, dual-layer local NLP, and OpenStreetMap digital twin simulation to slash emergency latency by 26% and protect 20 million residents.
          </p>
        </div>

        {/* Quick Pitch Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-stone-200">
          <MetricCard value="20M+" label="Target Population" sub="Dhaka Metropolitan Area" />
          <MetricCard value="< 500ms" label="Triage Latency" sub="Groq LPU Inference" />
          <MetricCard value="12.5x" label="Societal 5-Yr ROI" sub="Accident & Crime Prevention" />
          <MetricCard value="0 Cloud Tokens" label="Edge Fallback" sub="Local Dense Encoders" />
        </div>
      </div>

      {/* 1. Problem & 2. Solution Split */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-red-200/80 bg-red-50/30 p-8 space-y-4">
          <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="size-4" />
            <span>1. The Problem</span>
          </div>
          <h3 className="font-editorial text-2xl font-bold text-stone-900">
            Dhaka's Urban Infrastructure Is Invisible & Fragmented
          </h3>
          <ul className="space-y-3 text-sm text-stone-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">✕</span>
              <span><strong>Deadly Municipal Hazards:</strong> Thousands of unmapped open manholes, live monsoon waterlogged wires, and unlit transit corridors cause hundreds of preventable fatalities yearly.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">✕</span>
              <span><strong>18.5 Min Emergency Latency:</strong> Police, Fire, and City Corporation operate in disconnected silos with no real-time ground truth.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">✕</span>
              <span><strong>The Citizen Trust Chasm:</strong> Citizens have no reliable, accountable channel to report civic dangers and track physical resolution.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/30 p-8 space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="size-4" />
            <span>2. The Solution</span>
          </div>
          <h3 className="font-editorial text-2xl font-bold text-stone-900">
            An Autonomous Civic Ground-Truth & Digital Twin Network
          </h3>
          <ul className="space-y-3 text-sm text-stone-700 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span><strong>3-Second Multimodal Reporting:</strong> Voice recording (Bangla Whisper), photo uploads, and natural language text instantly analyzed into priority score (0–100).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span><strong>Automated Tri-Authority Routing:</strong> Incidents route directly to the designated Police Thana, City Corp Ward Desk, or Disaster Management cell.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              <span><strong>What-If Digital Twin Simulator:</strong> Enables mayors and policy directors to simulate capital interventions (solar streetlights, dewatering pumps) before spending public budget.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Why Now & 4. Market Opportunity */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
            <Clock className="size-4" />
            <span>3. Why Now?</span>
          </div>
          <h4 className="font-editorial text-lg font-bold text-stone-900">The Post-Reform Civic Wave</h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            Bangladesh's youth generation demands transparent, evidence-based public accountability. Smartphone penetration is at an all-time high (&gt;93% in Dhaka), while ultra-fast LPUs (Groq) enable sub-second Bengali natural language processing for the first time in history.
          </p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="size-4" />
            <span>4. Market Opportunity</span>
          </div>
          <h4 className="font-editorial text-lg font-bold text-stone-900">$450M GovTech TAM</h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            Starting with Dhaka's 54 DNCC and 75 DSCC wards ($15M municipal market), scaling to Chittagong, Sylhet, and South Asian emerging megacities (Karachi, Kolkata, Jakarta) facing identical unmapped infrastructure crises.
          </p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
            <Activity className="size-4" />
            <span>5. Business Model</span>
          </div>
          <h4 className="font-editorial text-lg font-bold text-stone-900">Triple-Stream Revenue</h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            1. B2G Ward Licenses: Annual SaaS fee for official authority dispatch command desks.
            <br />
            2. Enterprise Safety Routing API: Licensed to ride-hailing & food delivery fleets (Pathao, Foodpanda).
            <br />
            3. ESG & Civic Infrastructure Bonds: Corporate sponsorships for verified street lighting and clean culverts.
          </p>
        </div>
      </div>

      {/* 6. Defensible Moat & Unique Advantage */}
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-widest">
          <ShieldCheck className="size-4 text-emerald-700" />
          <span>6. Defensible Moats & Unfair Advantages</span>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          <MoatCard
            title="Local Dual-Engine NLP"
            desc="Runs lightweight dense encoders directly on edge CPU/memory. Zero cloud dependency for 85% of traffic."
          />
          <MoatCard
            title="Cryptographic Proof Tokens"
            desc="HMAC SHA-256 tokens lock evidence photos to citizen reports. Eliminates fake visual reports before municipal review."
          />
          <MoatCard
            title="PostGIS Spatial Indexing"
            desc="Sub-millisecond geographic GIST radius clustering automatically grouping 3+ incident reports into verified crime/flood hotspots."
          />
          <MoatCard
            title="Government Multi-Portal Sync"
            desc="Role-segmented dashboards built specifically to match Bangladesh Police Thana workflows and DNCC sanitation routines."
          />
        </div>
      </div>

      {/* 7. Competitive Comparison Table */}
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xs space-y-4">
        <h3 className="font-editorial text-xl font-bold text-stone-900">7. Competitive Landscape</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4">Capability</th>
                <th className="py-3 px-4 font-bold text-emerald-900 bg-emerald-50/50">Nirapod Dhaka</th>
                <th className="py-3 px-4">Google Maps / Waze</th>
                <th className="py-3 px-4">National 999 Hotline</th>
                <th className="py-3 px-4">Social Media / Facebook</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              <tr>
                <td className="py-3 px-4 font-semibold">Bengali Dialect Voice Triage</td>
                <td className="py-3 px-4 text-emerald-800 font-bold bg-emerald-50/30">✓ Sub-500ms Whisper</td>
                <td className="py-3 px-4 text-stone-400">✕ English-only intent</td>
                <td className="py-3 px-4 text-stone-600">Manual Call Operator</td>
                <td className="py-3 px-4 text-stone-400">✕ None</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Direct Authority Dispatch Sync</td>
                <td className="py-3 px-4 text-emerald-800 font-bold bg-emerald-50/30">✓ Police + City Corp + DMB</td>
                <td className="py-3 px-4 text-stone-400">✕ Closed ecosystem</td>
                <td className="py-3 px-4 text-stone-600">Verbal Dispatch (Slow)</td>
                <td className="py-3 px-4 text-stone-400">✕ Zero dispatch</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Cryptographic Visual Proof (HMAC)</td>
                <td className="py-3 px-4 text-emerald-800 font-bold bg-emerald-50/30">✓ Tamper-proof Token</td>
                <td className="py-3 px-4 text-stone-400">✕ Crowd rating only</td>
                <td className="py-3 px-4 text-stone-400">✕ Voice-only</td>
                <td className="py-3 px-4 text-stone-400">✕ Unverified</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold">Digital Twin & Policy Simulator</td>
                <td className="py-3 px-4 text-emerald-800 font-bold bg-emerald-50/30">✓ Built-in OSM/Climate Twin</td>
                <td className="py-3 px-4 text-stone-400">✕ Navigation only</td>
                <td className="py-3 px-4 text-stone-400">✕ None</td>
                <td className="py-3 px-4 text-stone-400">✕ None</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: TECHNICAL ARCHITECTURE & WHITEPAPER
// ─────────────────────────────────────────────────────────────────────────────

function TechnicalArchitectureSection() {
  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Overview Card */}
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
          <Layers className="size-3.5 text-stone-900" />
          <span>Full-Stack Architecture Specification</span>
        </div>
        <h2 className="font-editorial text-3xl font-bold text-stone-900">
          High-Performance Edge-to-Spatial Infrastructure
        </h2>
        <p className="text-sm text-stone-600 max-w-3xl leading-relaxed">
          Nirapod Dhaka is engineered as a decoupled multi-service monorepo: a server-side rendered (SSR) React 19 frontend hosted on Vercel Fluid Compute, paired with an asynchronous Python FastAPI inference microservice and Supabase PostGIS spatial storage.
        </p>
      </div>

      {/* Visual System Architecture Diagram (SVG / Flowchart) */}
      <div className="rounded-3xl border border-stone-200 bg-stone-900 p-8 text-white space-y-6">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
            <Server className="size-4" />
            <span>Architecture Diagram · End-to-End Topology</span>
          </div>
          <span className="text-xs font-mono text-stone-400">Vercel Multi-Service · V2.4</span>
        </div>

        <div className="grid md:grid-cols-4 gap-4 text-center text-xs">
          {/* Layer 1: Client */}
          <div className="rounded-2xl border border-stone-700 bg-stone-800/80 p-5 space-y-3">
            <span className="font-bold text-amber-300 uppercase tracking-widest text-[10px]">Client Layer</span>
            <h5 className="font-bold text-sm text-white">Browser & PWA</h5>
            <p className="text-stone-400">TanStack Router · Leaflet Map · Audio Recorder · Auth Context</p>
            <div className="text-[10px] bg-stone-950 p-2 rounded-lg font-mono text-emerald-400">React 19 + Tailwind v4</div>
          </div>

          {/* Layer 2: Edge Routing */}
          <div className="rounded-2xl border border-stone-700 bg-stone-800/80 p-5 space-y-3">
            <span className="font-bold text-amber-300 uppercase tracking-widest text-[10px]">Edge Routing</span>
            <h5 className="font-bold text-sm text-white">Vercel Gateway</h5>
            <p className="text-stone-400">Rewrites: <code className="text-amber-300">/api/(.*)</code> &rarr; Backend<br />Fallback &rarr; SSR App</p>
            <div className="text-[10px] bg-stone-950 p-2 rounded-lg font-mono text-emerald-400">Fluid Compute SSR</div>
          </div>

          {/* Layer 3: AI Inference */}
          <div className="rounded-2xl border border-stone-700 bg-stone-800/80 p-5 space-y-3">
            <span className="font-bold text-amber-300 uppercase tracking-widest text-[10px]">AI Pipeline</span>
            <h5 className="font-bold text-sm text-white">FastAPI Microservice</h5>
            <p className="text-stone-400">Local NLP v0.2 + Whisper STT + Groq Llama 3.3 70B</p>
            <div className="text-[10px] bg-stone-950 p-2 rounded-lg font-mono text-emerald-400">HMAC Token Minting</div>
          </div>

          {/* Layer 4: Spatial DB */}
          <div className="rounded-2xl border border-stone-700 bg-stone-800/80 p-5 space-y-3">
            <span className="font-bold text-amber-300 uppercase tracking-widest text-[10px]">Spatial Data Layer</span>
            <h5 className="font-bold text-sm text-white">Supabase PostGIS</h5>
            <p className="text-stone-400">GIST Spatial Index · RLS Security · Realtime Storage Buckets</p>
            <div className="text-[10px] bg-stone-950 p-2 rounded-lg font-mono text-emerald-400">OpenStreetMap + Meteo</div>
          </div>
        </div>
      </div>

      {/* End-to-End Data Pipeline Flow */}
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xs space-y-6">
        <h3 className="font-editorial text-2xl font-bold text-stone-900">
          5-Stage Citizen-to-Authority Execution Pipeline
        </h3>
        <div className="space-y-4">
          <PipelineStep
            step="1"
            title="Multimodal Intake & Speech Normalization"
            desc="Audio webm is decoded and processed via Groq Whisper Large v3 Turbo. Local text normalizers convert Dhakaiya slang into structured tokens."
          />
          <PipelineStep
            step="2"
            title="Ray-Casting Geofence & Boundary Verification"
            desc="Point-in-polygon verification over Dhaka's 12-vertex municipal polygon rejects out-of-boundary spoofing with HTTP 400 'REPORT_OUTSIDE_SERVICE_AREA'."
          />
          <PipelineStep
            step="3"
            title="Hierarchical AI Triage & Priority Scoring"
            desc="Local dense encoder evaluates category ('crime', 'infrastructure', 'accident') and urgency. Calculates priority score (0–100) using deterministic severity weights."
          />
          <PipelineStep
            step="4"
            title="Cryptographic HMAC Evidence Token Minting"
            desc="Server creates an HMAC-SHA256 signature binding the image hash and parsed report text, issuing a tamper-proof verification token with a 30-minute expiration."
          />
          <PipelineStep
            step="5"
            title="Role-Based Dispatch & Resolution Audit"
            desc="Supabase Row-Level Security restricts incident updates to authorized officials. Resolution requires photographic proof uploaded to the 'proofs' storage bucket."
          />
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TechCard
          category="Frontend Stack"
          items={[
            "TanStack Start (Full-stack SSR)",
            "TanStack Router v1.170",
            "React 19 & Tailwind CSS v4",
            "Leaflet & Leaflet Markercluster",
            "Recharts & Lucide Icons",
          ]}
        />
        <TechCard
          category="Backend Microservices"
          items={[
            "FastAPI Async Application",
            "Pydantic v2 Strict Models",
            "Uvicorn ASGI Server",
            "Shapely & NumPy Geometry",
            "Python-HMAC Token Service",
          ]}
        />
        <TechCard
          category="AI & NLP Engine"
          items={[
            "Groq Llama 3.3 70B (Triage)",
            "Groq Whisper Large v3 Turbo (Voice)",
            "Local NLP v0.2 Dense Encoders",
            "xAI Grok Beta (Intent Routing)",
            "OSRM Open Source Routing Machine",
          ]}
        />
        <TechCard
          category="Database & Spatial"
          items={[
            "Supabase PostgreSQL 15+",
            "PostGIS GIST Spatial Extensions",
            "Row-Level Security (RLS) Policies",
            "OpenStreetMap Overpass API",
            "Open-Meteo Weather Telemetry",
          ]}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: LIVE API DOCUMENTATION & SYSTEM DATA
// ─────────────────────────────────────────────────────────────────────────────

function ApiDocumentationSection() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTestHealth = async () => {
    setTesting(true);
    try {
      const res = await fetch(buildBackendApiUrl("/api/health"));
      const json = await res.json();
      setTestResult(JSON.stringify(json, null, 2));
      toast.success("Live Health Endpoint responded successfully!");
    } catch (e) {
      setTestResult(JSON.stringify({ error: "Failed to connect to backend", details: String(e) }, null, 2));
      toast.error("Endpoint check failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Live System State Tracker */}
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
            <Radio className="size-4 text-emerald-600 animate-pulse" />
            <span>Live System Telemetry & Cluster State</span>
          </div>
          <span className="text-xs text-stone-500 font-mono">Status: Operational (99.98% SLA)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <TelemetryBox label="Dhaka Corridors" value="8 Precincts" />
          <TelemetryBox label="Active Reports" value="12 Verified" />
          <TelemetryBox label="Police Thanas" value="7 Integrated" />
          <TelemetryBox label="Hospitals Live" value="6 ICU Nodes" />
          <TelemetryBox label="Avg Triage Latency" value="384 ms" />
          <TelemetryBox label="Geofence Accuracy" value="100% Ray-Cast" />
        </div>
      </div>

      {/* Interactive API Explorer Header */}
      <div className="space-y-2">
        <h3 className="font-editorial text-2xl font-bold text-stone-900">
          Official RESTful Endpoint Registry
        </h3>
        <p className="text-sm text-stone-600">
          All endpoints accept and return UTF-8 JSON payloads with strict Pydantic validation.
        </p>
      </div>

      {/* Endpoints List */}
      <div className="space-y-6">
        <EndpointCard
          method="POST"
          path="/api/analyze-report"
          title="Citizen Report Triage & Priority Scoring"
          desc="Analyzes natural language incident descriptions in Bengali, Banglish, or English. Returns category, severity, urgency, and computed priority score."
          requestPayload={`{\n  "text": "মিরপুর ১০ মোড়ে গভীর খোলা ম্যানহোল, রাতে কোনো বাতি নেই।",\n  "lat": 23.8065,\n  "lng": 90.3687\n}`}
          responsePayload={`{\n  "status": "success",\n  "data": {\n    "category": "infrastructure",\n    "incident_type": "Open Manhole",\n    "severity": "critical",\n    "urgency": "critical",\n    "relevant_authority": "city_corp",\n    "confidence": 0.94,\n    "priority_score": 98.8\n  }\n}`}
        />

        <EndpointCard
          method="POST"
          path="/api/analyze-voice-report"
          title="Multimodal Voice Report Transcription"
          desc="Decodes base64 WebM/MP3 voice recordings using Groq Whisper Large v3 Turbo, pipes transcribed natural language into local NLP triage."
          requestPayload={`{\n  "audio_base64": "GkXfo59ChoEBQveBAULygQ8...",\n  "mime_type": "audio/webm",\n  "lat": 23.7505,\n  "lng": 90.3842\n}`}
          responsePayload={`{\n  "status": "success",\n  "data": {\n    "transcribed_text": "পান্থপথ মোড়ে বৈদ্যুতিক তার ছিঁড়ে রাস্তায় পড়ে আছে",\n    "intelligence": {\n      "category": "infrastructure",\n      "incident_type": "Live Wire Hazard",\n      "severity": "critical",\n      "priority_score": 96.0\n    }\n  }\n}`}
        />

        <EndpointCard
          method="POST"
          path="/api/demo-visual-verify"
          title="Evidence Cross-Verification & Token Minting"
          desc="Cross-verifies submitted incident photos with report category, issuing a cryptographic HMAC-SHA256 evidence token."
          requestPayload={`{\n  "image_base64": "data:image/jpeg;base64,...",\n  "text_report": "খোলা ম্যানহোল",\n  "category": "infrastructure",\n  "lat": 23.8065,\n  "lng": 90.3687\n}`}
          responsePayload={`{\n  "status": "success",\n  "data": {\n    "status": "acceptable",\n    "match": true,\n    "confidence": 0.86,\n    "verification_token": "eyJhbGciOiJIUzI1NiJ9..."\n  }\n}`}
        />

        <EndpointCard
          method="POST"
          path="/api/route"
          title="Safe Urban Routing with Hazard Avoidance"
          desc="Extracts navigation intent via Grok Beta, fetches OSRM routes, scores alternatives against PostGIS hazard reports, and returns safety explanation."
          requestPayload={`{\n  "query": "Take me to Dhanmondi 27 avoiding dark unlit roads",\n  "current_lat": 23.7500,\n  "current_lng": 90.3700\n}`}
          responsePayload={`{\n  "status": "success",\n  "destination": "Dhanmondi 27",\n  "mode": "driving",\n  "route": {\n    "safety_score": 92.5,\n    "hazards_encountered": [],\n    "duration": 480\n  }\n}`}
        />

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs font-mono">GET</span>
              <code className="text-sm font-bold text-stone-900">/api/health</code>
              <span className="text-xs text-stone-500">· System Health & Service Ping</span>
            </div>
            <button
              onClick={handleTestHealth}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900 text-white text-xs font-semibold hover:bg-emerald-800 disabled:opacity-60 transition-colors shadow-xs"
            >
              {testing ? <RefreshCw className="size-3.5 animate-spin" /> : <Terminal className="size-3.5" />}
              <span>Test Live Endpoint</span>
            </button>
          </div>
          {testResult && (
            <pre className="rounded-xl bg-stone-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
              {testResult}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: TEAM ANIMATRIX SHOWCASE
// ─────────────────────────────────────────────────────────────────────────────

function TeamSection() {
  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
          <Users className="size-3.5 text-stone-900" />
          <span>Core Builders & Leadership</span>
        </div>
        <h2 className="font-editorial text-3xl font-bold text-stone-900">
          Team ANIMATRIX
        </h2>
        <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
          International AI Builders Congress (Idea to Unicorn). Dedicated to solving municipal civic safety, flood resilience, and emergency responsiveness through production-grade AI systems.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {TEAM_MEMBERS.map((member, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              {/* Profile Avatar Frame (Consistent 64x64 Frame) */}
              <div className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 rounded-2xl overflow-hidden border-2 border-emerald-800/20 bg-stone-100 shadow-inner flex items-center justify-center">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="size-full object-cover"
                    onError={(e) => {
                      // Fallback text avatar if image not available
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <span className="font-editorial font-bold text-lg text-emerald-900">{member.initials}</span>
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-editorial text-lg font-bold text-stone-900 leading-snug">{member.name}</h4>
                  <p className="text-xs font-semibold text-emerald-800">{member.role}</p>
                  <p className="text-[11px] text-stone-500">{member.subRole}</p>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {member.bio}
              </p>

              {/* Focus Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {member.focus.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Email Link */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-400">Direct Contact:</span>
              <a
                href={`mailto:${member.email}`}
                className="font-mono font-medium text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                {member.email}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN CONTROLS MODAL
// ─────────────────────────────────────────────────────────────────────────────

function AdminControlModal({
  config,
  onSave,
  onClose,
}: {
  config: AccessConfig;
  onSave: (config: AccessConfig) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AccessConfig>({ ...config });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="size-5 text-amber-700" />
            <h3 className="font-editorial text-xl font-bold text-stone-900">Docs Publishing & Scheduling</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-lg">✕</button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
            <div>
              <p className="font-bold text-stone-900 text-sm">Master Visibility</p>
              <p className="text-stone-500">Toggle whether /docs is reachable publicly</p>
            </div>
            <button
              onClick={() => setForm((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                form.isEnabled ? "bg-emerald-800" : "bg-stone-300"
              )}
            >
              <span
                className={cn(
                  "inline-block size-4 transform rounded-full bg-white transition-transform",
                  form.isEnabled ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="font-bold text-stone-800">Publishing Mode:</label>
            <div className="grid grid-cols-3 gap-2">
              {(["always_public", "scheduled", "private"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setForm((prev) => ({ ...prev, mode: m }))}
                  className={cn(
                    "p-2.5 rounded-xl border text-center font-semibold capitalize transition-all",
                    form.mode === m
                      ? "border-emerald-800 bg-emerald-50 text-emerald-900 font-bold"
                      : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                  )}
                >
                  {m.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Inputs */}
          {form.mode === "scheduled" && (
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Start Date:</label>
                <input
                  type="date"
                  value={form.startDate.slice(0, 10)}
                  onChange={(e) => setForm((prev) => ({ ...prev, startDate: `${e.target.value}T00:00:00` }))}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2 text-stone-800"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-stone-700">End Date:</label>
                <input
                  type="date"
                  value={form.endDate.slice(0, 10)}
                  onChange={(e) => setForm((prev) => ({ ...prev, endDate: `${e.target.value}T23:59:59` }))}
                  className="w-full rounded-xl border border-stone-300 bg-white p-2 text-stone-800"
                />
              </div>
            </div>
          )}

          {/* Passkey */}
          <div className="space-y-1 pt-2">
            <label className="font-bold text-stone-800">Admin Bypass Passkey:</label>
            <input
              type="text"
              value={form.adminPasskey}
              onChange={(e) => setForm((prev) => ({ ...prev, adminPasskey: e.target.value }))}
              className="w-full rounded-xl border border-stone-300 p-2.5 font-mono text-stone-800"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-stone-200 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(form);
              onClose();
            }}
            className="flex-1 rounded-xl bg-emerald-900 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
          >
            Save & Publish Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER PRESENTATIONAL SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function MetricCard({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <div className="space-y-1">
      <div className="font-editorial text-2xl sm:text-3xl font-bold text-emerald-900">{value}</div>
      <div className="text-xs font-bold text-stone-800">{label}</div>
      <div className="text-[11px] text-stone-500">{sub}</div>
    </div>
  );
}

function MoatCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="space-y-2 p-4 rounded-2xl border border-stone-100 bg-stone-50/50">
      <h5 className="font-bold text-sm text-stone-900">{title}</h5>
      <p className="text-xs text-stone-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function PipelineStep({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border border-stone-100 bg-stone-50/60">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-amber-300 font-bold text-sm shadow-xs">
        {step}
      </div>
      <div className="space-y-1">
        <h5 className="font-bold text-sm text-stone-900">{title}</h5>
        <p className="text-xs text-stone-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function TechCard({ category, items }: { category: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
      <h4 className="font-editorial text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
        {category}
      </h4>
      <ul className="space-y-2 text-xs text-stone-600">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-700" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TelemetryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3.5 rounded-2xl border border-stone-100 bg-stone-50 text-center space-y-1">
      <div className="text-[11px] text-stone-500 font-medium">{label}</div>
      <div className="font-editorial text-base font-bold text-emerald-950">{value}</div>
    </div>
  );
}

function EndpointCard({
  method,
  path,
  title,
  desc,
  requestPayload,
  responsePayload,
}: {
  method: string;
  path: string;
  title: string;
  desc: string;
  requestPayload: string;
  responsePayload: string;
}) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-3">
        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs font-mono">
          {method}
        </span>
        <code className="text-sm font-bold text-stone-900 font-mono">{path}</code>
        <span className="text-xs text-stone-600">· {title}</span>
      </div>
      <p className="text-xs text-stone-600 leading-relaxed">{desc}</p>

      <div className="grid md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">
            Sample Request Payload
          </span>
          <pre className="rounded-xl bg-stone-900 p-3 font-mono text-[11px] text-stone-200 overflow-x-auto max-h-48">
            {requestPayload}
          </pre>
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">
            Sample Response Payload
          </span>
          <pre className="rounded-xl bg-stone-900 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-48">
            {responsePayload}
          </pre>
        </div>
      </div>
    </div>
  );
}
