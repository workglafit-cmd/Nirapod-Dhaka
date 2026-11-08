import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Map as MapIcon,
  Megaphone,
  Siren,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Activity,
  Building2,
  Stethoscope,
  Sparkles,
  Compass,
  Search,
  Sliders,
  Radio,
  FileText,
  AlertTriangle,
  Send,
  ExternalLink,
  ChevronRight,
  HeartPulse,
  Landmark,
  Eye,
  Check,
  Clock,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { LangToggle } from "@/components/Chrome";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nirapod Dhaka — Luxury Civic Intelligence & Safety Map" },
      {
        name: "description",
        content:
          "Dhaka's municipal safety and digital twin platform. Report hazards once, verify once, and track resolution directly to the spot.",
      },
      { property: "og:title", content: "Nirapod Dhaka — Public Safety Sorted in Three Steps" },
      {
        property: "og:description",
        content:
          "Evidence-based urban intelligence, citizen hazard reporting, emergency SOS, and GIS policy simulator for Dhaka.",
      },
    ],
  }),
  component: Landing,
});

function BotanicalSprig({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 180"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M60 170 C60 110, 75 70, 100 20"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M63 140 C50 135, 30 138, 25 145 C28 135, 45 125, 65 132"
        strokeWidth="1"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path
        d="M69 110 C80 100, 95 98, 105 102 C98 94, 82 92, 70 102"
        strokeWidth="1"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path
        d="M75 80 C60 72, 45 74, 38 80 C44 70, 60 65, 76 74"
        strokeWidth="1"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path
        d="M85 50 C95 40, 108 38, 114 42 C108 35, 95 34, 86 44"
        strokeWidth="1"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <circle cx="100" cy="20" r="3" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

function Landing() {
  const { t, lang, setLang } = useApp();
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const isBn = lang === "bn";

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubscribed(true);
    toast.success(
      isBn
        ? "ধন্যবাদ! আপনার ওয়ার্ডের বুলেটিন সাবস্ক্রিপশন সম্পন্ন হয়েছে।"
        : "Subscribed! You will receive verified ward safety bulletins.",
    );
    setEmailInput("");
  };

  return (
    <div className="min-h-dvh bg-[#FAF8F5] text-stone-900 selection:bg-[#E29A26]/30 font-sans antialiased">
      {/* ───────────────────────────────────────────────────────────────────────
          1. MINIMAL EDITORIAL HEADER
         ─────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#FAF8F5]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo & Civic Crest */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 text-amber-300 shadow-sm ring-1 ring-emerald-700/30">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-lg font-bold tracking-tight text-stone-900 sm:text-xl group-hover:text-amber-800 transition-colors">
                {isBn ? "নিরাপদ ঢাকা" : "Nirapod Dhaka"}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                {isBn ? "স্মার্ট নেশন • নগর গোয়েন্দা ও সেফটি পোর্টাল" : "Public Safety & Urban Digital Twin"}
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase text-stone-600">
            <a href="#services" className="hover:text-stone-950 transition-colors">
              {isBn ? "সেবা সমূহ" : "Services"}
            </a>
            <Link
              to="/planning"
              className="flex items-center gap-1.5 hover:text-amber-800 text-stone-800 font-bold transition-colors"
            >
              <Compass className="size-3.5 text-amber-700" />
              {isBn ? "ডিজিটাল টুইন স্টুডিও" : "Policy Studio"}
            </Link>
            <Link
              to="/ai"
              className="flex items-center gap-1.5 hover:text-emerald-800 text-stone-800 font-bold transition-colors"
            >
              <Sparkles className="size-3.5 text-emerald-700" />
              {isBn ? "এআই পরামর্শক" : "AI Copilot"}
            </Link>
            <Link to="/map" className="hover:text-stone-950 transition-colors">
              {isBn ? "লাইভ ম্যাপ" : "Live Map"}
            </Link>
            <a href="#notices" className="hover:text-stone-950 transition-colors">
              {isBn ? "পাবলিক নোটিশ" : "Notices"}
            </a>
          </nav>

          {/* Action cluster: Lang toggle & Log In */}
          <div className="flex items-center gap-3">
            <LangToggle className="bg-white/80 border-stone-200" />
            <Link
              to="/auth"
              search={{ mode: "login" }}
              className="tap-target inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-stone-800 shadow-sm transition-all hover:bg-stone-50 hover:border-stone-400 hover:shadow"
            >
              {isBn ? "লগ ইন" : "Log In"}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ───────────────────────────────────────────────────────────────────────
            2. HERO SECTION (Ref: Screenshot 2)
            - Warm ivory background
            - Editorial serif headline with italic emphasis
            - Amber gold pill button
            - Realistic hand holding device on ivory studio floor
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="relative overflow-x-clip bg-[#FAF8F5] pt-14 pb-0 sm:pt-20 lg:pt-24">
          {/* Subtle botanical line flourish in right margin */}
          <div className="pointer-events-none absolute right-4 top-12 hidden lg:block opacity-35 text-stone-400">
            <BotanicalSprig className="w-28 h-44" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Top Micro-label */}
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/60 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600 shadow-sm mb-6">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
              {isBn ? "ঢাকা সিটি কর্পোরেশন ও পুলিশ সংযুক্ত" : "DNCC • DSCC • Bangladesh Police Intelligence"}
            </div>

            {/* Editorial Serif Headline */}
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-900 max-w-4xl mx-auto leading-[1.08]">
              {isBn ? (
                <>
                  ঢাকার নাগরিক নিরাপত্তা,
                  <br />
                  সমাধান মাত্র <span className="italic font-normal font-editorial">তিন ধাপে।</span>
                </>
              ) : (
                <>
                  Dhaka's civic safety,
                  <br />
                  sorted in <span className="italic font-normal font-editorial">three steps.</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
              {isBn
                ? "একবার রিপোর্ট করুন, একবার যাচাই করুন, নিজ এলাকায় অগ্রগতি ট্র্যাক করুন। কোনো ভোগান্তি নেই, কোনো অনিশ্চয়তা নেই—ভাঙা রাস্তা, ম্যানহোল বা বিপদে আর দফতরে ঘুরতে হবে না।"
                : "Report once, verify once, track resolution directly to the spot. No runarounds, no guesswork, no visiting three different offices to fix a broken street."}
            </p>

            {/* Amber Gold Pill CTA Button */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/map"
                className="group tap-target inline-flex items-center justify-center gap-3 rounded-full bg-[#E29A26] hover:bg-[#D48B17] text-stone-950 font-bold px-8 py-3.5 text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                <span>{isBn ? "রিপোর্ট শুরু করুন" : "Start Reporting"}</span>
                <span className="flex size-6 items-center justify-center rounded-full bg-stone-950 text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="size-3.5 stroke-[2.5]" />
                </span>
              </Link>
              <Link
                to="/planning"
                className="tap-target inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white/80 px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700 hover:text-stone-950 hover:bg-white shadow-sm transition-all"
              >
                <Compass className="size-4 text-amber-700" />
                {isBn ? "আরবান টুইন স্টুডিও" : "Explore Digital Twin"}
              </Link>
            </div>

            {/* Visual Centerpiece: Hand holding smart mobile screen with entrance reveal */}
            {/* Overlap just enough to tuck the wrist's flat cut edge behind the border without cutting into the phone */}
            <div className="mt-12 sm:mt-16 flex justify-center relative -mb-2 sm:-mb-3 lg:-mb-4 z-10">
              <div className="relative inline-block animate-hero-reveal">
                {/* Soft ambient radial glow */}
                <div className="absolute -inset-8 bg-gradient-to-t from-emerald-600/10 via-amber-500/5 to-transparent blur-3xl rounded-full -z-20 pointer-events-none" />
                {/* Soft natural drop shadow floor */}
                <div className="absolute inset-x-12 bottom-1 sm:bottom-2 h-8 bg-stone-900/15 blur-xl rounded-full -z-10" />

                <div className="animate-hero-float">
                  <img
                    src="/hero_phone_cutout.png"
                    alt="Nirapod Dhaka mobile civic application with Government of Bangladesh seal"
                    className="mx-auto max-w-[320px] sm:max-w-[420px] lg:max-w-[470px] w-full object-contain drop-shadow-[0_28px_50px_rgba(20,30,25,0.18)] transition-transform duration-500 hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            3. "WHAT DO YOU NEED TODAY?" SERVICE CARDS (Ref: Screenshot 1)
            - 4 floating cards with 3D/realistic icons
            - Serif heading with italic accent
            - Sits at z-20 overlapping the hero wrist cutout so the flat edge is hidden
           ─────────────────────────────────────────────────────────────────────── */}
        <section id="services" className="relative z-20 bg-white py-20 sm:py-28 border-t border-stone-200 shadow-[0_-8px_30px_rgba(0,0,0,0.03)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
              <div>
                <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-stone-900 font-bold tracking-tight leading-[1.1]">
                  {isBn ? (
                    <>
                      আজ আপনার কী
                      <br />
                      <span className="italic font-normal font-editorial">প্রয়োজন?</span>
                    </>
                  ) : (
                    <>
                      What do you
                      <br />
                      <span className="italic font-normal font-editorial">need today?</span>
                    </>
                  )}
                </h2>
              </div>
              <div>
                <Link
                  to="/map"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-stone-950 transition-colors pb-1 border-b border-stone-300 hover:border-stone-900"
                >
                  {isBn ? "সব নাগরিক সেবা" : "Other Services"}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* 4 Floating Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Card 1: City Corporation Hazard */}
              <Link
                to="/map"
                className="group flex flex-col justify-between p-7 rounded-2xl bg-white border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300"
              >
                <div>
                  <div className="w-24 h-24 mb-6 mx-auto flex items-center justify-center p-2 rounded-2xl bg-stone-50 border border-stone-200/60 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
                    <img
                      src="/citycorporation.png"
                      alt="Dhaka City Corporation official emblem"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-stone-900 text-center mb-2">
                    {isBn ? "সিটি কর্পোরেশন রিপোর্ট" : "City Corporation Hazard"}
                  </h3>
                  <p className="text-xs text-stone-500 text-center leading-relaxed">
                    {isBn
                      ? "খোলা ম্যানহোল, ভাঙা রাস্তা, ড্রেনেজ বা পথবাতি সমস্যা দ্রুত সমাধান ও ট্র্যাকিং।"
                      : "Report open manholes, potholes, broken streetlights directly to DNCC/DSCC."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center text-xs font-semibold text-emerald-800 group-hover:text-emerald-900">
                  <span>{isBn ? "রিপোর্ট দাখিল করুন" : "File incident"}</span>
                  <ChevronRight className="size-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 2: Bangladesh Police SOS */}
              <Link
                to="/map"
                className="group flex flex-col justify-between p-7 rounded-2xl bg-white border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300"
              >
                <div>
                  <div className="w-24 h-24 mb-6 mx-auto flex items-center justify-center p-2 rounded-2xl bg-stone-50 border border-stone-200/60 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
                    <img
                      src="/police.png"
                      alt="Bangladesh Police official emblem"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-stone-900 text-center mb-2">
                    {isBn ? "বাংলাদেশ পুলিশ ৯৯৯" : "Bangladesh Police 999"}
                  </h3>
                  <p className="text-xs text-stone-500 text-center leading-relaxed">
                    {isBn
                      ? "জরুরি বিপদ, ছিনতাই বা আইনশৃঙ্খলার জন্য ১-ট্যাপে নিকটস্থ থানা ও টহল পুলিশ।"
                      : "Emergency distress signal dispatched instantly to nearest patrol car and police outpost."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center text-xs font-semibold text-red-700 group-hover:text-red-800">
                  <span>{isBn ? "জরুরি সুরক্ষা চালু" : "Instant alert"}</span>
                  <ChevronRight className="size-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 3: Disaster Management & Digital Twin */}
              <Link
                to="/planning"
                className="group flex flex-col justify-between p-7 rounded-2xl bg-white border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300"
              >
                <div>
                  <div className="w-24 h-24 mb-6 mx-auto flex items-center justify-center p-2 rounded-2xl bg-stone-50 border border-stone-200/60 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
                    <img
                      src="/disaster.png"
                      alt="Government of Bangladesh Disaster Management seal"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-stone-900 text-center mb-2">
                    {isBn ? "দুর্যোগ ব্যবস্থাপনা ও টুইন" : "Disaster Board & Twin"}
                  </h3>
                  <p className="text-xs text-stone-500 text-center leading-relaxed">
                    {isBn
                      ? "ওয়ার্ডভিত্তিক বন্যা, অতিবৃষ্টি ও জলবায়ু ঝুঁকি পূর্বাভাস এবং নীতি প্রস্তাবনা।"
                      : "Predict waterlogging, run dewatering pump simulations, and draft policy briefs."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center text-xs font-semibold text-teal-800 group-hover:text-teal-900">
                  <span>{isBn ? "স্টুডিও ওপেন করুন" : "Run simulator"}</span>
                  <ChevronRight className="size-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 4: Nirapod Dhaka Transit & GPS */}
              <Link
                to="/map"
                className="group flex flex-col justify-between p-7 rounded-2xl bg-white border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300"
              >
                <div>
                  <div className="w-24 h-24 mb-6 mx-auto flex items-center justify-center p-2 rounded-2xl bg-stone-50 border border-stone-200/60 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
                    <img
                      src="/favicon.png"
                      alt="Nirapod Dhaka Safe Transit & GPS"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-stone-900 text-center mb-2">
                    {isBn ? "নিরাপদ রুট ও হারানো ডিভাইস" : "Safe Route & Locator"}
                  </h3>
                  <p className="text-xs text-stone-500 text-center leading-relaxed">
                    {isBn
                      ? "জলাবদ্ধতা ও ঝুঁকিপূর্ণ এলাকা এড়িয়ে নিরাপদ যাতায়াত এবং হারানো ডিভাইসের লাইভ ট্র্যাকিং।"
                      : "Pedestrian routes avoiding floods and crowdsourced GPS lost phone locator."}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center text-xs font-semibold text-stone-700 group-hover:text-stone-950">
                  <span>{isBn ? "রুট ম্যাপ দেখুন" : "Explore route"}</span>
                  <ChevronRight className="size-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            4. DARK CONTRAST SECTION: "EVERYTHING YOU NEED. NOTHING YOU DON'T."
            (Ref: Screenshot 5)
            - Deep obsidian background (#0A0D10)
            - White editorial serif headline
            - 5 numbered pillars: (01) to (05)
            - Architectural Arches Vista framed underneath
           ─────────────────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#0A0D10] text-white py-24 sm:py-32">
          {/* Subtle floral flourish on dark background */}
          <div className="pointer-events-none absolute right-6 top-8 hidden lg:block opacity-20 text-white">
            <BotanicalSprig className="w-32 h-52" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Centered White Serif Headline */}
            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-white text-center font-bold tracking-tight leading-[1.15] max-w-3xl mx-auto">
              {isBn ? (
                <>
                  প্রয়োজনীয় সবকিছু।
                  <br />
                  <span className="font-normal font-editorial text-stone-300">অপ্রয়োজনীয় কিছুই নয়।</span>
                </>
              ) : (
                <>
                  Everything you need.
                  <br />
                  <span className="font-normal font-editorial text-stone-300">Nothing you don't.</span>
                </>
              )}
            </h2>

            {/* 5 Numbered Columns */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 border-b border-white/10 pb-16">
              {/* (01) AI Civic Advisor */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold tracking-widest text-amber-400">
                  (01)
                </span>
                <h4 className="font-editorial text-base sm:text-lg font-bold text-white">
                  {isBn ? "এআই নাগরিক সহকারী" : "AI Civic Advisor"}
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {isBn
                    ? "বাংলা ও ইংরেজিতে সিটি কর্পোরেশনের বিধিমালা এবং জরুরি অধিকার জানুন।"
                    : "Instant multilingual guidance on municipal bylaws and civic safety rights."}
                </p>
              </div>

              {/* (02) Ward Budget Simulator */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold tracking-widest text-amber-400">
                  (02)
                </span>
                <h4 className="font-editorial text-base sm:text-lg font-bold text-white">
                  {isBn ? "ওয়ার্ড বাজেট সিমুলেটর" : "Budget Simulator"}
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {isBn
                    ? "এক টাকা খরচের আগেই লাখ টাকার প্রকল্প খরচ ও ৫ বছরের সামাজিক আরওআই দেখুন।"
                    : "Calculate capital costs in BDT Lakh and 5-yr societal ROI before spending a taka."}
                </p>
              </div>

              {/* (03) Find a Ward Kendra */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold tracking-widest text-amber-400">
                  (03)
                </span>
                <h4 className="font-editorial text-base sm:text-lg font-bold text-white">
                  {isBn ? "ওয়ার্ড ও থানা কেন্দ্র" : "Find a Ward Kendra"}
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {isBn
                    ? "ডিএনসিসি, ডিএসসিসি ওয়ার্ড অফিস, থানা ও ফায়ার সার্ভিস এক জিআইএস ম্যাপে।"
                    : "City Corporation ward offices, police outposts, and fire stations on one map."}
                </p>
              </div>

              {/* (04) Live Sensor Streams */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold tracking-widest text-amber-400">
                  (04)
                </span>
                <h4 className="font-editorial text-base sm:text-lg font-bold text-white">
                  {isBn ? "লাইভ সেন্সর ডেটা" : "Live Sensor Feeds"}
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {isBn
                    ? "ওপেন-মেটিও লাইভ বৃষ্টিপাত এবং ব্লু-স্কাই বায়ুমান সরাসরি সংযুক্ত।"
                    : "Real-time rainfall telemetry and air pollution tracking without CAPTCHAs."}
                </p>
              </div>

              {/* (05) Police & Hospital Desk */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold tracking-widest text-amber-400">
                  (05)
                </span>
                <h4 className="font-editorial text-base sm:text-lg font-bold text-white">
                  {isBn ? "পুলিশ ও হাসপাতাল ডেস্ক" : "Direct Dispatch Desk"}
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {isBn
                    ? "আপনার পোস্টাল কোডে কে দায়িত্বপ্রাপ্ত এবং ছবি সহ সমাধানের স্বচ্ছ প্রমাণ।"
                    : "Know exactly who verifies and dispatches to your PIN code with photo proof."}
                </p>
              </div>
            </div>

            {/* Architectural Heritage Arches Vista */}
            <div className="mt-16 sm:mt-20">
              <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
                {/* Foreground Arch Windows Cutout */}
                <div className="relative">
                  <img
                    src="/bangladesh_heritage_arches.jpg"
                    alt="Curzon Hall and historic Dhaka Mughal architecture illuminated at dusk"
                    className="w-full h-[280px] sm:h-[420px] lg:h-[480px] object-cover object-center filter brightness-95 contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D10] via-transparent to-transparent opacity-80" />
                  
                  {/* Floating subtle overlay label */}
                  <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-300">
                        DHAKA HERITAGE ARCHITECTURE • SMART RESILIENCE
                      </p>
                      <p className="font-editorial text-lg sm:text-2xl font-bold text-white">
                        {isBn
                          ? "কার্জন হল থেকে লালবাগ কেল্লা — শতবর্ষের ঐতিহ্য থেকে সুরক্ষিত ঢাকা"
                          : "Curzon Hall to Lalbagh Kella — Preserving Heritage, Securing Every Citizen"}
                      </p>
                    </div>
                    <Link
                      to="/planning"
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white border border-white/20 transition-all"
                    >
                      <span>{isBn ? "টুইন বিশ্লেষণ দেখুন" : "View Ward Models"}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            5. "PUBLIC NOTICE & NEWS" SECTION (Ref: Screenshot 3)
            - Editorial serif heading: "Public Notice & Civic Intelligence"
            - Left: Large featured story card with photographic banner
            - Right: 3 stacked cards with category tags, read times, headlines
           ─────────────────────────────────────────────────────────────────────── */}
        <section id="notices" className="bg-[#FAF8F5] py-24 sm:py-32 border-t border-stone-200/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Centered Serif Heading */}
            <div className="text-center mb-16 sm:mb-20">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-stone-500 block mb-3">
                {isBn ? "লাইভ সিটি আপডেট" : "OFFICIAL MUNICIPAL BULLETINS"}
              </span>
              <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-stone-900 font-bold tracking-tight">
                {isBn ? (
                  <>
                    পাবলিক নোটিশ ও<br />
                    <span className="italic font-normal font-editorial">নাগরিক গোয়েন্দা তথ্য</span>
                  </>
                ) : (
                  <>
                    Public Notice &<br />
                    <span className="italic font-normal font-editorial">Civic Intelligence</span>
                  </>
                )}
              </h2>
            </div>

            {/* 2-Column Editorial Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Featured Card */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)] transition-all group">
                <div className="overflow-hidden relative h-[240px] sm:h-[300px]">
                  <img
                    src="/dhaka_civic_mobility.jpg"
                    alt="Dhaka Metro Rail modern transit line"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-stone-950/80 backdrop-blur-md text-amber-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-amber-400/20">
                    FEATURED NOTICE
                  </div>
                </div>
                <div className="p-7 sm:p-8">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wider">
                    <span>{isBn ? "সিটি কর্পোরেশন" : "Public Notice"}</span>
                    <span>•</span>
                    <span>3 min read</span>
                  </div>
                  <h3 className="font-editorial text-2xl font-bold text-stone-900 mb-3 group-hover:text-amber-800 transition-colors leading-snug">
                    {isBn
                      ? "বর্ষাকালীন জলাবদ্ধতা টাস্কফোর্স: ১২টি ঝুঁকিপূর্ণ ড্রেনেজ করিডোর চালু"
                      : "Monsoon Waterlogging Taskforce: High-Density Drainage Gates Activated"}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-6 font-normal">
                    {isBn
                      ? "মিরপুর ১০, কাজীপাড়া ও শান্তিনগর এলাকায় ভারী বর্ষণের আগেই স্বয়ংক্রিয় ডিওয়াটারিং পাম্প মোতায়েন করা হয়েছে। লাইভ সেন্সর ডেটা পর্যবেক্ষণ করুন।"
                      : "City Corporation deploys real-time dewatering pumps across Mirpur 10, Kazipara, and Shantinagar corridors ahead of seasonal downpours. View live ward telemetry."}
                  </p>
                  <Link
                    to="/map"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-900"
                  >
                    <span>{isBn ? "ম্যাপে ঝুঁকিপূর্ণ এলাকা দেখুন" : "View corridor status on map"}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: 3 Stacked Cards */}
              <div className="lg:col-span-6 space-y-4">
                {/* Story 1: Smart Lighting */}
                <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all group">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                    <span className="text-emerald-700 font-bold">RAPID RESPONSE</span>
                    <span>•</span>
                    <span>2 min read</span>
                  </div>
                  <h4 className="font-editorial text-lg sm:text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors mb-2">
                    {isBn
                      ? "নিরাপদ রাত্রিকালীন করিডোর: ধানমন্ডি ও বনানীতে হাই-লুমেন স্মার্ট লাইটিং"
                      : "Night-time Women's Safe Corridor Pilot Launched in Dhanmondi & Banani"}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {isBn
                      ? "৪৫০টির বেশি সেন্সর-সংযুক্ত এলইডি লাইট ও জরুরি এসওএস কিয়স্ক সক্রিয়। রাতের চলাচলে ঝুঁকি হ্রাস পেয়েছে ৪৬%।"
                      : "High-density LED smart lighting and connected SOS kiosks now operational across 4 key university corridors."}
                  </p>
                </div>

                {/* Story 2: Digital Twin & Heat Island */}
                <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all group">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                    <span className="text-teal-700 font-bold">SMART NATION</span>
                    <span>•</span>
                    <span>4 min read</span>
                  </div>
                  <h4 className="font-editorial text-lg sm:text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors mb-2">
                    {isBn
                      ? "ডিজিটাল টুইন মডেল: পুরান ঢাকার তাপমাত্রা কমাতে ১,২০০ মাইক্রো-পার্ক প্রস্তাব"
                      : "Digital Twin Model Recommends 1,200 Micro-Parks to Cool Old Dhaka"}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {isBn
                      ? "ওয়ার্ড ৩২ সিমুলেশনে দেখা গেছে সবুজ ছাদ ও ছায়া বাড়ালে ভূপৃষ্ঠের তাপমাত্রা ২.৪° সে. কমে এবং বিদ্যুৎ সাশ্রয় হয়।"
                      : "Ward 32 simulations show a 2.4°C surface temperature drop using green roofs and urban canopy interventions."}
                  </p>
                </div>

                {/* Story 3: Hospital Telemetry */}
                <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] transition-all group">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                    <span className="text-red-700 font-bold">HOSPITAL NETWORK</span>
                    <span>•</span>
                    <span>1 min read</span>
                  </div>
                  <h4 className="font-editorial text-lg sm:text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors mb-2">
                    {isBn
                      ? "লাইভ আইসিইউ ও জরুরি বেড টেলিমেট্রি: ১৮টি হাসপাতালে সরাসরি ট্র্যাকিং"
                      : "Live ICU & Emergency Bed Telemetry Integrated Across 18 Major Hospitals"}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {isBn
                      ? "অ্যাম্বুলেন্সের খালি বেড খুঁজতে গিয়ে অপচয় হওয়া সময় ৩৮% কমেছে। রিয়েল-টাইম তথ্য যাচাইকৃত।"
                      : "Real-time vacancy tracking reduces emergency ambulance transit delay by 38% across major metropolitan zones."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────────────────
            6. FOOTER WITH BANGLADESH LANDMARKS AS BACKGROUND
            - Background image: /footer_card_image.jpg
            - Content: All links, heading, input, and language toggle directly on top
           ─────────────────────────────────────────────────────────────────────── */}
        <footer
          className="relative overflow-hidden text-white pt-24 pb-12 border-t border-emerald-950/40"
          style={{
            backgroundImage: "url('/footer_card_image.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Subtle dark emerald gradient overlay for optimal legibility and landmark visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#012514]/65 via-[#012b18]/45 to-[#011d10]/75 -z-10" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 items-start">
              {/* Left Column: Heading & Notification Pill */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-amber-300 ring-1 ring-white/20 shadow-md">
                    <ShieldCheck className="size-5" />
                  </div>
                  <span className="font-editorial text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                    {isBn ? "নিরাপদ ঢাকা" : "Nirapod Dhaka"}
                  </span>
                </div>

                <h2 className="font-editorial text-4xl sm:text-5xl text-white font-bold tracking-tight leading-[1.15] drop-shadow-md">
                  {isBn ? (
                    <>
                      তৈরি প্রতিটি নাগরিকের জন্য,
                      <br />
                      যেখানেই <span className="italic font-normal font-editorial text-amber-300">তারা থাকুন না কেন।</span>
                    </>
                  ) : (
                    <>
                      Made for every citizen,
                      <br />
                      wherever <span className="italic font-normal font-editorial text-amber-300">they are.</span>
                    </>
                  )}
                </h2>

                <p className="text-sm text-emerald-100/95 max-w-md font-normal leading-relaxed drop-shadow-sm">
                  {isBn
                    ? "আপনার এলাকার সড়ক উন্নয়ন, বন্যা নিয়ন্ত্রণ বা জরুরি সতর্কবার্তা সরাসরি পেতে ইমেইল বা ওয়ার্ড নম্বর দিন।"
                    : "Receive verified municipal alerts, waterlogging forecasts, and resolution confirmations straight to your inbox."}
                </p>

                {/* Email notification subscribe pill */}
                <form onSubmit={handleSubscribe} className="max-w-md">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder={isBn ? "ইমেইল বা ওয়ার্ড নম্বর লিখুন..." : "Enter your email or ward..."}
                      className="w-full rounded-full border border-white/25 bg-white/15 backdrop-blur-md px-5 py-3.5 text-xs sm:text-sm text-white placeholder:text-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400 pr-14 shadow-lg"
                    />
                    <button
                      type="submit"
                      aria-label="Subscribe"
                      className="absolute right-1.5 flex size-9 items-center justify-center rounded-full bg-amber-400 text-stone-950 hover:bg-amber-300 transition-all hover:scale-105 active:scale-95 shadow-md"
                    >
                      <ArrowRight className="size-4 stroke-[2.5]" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Multi-column Navigation */}
              <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8 pt-6 sm:pt-10 lg:pt-16">
                {/* Civic Services */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-4 drop-shadow-sm">
                    {isBn ? "নাগরিক সেবা" : "Apply & Services"}
                  </h4>
                  <ul className="space-y-3.5 text-xs text-white/90 font-medium">
                    <li>
                      <Link to="/map" className="hover:text-amber-300 transition-colors">
                        {isBn ? "নাগরিক রিপোর্ট" : "Report a Hazard"}
                      </Link>
                    </li>
                    <li>
                      <Link to="/map" className="hover:text-amber-300 transition-colors">
                        {isBn ? "লাইভ সেফটি ম্যাপ" : "Live Hazard Map"}
                      </Link>
                    </li>
                    <li>
                      <Link to="/map" className="hover:text-amber-300 transition-colors">
                        {isBn ? "জরুরি এসওএস" : "Emergency SOS"}
                      </Link>
                    </li>
                    <li>
                      <Link to="/map" className="hover:text-amber-300 transition-colors">
                        {isBn ? "হারানো ফোন লোকেটর" : "Lost Device Beacon"}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Policy Studio */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-4 drop-shadow-sm">
                    {isBn ? "পলিসি স্টুডিও" : "Policy Studio"}
                  </h4>
                  <ul className="space-y-3.5 text-xs text-white/90 font-medium">
                    <li>
                      <Link to="/planning" className="hover:text-amber-300 transition-colors">
                        {isBn ? "ডিজিটাল টুইন ম্যাপ" : "Digital Twin GIS"}
                      </Link>
                    </li>
                    <li>
                      <Link to="/planning" className="hover:text-amber-300 transition-colors">
                        {isBn ? "হোয়াট-ইফ সিমুলেটর" : "What-If Simulator"}
                      </Link>
                    </li>
                    <li>
                      <Link to="/planning" className="hover:text-amber-300 transition-colors">
                        {isBn ? "জলবায়ু ও বন্যা টেলিমেট্রি" : "Climate & Flood"}
                      </Link>
                    </li>
                    <li>
                      <Link to="/ai" className="hover:text-amber-300 transition-colors">
                        {isBn ? "এআই আইন সহকারী" : "AI Legal Assistant"}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Authorities & Help */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-4 drop-shadow-sm">
                    {isBn ? "প্রশাসন ও সহায়তা" : "Governance"}
                  </h4>
                  <ul className="space-y-3.5 text-xs text-white/90 font-medium">
                    <li>
                      <Link to="/auth" search={{ type: "authority" }} className="hover:text-amber-300 transition-colors">
                        {isBn ? "সিটি কর্পোরেশন" : "DNCC / DSCC Desk"}
                      </Link>
                    </li>
                    <li>
                      <Link to="/auth" search={{ type: "authority" }} className="hover:text-amber-300 transition-colors">
                        {isBn ? "বাংলাদেশ পুলিশ" : "Bangladesh Police"}
                      </Link>
                    </li>
                    <li>
                      <Link to="/auth" search={{ type: "authority" }} className="hover:text-amber-300 transition-colors">
                        {isBn ? "দুর্যোগ ব্যবস্থাপনা" : "Disaster Board"}
                      </Link>
                    </li>
                    <li>
                      <a href="#help" className="hover:text-amber-300 transition-colors">
                        {isBn ? "সহায়তা কেন্দ্র" : "Help & Contact"}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Language Pill Row */}
            <div className="flex items-center justify-end pb-8">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md p-1 shadow-md text-xs">
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`rounded-full px-4 py-1.5 font-bold transition-all ${
                    lang === "en"
                      ? "bg-amber-400 text-stone-950 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang("bn")}
                  className={`rounded-full px-4 py-1.5 font-bold transition-all ${
                    lang === "bn"
                      ? "bg-amber-400 text-stone-950 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {/* Bottom Copyright & Open Data Notice */}
            <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/80">
              <p>
                © 2026 Nirapod Dhaka. Open Smart Nation Initiative. Developed for City Corporation & Bangladesh Police.
              </p>
              <div className="flex items-center gap-6 font-medium text-white/80">
                <Link to="/map" className="hover:text-amber-300 transition-colors">
                  Open Data API
                </Link>
                <Link to="/planning" className="hover:text-amber-300 transition-colors">
                  Digital Twin Registry
                </Link>
                <Link to="/auth" className="hover:text-amber-300 transition-colors">
                  Official Portal
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
