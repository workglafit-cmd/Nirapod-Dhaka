import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Camera,
  CheckCircle2,
  ChevronRight,
  Eye,
  Fingerprint,
  FlaskConical,
  HeartHandshake,
  Lock,
  MessageSquare,
  Mic,
  Navigation,
  Network,
  Phone,
  ScanLine,
  Send,
  Shield,
  Siren,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AI Intelligence — Nirapod Dhaka" },
      {
        name: "description",
        content: "Nirapod Dhaka doesn't just collect reports. It understands them using AI.",
      },
    ],
  }),
  component: AiIntelligencePage,
});

function RealBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-700 shadow-sm">
      <Sparkles className="size-3.5" />
      Real AI
    </span>
  );
}

function PrototypeBadge({ label = "AI Prototype" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-700 shadow-sm">
      <FlaskConical className="size-3.5" />
      {label}
    </span>
  );
}

function SectionHeader({ title, badge }: { title: string; badge: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
      <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
      {badge}
    </div>
  );
}

function AiIntelligencePage() {
  const { t, lang } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Shield className="size-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              Nirapod<span className="text-primary">Dhaka</span>
            </span>
          </Link>
          <div className="flex gap-4">
            <Link to="/map" className="text-sm font-semibold text-muted-foreground hover:text-primary">
              Live Map
            </Link>
            <Link to="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-primary">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-12 sm:px-8 lg:py-20">
        
        {/* Page Header */}
        <header className="flex flex-col gap-6 md:text-center md:items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <BrainCircuit className="size-4 text-primary" />
            <span className="text-sm font-bold tracking-wide text-primary">
              {lang === "bn" ? "নিরাপদ এআই ইন্টেলিজেন্স" : "Nirapod AI Intelligence"}
            </span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl">
            {lang === "bn" ? "নাগরিক রিপোর্টকে পরিণত করুন" : "Turning citizen reports into"} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              {lang === "bn" ? "কার্যকরী নিরাপত্তা বুদ্ধিমত্তায়।" : "actionable safety intelligence."}
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            {lang === "bn"
              ? "নিরাপদ ঢাকা শুধু রিপোর্ট সংগ্রহ করে না, এটি বোঝে। বাংলিশ ভয়েস নোট বিশ্লেষণ থেকে শুরু করে সঠিক কর্তৃপক্ষের কাছে রিপোর্ট পাঠানো পর্যন্ত।"
              : "Nirapod Dhaka doesn't just collect reports. It understands them. From parsing emergency voice notes in Banglish to routing severe hazards to the right authority instantly."}
          </p>
        </header>

        {/* Section A: Understand */}
        <section className="flex flex-col gap-6 scroll-mt-24" id="understand">
          <SectionHeader title={lang === "bn" ? "প্রতিটি রিপোর্ট বুঝুন" : "Understand Every Report"} badge={<RealBadge />} />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-center gap-4">
              <p className="text-lg text-muted-foreground">
                {lang === "bn"
                  ? "যখন কোনো নাগরিক বাংলিশে কোনো মেসেজ লেখে, আমাদের এনএলপি মডেল টেক্সটটি বিশ্লেষণ করে, ঝুঁকির ধরন ও তীব্রতা নির্ধারণ করে এবং সঠিক কর্তৃপক্ষের কাছে পাঠায়।"
                  : "When a citizen types a panicked message in Banglish, our actual NLP models parse the text, determine the hazard category, assess the severity, and route it to the exact correct authority."}
              </p>
              <button 
                onClick={() => navigate({ to: "/map" })}
                className="mt-2 w-fit rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                {lang === "bn" ? "রিপোর্ট ইন্টেলিজেন্স ব্যবহার করুন" : "Try Report Intelligence"}
              </button>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 rounded-xl bg-muted p-4 font-mono text-sm text-foreground/80">
                "ei rastay ekta open manhole ase, rate dekha jay na, manush pore jete pare"
              </div>
              <div className="flex flex-col items-center gap-2 pb-4 text-muted-foreground">
                <ArrowRight className="size-5 rotate-90 md:rotate-0" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</span>
                  <span className="mt-1 block text-sm font-bold text-foreground">Infrastructure</span>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Severity</span>
                  <span className="mt-1 block text-sm font-bold text-destructive">High</span>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority</span>
                  <span className="mt-1 block text-sm font-bold text-primary">70</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section B: Speak */}
        <section className="flex flex-col gap-6 scroll-mt-24" id="speak">
          <SectionHeader title={lang === "bn" ? "টাইপ করা ছাড়াই রিপোর্ট করুন" : "Report Without Typing"} badge={<RealBadge />} />
          <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
            <div className="flex flex-col justify-center gap-4">
              <p className="text-lg text-muted-foreground">
                {lang === "bn"
                  ? "জরুরী পরিস্থিতিতে টাইপ করা কঠিন। আমাদের ভয়েস-টু-টেক্সট এআই নাগরিকদের বাংলায় কথা বলে রিপোর্ট করার সুবিধা দেয়।"
                  : "In an emergency, typing is difficult. Our live voice-to-text pipeline allows citizens to report incidents naturally in Bangla. The AI handles the transcription and structuring automatically."}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center shadow-sm">
              <div className="mb-6 grid size-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                <Mic className="size-8" />
              </div>
              <h3 className="mb-2 font-display text-xl font-bold">{lang === "bn" ? "ভয়েস রিপোর্টিং" : "Voice Reporting"}</h3>
              <p className="mb-6 text-sm text-muted-foreground">{lang === "bn" ? "\"স্বাভাবিকভাবে বাংলায় কথা বলুন।\"" : "\"Speak naturally in Bangla.\""}</p>
              <button 
                onClick={() => navigate({ to: "/map" })}
                className="rounded-full bg-background px-6 py-3 text-sm font-bold text-foreground shadow-sm hover:bg-muted"
              >
                {lang === "bn" ? "রেকর্ডিং শুরু করুন" : "Start Recording"}
              </button>
            </div>
          </div>
        </section>

        {/* Section C: Verify */}
        <section className="flex flex-col gap-6 scroll-mt-24" id="verify">
          <SectionHeader title="Verify Visual Evidence" badge={<PrototypeBadge label="Demo MVP" />} />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-center gap-4">
              <p className="text-lg text-muted-foreground">
                To prevent spam and ensure trustworthiness, our visual verification system scans uploaded photos to determine if the evidence matches the incident description before human review.
              </p>
            </div>
            <div className="flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="grid size-12 place-items-center rounded-full bg-secondary">
                  <Camera className="size-5" />
                </div>
                <span className="text-xs font-semibold">Photo</span>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
              <div className="flex flex-col items-center gap-2">
                <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <ScanLine className="size-5 animate-pulse" />
                </div>
                <span className="text-xs font-semibold">Scan</span>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
              <div className="flex flex-col items-center gap-2">
                <div className="grid size-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>
                <span className="text-xs font-semibold">Acceptable</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section D: Predict */}
        <section className="flex flex-col gap-6 scroll-mt-24" id="predict">
          <SectionHeader title={lang === "bn" ? "প্রেডিক্টিভ সেফটি ম্যাপ" : "Predictive Safety Map"} badge={<PrototypeBadge />} />
          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:flex-row md:p-8">
            <div className="flex-1 space-y-4">
              <h3 className="font-display text-2xl font-bold">
                {lang === "bn" ? "ঘটনার আগেই ঝুঁকি অনুমান করুন।" : "Predicting risk before it happens."}
              </h3>
              <p className="text-muted-foreground">
                {lang === "bn"
                  ? "ঐতিহাসিক ডেটা এবং বর্তমান ঘটনার ঘনত্ব বিশ্লেষণ করে, আমাদের এমএল প্রোটোটাইপ সক্রিয়ভাবে উচ্চ ঝুঁকির অঞ্চলগুলি চিহ্নিত করে।"
                  : "By analyzing historical patterns, time-of-day dynamics, and recent incident density, this ML prototype estimates elevated risk zones proactively."}
              </p>
              <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-5" />
                  <span className="font-bold uppercase tracking-wide">{lang === "bn" ? "এআই নিরাপত্তা ঝুঁকি" : "AI Safety Risk"}</span>
                </div>
                <h4 className="mt-2 text-xl font-bold">{lang === "bn" ? "মিরপুর রোড" : "Mirpur Road"}</h4>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-muted-foreground">{lang === "bn" ? "সম্ভাব্য সময়" : "Predicted Period"}</span>
                    <span className="font-semibold text-foreground">8 PM – 11 PM</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">{lang === "bn" ? "পরামর্শ" : "Recommended"}</span>
                    <span className="font-semibold text-foreground">{lang === "bn" ? "সতর্কতা অবলম্বন করুন" : "Exercise Caution"}</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-destructive/10 pt-4">
                  <span className="block text-xs font-bold uppercase text-muted-foreground">{lang === "bn" ? "লক্ষণ" : "Signals"}</span>
                  <ul className="mt-2 flex flex-col gap-1 text-sm">
                    <li>• {lang === "bn" ? "সাম্প্রতিক ঘটনার বৃদ্ধি" : "Recent incident density surge"}</li>
                    <li>• {lang === "bn" ? "ঐতিহাসিক সাপ্তাহিক প্যাটার্ন" : "Historical weekend time pattern"}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-xl border border-border bg-secondary/50 min-h-[300px]">
              <div className="absolute inset-0 bg-[url('https://tile.openstreetmap.org/13/6082/3534.png')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
              {/* Heatmap overlay mockup */}
              <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/40 blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-destructive text-white shadow-xl">
                <AlertTriangle className="size-6" />
              </div>
            </div>
          </div>
        </section>

        {/* Section E: Prioritize */}
        <section className="flex flex-col gap-6 scroll-mt-24" id="prioritize">
          <SectionHeader title={lang === "bn" ? "এআই প্রায়োরিটি কিউ" : "AI Priority Queue"} badge={<RealBadge />} />
          <div className="flex flex-col gap-4">
            <p className="text-lg text-muted-foreground">
              {lang === "bn" 
                ? "আমাদের প্রোডাকশন ব্যাকএন্ড শুধু সময়ের ভিত্তিতে রিপোর্ট তালিকাভুক্ত করে না। এটি এআই ব্যবহার করে তীব্রতা এবং জরুরিতার ভিত্তিতে ১০০ এর মধ্যে স্কোর দেয়, যাতে গুরুত্বপূর্ণ সমস্যাগুলো দ্রুত কর্তৃপক্ষের নজরে আসে।"
                : "Our real production backend doesn't just list reports chronologically. It uses AI to score them out of 100 based on severity and urgency, ensuring that critical infrastructure failures or severe accidents are instantly visible to authorities."}
            </p>
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="grid grid-cols-12 gap-4 border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-2">Severity</div>
                <div className="col-span-5">Incident Context</div>
                <div className="col-span-2">Score</div>
                <div className="col-span-3 text-right">Status</div>
              </div>
              <div className="grid grid-cols-12 items-center gap-4 rounded-xl bg-destructive/10 p-3">
                <div className="col-span-2 font-bold text-destructive">CRITICAL</div>
                <div className="col-span-5">
                  <span className="block font-bold">Severe Accident</span>
                  <span className="text-xs text-muted-foreground">Mirpur 10 • Just now</span>
                </div>
                <div className="col-span-2 font-mono text-lg font-bold text-destructive">92</div>
                <div className="col-span-3 text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-1 text-xs font-bold text-white"><CheckCircle2 className="size-3" /> Visual Verified</span>
                </div>
              </div>
              <div className="grid grid-cols-12 items-center gap-4 rounded-xl bg-primary/10 p-3">
                <div className="col-span-2 font-bold text-primary">HIGH</div>
                <div className="col-span-5">
                  <span className="block font-bold">Open Manhole</span>
                  <span className="text-xs text-muted-foreground">Gulshan Ave • 10m ago</span>
                </div>
                <div className="col-span-2 font-mono text-lg font-bold text-primary">70</div>
                <div className="col-span-3 text-right">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs font-semibold">Pending Review</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section F: Protect Report Integrity */}
        <section className="flex flex-col gap-6 scroll-mt-24" id="integrity">
          <SectionHeader title={lang === "bn" ? "রিপোর্টের সত্যতা যাচাই" : "Report Integrity"} badge={<PrototypeBadge />} />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-center gap-4">
              <p className="text-lg text-muted-foreground">
                {lang === "bn"
                  ? "ভুয়া বা স্প্যাম রিপোর্ট থেকে প্ল্যাটফর্মকে সুরক্ষিত রাখতে, আমাদের এআই ইন্টিগ্রিটি প্রোটোটাইপ ইনকামিং প্যাটার্ন মূল্যায়ন করে এবং মানুষের পর্যালোচনার জন্য অস্বাভাবিকতা চিহ্নিত করে।"
                  : "To safeguard the platform against coordinated fraud or panic-inducing spam, the AI Integrity Prototype evaluates incoming patterns and flags anomalies for human review without automatically deleting data."}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-sm">
              <div className="flex items-center gap-3 text-amber-700">
                <Fingerprint className="size-6" />
                <h3 className="font-bold uppercase tracking-wide">{lang === "bn" ? "⚠ পর্যালোচনা প্রয়োজন" : "⚠ Review Recommended"}</h3>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-bold uppercase text-muted-foreground">Risk Level</span>
                  <span className="font-display text-xl font-bold text-amber-700">HIGH</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-muted-foreground">Action</span>
                  <span className="font-display text-xl font-bold text-foreground">Human Review</span>
                </div>
              </div>
              <div className="mt-4 border-t border-amber-500/20 pt-4">
                <span className="block text-xs font-bold uppercase text-muted-foreground">Anomalous Signals</span>
                <ul className="mt-2 flex flex-col gap-1 text-sm">
                  <li>• 7 similar reports in a 4-minute window</li>
                  <li>• Overlapping exact locations</li>
                  <li>• Unusual vote confirmation speed</li>
                </ul>
              </div>
              <div className="mt-6 flex gap-3">
                <button className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700">Review Pattern</button>
                <button className="rounded-lg border border-amber-500/30 bg-transparent px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-500/10">Dismiss</button>
              </div>
            </div>
          </div>
        </section>

        {/* Section G: Privacy Protection */}
        <section className="flex flex-col gap-6 scroll-mt-24" id="privacy">
          <SectionHeader title="AI Privacy Protection" badge={<PrototypeBadge />} />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-center gap-4">
              <p className="text-lg text-muted-foreground">
                Public safety shouldn't come at the cost of personal privacy. Faces and license plates in uploaded photos can be automatically detected and protected (blurred) before they are displayed on the public map.
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold">Original Image</span>
                <ArrowRight className="size-5 text-muted-foreground" />
                <span className="font-bold text-primary">Protected Preview</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative aspect-video rounded-xl bg-muted overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <img src="https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=400&q=80" alt="Original" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="relative aspect-video rounded-xl bg-muted overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <img src="https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=400&q=80" alt="Protected" className="w-full h-full object-cover" />
                    {/* Fake blur over faces */}
                    <div className="absolute top-[30%] left-[25%] h-12 w-12 rounded-full backdrop-blur-xl bg-black/10"></div>
                    <div className="absolute top-[35%] right-[30%] h-10 w-10 rounded-full backdrop-blur-xl bg-black/10"></div>
                  </div>
                  <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">2 Faces Blurred</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section H: AI for Every Phone */}
        <section className="flex flex-col gap-6 scroll-mt-24" id="every-phone">
          <SectionHeader title={lang === "bn" ? "সব ফোনের জন্য এআই" : "AI for Every Phone"} badge={<PrototypeBadge />} />
          <p className="text-lg text-muted-foreground">
            {lang === "bn"
              ? "নিরাপত্তা রিপোর্টিংয়ের জন্য স্মার্টফোনের প্রয়োজন নেই। আমাদের এআই এর সাথে টেলিযোগাযোগ গেটওয়ের মাধ্যমে সাধারণ ফিচার ফোনগুলোও ডিজিটাল নিরাপত্তা নেটওয়ার্কে যুক্ত হতে পারে।"
              : "Safety reporting shouldn't require a smartphone. By bridging telecommunication gateways with our AI intelligence, basic feature phones can participate in the digital safety network."}
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <Smartphone className="size-8 text-primary" />
              <h3 className="font-display text-xl font-bold">SMS Demo</h3>
              <div className="w-full rounded-xl bg-secondary/50 p-4 text-left font-mono text-sm">
                mirpur e road er manhole khola
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
              <div className="w-full rounded-xl border border-primary/20 bg-primary/5 p-4 text-left text-sm">
                <span className="block font-bold text-primary">AI Structured</span>
                Infrastructure • Open Manhole • High Urgency
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <Phone className="size-8 text-primary" />
              <h3 className="font-display text-xl font-bold">USSD Demo</h3>
              <div className="w-full rounded-xl bg-secondary/50 p-4 text-left font-mono text-xl font-bold">
                *123#
              </div>
              <ul className="w-full text-left text-sm text-muted-foreground">
                <li>1. Crime</li>
                <li className="font-bold text-primary">2. Infrastructure</li>
                <li>3. Accident</li>
              </ul>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
              <Mic className="size-8 text-primary" />
              <h3 className="font-display text-xl font-bold">Voice Call Demo</h3>
              <div className="w-full rounded-xl bg-secondary/50 p-4 text-center text-sm">
                "আপনার সমস্যাটি বলুন"
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
              <div className="w-full rounded-xl border border-primary/20 bg-primary/5 p-4 text-center text-sm">
                AI Speech-to-Text <br/> + Structuring
              </div>
            </div>
          </div>
        </section>

        {/* Section I & J: GP Warm Emergency Handoff & Network Location */}
        <section className="flex flex-col gap-6 scroll-mt-24" id="gp-handoff">
          <SectionHeader title={lang === "bn" ? "স্মার্ট ইমার্জেন্সি হ্যান্ডঅফ" : "Smart Emergency Handoff"} badge={<PrototypeBadge label="GP Integration Prototype" />} />
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
            <div className="flex flex-col gap-6">
              <p className="text-lg text-muted-foreground">
                {lang === "bn"
                  ? "যখন কোনো ব্যবহারকারী এসওএস ট্রিগার করেন, একটি প্রস্তাবিত জিপি নেটওয়ার্ক ইন্টিগ্রেশন 'ওয়ার্ম হ্যান্ডঅফ' করতে পারে — অর্থাৎ কল রিসিভ হওয়ার আগেই ঘটনার বিবরণ, ছবি এবং লোকেশন নিকটস্থ উদ্ধারকারীর কাছে স্বয়ংক্রিয়ভাবে পৌঁছে যাবে।"
                  : "When a user triggers an SOS, a traditional emergency call starts cold. A proposed GP network integration could execute a \"warm handoff\" — instantly transmitting incident context, visual evidence, and network-derived location to the nearest responder before they pick up the phone."}
              </p>
              
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-destructive">
                    <Siren className="size-6 animate-pulse" />
                    <h3 className="font-display text-xl font-bold uppercase tracking-widest">SOS Activated</h3>
                  </div>
                  <span className="font-mono text-sm font-bold text-destructive">00:00:14</span>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="block text-xs font-bold uppercase text-muted-foreground">Nearest Response Point</span>
                    <span className="text-base font-bold">Mirpur Police Station</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase text-muted-foreground">Incident Context</span>
                    <span className="text-base font-bold">Emergency Assistance</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-rose-500/20 pt-4">
                  <span className="block text-xs font-bold uppercase text-muted-foreground">Context Successfully Transmitted</span>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-emerald-500" /> Caller location</li>
                    <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-emerald-500" /> Incident category</li>
                    <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-emerald-500" /> Emergency contact</li>
                    <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-emerald-500" /> Existing report context</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Network className="size-6 text-primary" />
                <h3 className="font-display text-lg font-bold">Network Location</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Future GP network integration could provide approximate location triangulation when GPS or mobile data is turned off.
              </p>
              
              <div className="mt-auto flex flex-col gap-3 rounded-xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">GPS Unavailable</span>
                  <Lock className="size-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-primary">Network Fallback</span>
                    <span className="font-bold text-foreground">Est: Mirpur Area</span>
                  </div>
                  <Navigation className="size-5 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Responsible AI Principles */}
        <section className="flex flex-col gap-6 scroll-mt-24 border-t border-border pt-16">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Responsible AI Principles</h2>
            <p className="mt-2 text-muted-foreground">How we ensure the technology protects citizens rather than exposing them.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
              <Users className="mx-auto mb-3 size-6 text-primary" />
              <h4 className="font-bold">Human in the Loop</h4>
              <p className="mt-2 text-xs text-muted-foreground">AI advises. Humans decide. The AI determines priority, but authorized officials make final decisions.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
              <Eye className="mx-auto mb-3 size-6 text-primary" />
              <h4 className="font-bold">Privacy First</h4>
              <p className="mt-2 text-xs text-muted-foreground">Faces and license plates are protected before public display to respect civilian privacy.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
              <Shield className="mx-auto mb-3 size-6 text-primary" />
              <h4 className="font-bold">Data Protection</h4>
              <p className="mt-2 text-xs text-muted-foreground">External analytics use only aggregated, anonymized data for city planning and statistics.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
              <HeartHandshake className="mx-auto mb-3 size-6 text-primary" />
              <h4 className="font-bold">Language Fairness</h4>
              <p className="mt-2 text-xs text-muted-foreground">Rigorous testing across Bangla, Banglish, and mixed-language inputs to prevent dialect bias.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
