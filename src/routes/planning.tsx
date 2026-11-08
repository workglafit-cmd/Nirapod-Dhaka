import { createFileRoute, Link } from "@tanstack/react-router";
import { UrbanPlanningStudio } from "@/components/planning/UrbanPlanningStudio";
import { BrandMark, LangToggle } from "@/components/Chrome";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth";
import { Compass, ArrowLeft, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/planning")({
  head: () => ({
    meta: [
      { title: "Smart Nation Urban Policy & Planning Studio — Nirapod Dhaka" },
      {
        name: "description",
        content:
          "Integrated public-data intelligence for evidence-based municipal planning, digital twin risk modeling, and infrastructure investment simulation.",
      },
    ],
  }),
  component: PlanningPage,
});

function PlanningPage() {
  const { lang } = useApp();
  const isBn = lang === "bn";

  return (
    <div className="min-h-dvh bg-[#FAF8F5] text-stone-900 flex flex-col selection:bg-amber-100 selection:text-amber-950">
      {/* Top Civic Navigation (matches the home page editorial luxe aesthetic) */}
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-950 transition-colors shadow-sm"
              title={isBn ? "হোমে ফিরুন" : "Return to Home"}
            >
              <ArrowLeft className="size-4" />
            </Link>
            <BrandMark compact />
            <div className="hidden sm:block h-4 w-px bg-stone-300" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-editorial font-bold text-sm tracking-tight text-stone-900">
                {isBn ? "আরবান পলিসি ও ডিজিটাল টুইন স্টুডিও" : "Smart Nation Urban Planning Suite"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-sm">
                {isBn ? "অফিসিয়াল স্টুডিও" : "Official Planning Studio"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-xs font-bold text-stone-800 transition-colors shadow-sm"
            >
              <Compass className="size-3.5 text-amber-700" />
              <span>{isBn ? "লাইভ ম্যাপ" : "Live Map"}</span>
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-xs font-bold text-stone-800 transition-colors shadow-sm"
            >
              <Shield className="size-3.5 text-emerald-700" />
              <span>{isBn ? "প্রশাসন" : "Authority Ops"}</span>
            </Link>

            <Link
              to="/ai"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-emerald-800 hover:bg-emerald-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105"
            >
              <Sparkles className="size-3.5 text-amber-300" />
              <span>{isBn ? "এআই সহকারী" : "AI Intelligence"}</span>
            </Link>

            <NotificationPanel />
            <LangToggle />
          </div>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8">
        <UrbanPlanningStudio />
      </main>
    </div>
  );
}
