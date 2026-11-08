import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Eye,
  Fingerprint,
  FlaskConical,
  Lock,
  MessageSquare,
  Phone,
  ScanLine,
  Send,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demo/ai")({
  head: () => ({
    meta: [
      { title: "AI Demo — Nirapod Dhaka" },
      {
        name: "description",
        content:
          "Demonstration of Nirapod's intended AI capabilities: real multilingual NLP for incident understanding, plus prototype visualisations of predictive risk, integrity, privacy, SMS/USSD, and warm handoff features.",
      },
    ],
  }),
  component: DemoAiPage,
});

function DemoAiPage() {
  const { t, lang } = useApp();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 p-4 pb-20 sm:p-6">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <FlaskConical className="size-3.5" />
            {t("demoAiBadge")}
          </span>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            {t("demoAiTitle")}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            {t("demoAiSubtitle")}
          </p>
        </header>

        {/* Reality / Prototype split */}
        <section className="grid gap-4 sm:grid-cols-2">
          <RealityCard
            title={t("demoAiRealTitle")}
            description={t("demoAiRealDesc")}
            items={[
              { icon: <Sparkles className="size-4" />, label: t("demoAiRealNlp") },
              { icon: <Activity className="size-4" />, label: t("demoAiRealPriority") },
              { icon: <Shield className="size-4" />, label: t("demoAiRealAuthority") },
              { icon: <MessageSquare className="size-4" />, label: t("demoAiRealVoice") },
            ]}
            tone="emerald"
          />
          <RealityCard
            title={t("demoAiPrototypeTitle")}
            description={t("demoAiPrototypeDesc")}
            items={[
              { icon: <ScanLine className="size-4" />, label: t("demoAiPrototypeVisual") },
              { icon: <AlertTriangle className="size-4" />, label: t("demoAiPrototypePredict") },
              { icon: <Fingerprint className="size-4" />, label: t("demoAiPrototypeIntegrity") },
              { icon: <Lock className="size-4" />, label: t("demoAiPrototypePrivacy") },
              { icon: <Phone className="size-4" />, label: t("demoAiPrototypeSms") },
              { icon: <Send className="size-4" />, label: t("demoAiPrototypeUssd") },
              { icon: <Users className="size-4" />, label: t("demoAiPrototypeGphandoff") },
            ]}
            tone="amber"
          />
        </section>

        {/* Live report walkthrough */}
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-bold">{t("demoAiLiveTitle")}</h2>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("demoAiRealBadge")}
            </span>
          </div>
          <LiveReportFlow />
        </section>

        {/* Prototype tiles */}
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-bold">{t("demoAiPrototypeSection")}</h2>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              {t("demoAiPrototypeBadge")}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <VisualVerificationTile lang={lang} />
            <PredictiveRiskTile lang={lang} />
            <IntegrityTile lang={lang} />
            <PrivacyTile lang={lang} />
            <SmsTile lang={lang} />
            <UssdTile lang={lang} />
            <GpHandoffTile lang={lang} />
          </div>
        </section>

        <footer className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <p>{t("demoAiFootnote")}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
          >
            {t("demoAiBackHome")} <ArrowRight className="size-3" />
          </Link>
        </footer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reality vs prototype summary cards
// ─────────────────────────────────────────────────────────────────────────────

function RealityCard({
  title,
  description,
  items,
  tone,
}: {
  title: string;
  description: string;
  items: { icon: React.ReactNode; label: string }[];
  tone: "emerald" | "amber";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-5 shadow-sm",
        tone === "emerald"
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-amber-500/30 bg-amber-500/5"
      )}
    >
      <div className="flex items-center gap-2">
        {tone === "emerald" ? (
          <CheckCircle2 className="size-5 text-emerald-600" />
        ) : (
          <FlaskConical className="size-5 text-amber-700" />
        )}
        <h3 className="font-display text-base font-bold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <ul className="flex flex-col gap-1.5 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2 text-foreground/80">
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full",
                tone === "emerald"
                  ? "bg-emerald-500/15 text-emerald-700"
                  : "bg-amber-500/15 text-amber-700"
              )}
            >
              {it.icon}
            </span>
            {it.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Live flow — the actual report composer behavior
// ─────────────────────────────────────────────────────────────────────────────

function LiveReportFlow() {
  const { t } = useApp();
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm">
      <p className="text-sm text-foreground/90">
        {t("demoAiLivePrompt")}
      </p>
      <div className="rounded-xl border border-border bg-card p-3 font-mono text-xs text-foreground/80">
        "ei rastay ekta open manhole ase, rate dekha jay na, manush pore jete pare"
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Result label={t("category")} value="Infrastructure" />
        <Result label={t("incident_type")} value="Open Manhole" />
        <Result label={t("severity")} value="High" />
        <Result label={t("urgency")} value="High" />
        <Result label={t("relevant_authority")} value="City Corporation" />
        <Result label={t("priority_score")} value="70" />
        <Result label={t("model_confidence")} value="50%" />
        <Result label={t("language")} value="Banglish" />
      </div>
      <p className="text-[11px] text-muted-foreground">
        {t("demoAiLiveNote")}
      </p>
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="mt-1 block text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Prototype tiles (deterministic demo data)
// ─────────────────────────────────────────────────────────────────────────────

function TileShell({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-bold">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
          <FlaskConical className="size-3" /> {badge}
        </span>
      </div>
      {children}
    </div>
  );
}

function VisualVerificationTile({ lang }: { lang: string }) {
  const { t } = useApp();
  const lbl = lang === "bn";
  const scenarios: { key: "acceptable" | "mismatch" | "uncertain"; title: string; desc: string; tone: string }[] = [
    {
      key: "acceptable",
      title: lbl ? "গ্রহণযোগ্য" : "Acceptable",
      desc: lbl ? "প্রমাণ রিপোর্টের সাথে সামঞ্জস্যপূর্ণ" : "Evidence appears consistent",
      tone: "emerald",
    },
    {
      key: "mismatch",
      title: lbl ? "অমিল" : "Mismatch",
      desc: lbl ? "প্রমাণ রিপোর্টের সাথে সামঞ্জস্যপূর্ণ নয়" : "Evidence does not appear consistent",
      tone: "amber",
    },
    {
      key: "uncertain",
      title: lbl ? "অনিশ্চিত" : "Uncertain",
      desc: lbl ? "প্রমাণ যাচাই করা যাচ্ছে না" : "Unable to verify",
      tone: "slate",
    },
  ];
  return (
    <TileShell
      title={t("tileVisualTitle")}
      subtitle={t("tileVisualSubtitle")}
      badge={t("prototypeBadge")}
    >
      <div className="flex flex-col gap-2">
        {scenarios.map((s) => (
          <div
            key={s.key}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3",
              s.tone === "emerald" && "border-emerald-500/30 bg-emerald-500/5",
              s.tone === "amber" && "border-amber-500/30 bg-amber-500/5",
              s.tone === "slate" && "border-border bg-secondary/40"
            )}
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-full",
                s.tone === "emerald" && "bg-emerald-500/15 text-emerald-700",
                s.tone === "amber" && "bg-amber-500/15 text-amber-700",
                s.tone === "slate" && "bg-secondary text-muted-foreground"
              )}
            >
              {s.key === "acceptable" ? (
                <CheckCircle2 className="size-4" />
              ) : s.key === "mismatch" ? (
                <AlertTriangle className="size-4" />
              ) : (
                <ScanLine className="size-4" />
              )}
            </span>
            <div>
              <span className="block text-sm font-bold">{s.title}</span>
              <span className="block text-[11px] text-muted-foreground">{s.desc}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] italic text-muted-foreground">
        {t("tileVisualNote")}
      </p>
    </TileShell>
  );
}

function PredictiveRiskTile({ lang: _lang }: { lang: string }) {
  const { t } = useApp();
  return (
    <TileShell
      title={t("tilePredictTitle")}
      subtitle={t("tilePredictSubtitle")}
      badge={t("prototypeBadge")}
    >
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-secondary/30 p-3">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-sm font-bold">Mirpur Road</span>
          <span className="rounded-md bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground">
            High
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">8 PM – 11 PM</span>
        <ul className="mt-1 flex flex-col gap-1 text-[11px] text-foreground/80">
          <li>• {t("tilePredictSignal1")}</li>
          <li>• {t("tilePredictSignal2")}</li>
          <li>• {t("tilePredictSignal3")}</li>
        </ul>
      </div>
      <p className="text-[11px] italic text-muted-foreground">
        {t("tilePredictNote")}
      </p>
    </TileShell>
  );
}

function IntegrityTile({ lang: _lang }: { lang: string }) {
  const { t } = useApp();
  return (
    <TileShell
      title={t("tileIntegrityTitle")}
      subtitle={t("tileIntegritySubtitle")}
      badge={t("prototypeBadge")}
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          {t("tileIntegrityBadge")}
        </span>
        <div className="mt-2 flex flex-col gap-1 text-xs text-foreground/90">
          <span>• {t("tileIntegrityLine1")}</span>
          <span>• {t("tileIntegrityLine2")}</span>
          <span>• {t("tileIntegrityLine3")}</span>
        </div>
      </div>
      <p className="text-[11px] italic text-muted-foreground">
        {t("tileIntegrityNote")}
      </p>
    </TileShell>
  );
}

function PrivacyTile({ lang: _lang }: { lang: string }) {
  const { t } = useApp();
  return (
    <TileShell
      title={t("tilePrivacyTitle")}
      subtitle={t("tilePrivacySubtitle")}
      badge={t("prototypeBadge")}
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <div className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
          <Eye className="size-6" />
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <span className="font-semibold">{t("tilePrivacyDetected1")}</span>
          <span className="font-semibold">{t("tilePrivacyDetected2")}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary"
        >
          {t("tilePrivacyOriginal")}
        </button>
        <button
          type="button"
          className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
        >
          {t("tilePrivacyProtected")}
        </button>
      </div>
      <p className="text-[11px] italic text-muted-foreground">
        {t("tilePrivacyNote")}
      </p>
    </TileShell>
  );
}

function SmsTile({ lang }: { lang: string }) {
  const { t } = useApp();
  const lbl = lang === "bn";
  return (
    <TileShell
      title={t("tileSmsTitle")}
      subtitle={t("tileSmsSubtitle")}
      badge={t("prototypeBadge")}
    >
      <div className="flex flex-col gap-2">
        <div className="rounded-xl border border-border bg-secondary/40 p-3 text-xs">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {lbl ? "এসএমএস" : "SMS"}
          </span>
          <p className="mt-1 font-mono">mirpur e road er manhole khola</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            {lbl ? "এআই বুঝেছে" : "AI understood"}
          </span>
          <ul className="mt-1 flex flex-col gap-0.5 text-foreground/90">
            <li>• {lbl ? "অবকাঠামো" : "Infrastructure"}</li>
            <li>• {lbl ? "খোলা ম্যানহোল" : "Open Manhole"}</li>
            <li>• {lbl ? "উচ্চ জরুরী" : "High urgency"}</li>
          </ul>
        </div>
      </div>
      <p className="text-[11px] italic text-muted-foreground">{t("tileSmsNote")}</p>
    </TileShell>
  );
}

function UssdTile({ lang }: { lang: string }) {
  const { t } = useApp();
  const lbl = lang === "bn";
  return (
    <TileShell
      title={t("tileUssdTitle")}
      subtitle={t("tileUssdSubtitle")}
      badge={t("prototypeBadge")}
    >
      <div className="rounded-xl border border-border bg-card p-3 text-xs">
        <span className="font-mono text-base font-bold">*123#</span>
        <ul className="mt-2 flex flex-col gap-1 text-foreground/90">
          <li>1. {lbl ? "অপরাধ" : "Crime"}</li>
          <li>2. {lbl ? "অবকাঠামো" : "Infrastructure"}</li>
          <li>3. {lbl ? "দুর্ঘটনা" : "Accident"}</li>
        </ul>
      </div>
      <p className="text-[11px] italic text-muted-foreground">{t("tileUssdNote")}</p>
    </TileShell>
  );
}

function GpHandoffTile({ lang: _lang }: { lang: string }) {
  const { t } = useApp();
  return (
    <TileShell
      title={t("tileGpTitle")}
      subtitle={t("tileGpSubtitle")}
      badge={t("prototypeBadge")}
    >
      <div className="flex flex-col gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
        <span className="inline-flex w-fit items-center gap-1 rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          SOS
        </span>
        <span className="text-xs font-semibold text-foreground">Mirpur, Dhaka</span>
        <span className="text-[11px] text-muted-foreground">
          {t("tileGpStation")}
        </span>
        <ul className="mt-1 flex flex-col gap-0.5 text-[11px] text-foreground/90">
          <li>✓ {t("tileGpItem1")}</li>
          <li>✓ {t("tileGpItem2")}</li>
          <li>✓ {t("tileGpItem3")}</li>
          <li>✓ {t("tileGpItem4")}</li>
        </ul>
      </div>
      <p className="text-[11px] italic text-muted-foreground">{t("tileGpNote")}</p>
    </TileShell>
  );
}
