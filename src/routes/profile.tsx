import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, LogOut, Settings2, Camera, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BrandMark, LangToggle } from "@/components/Chrome";
import { StatusTracker, TypeBadge } from "@/components/Badges";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth";
import { subtypeLabel, timeAgo, photoUrl, type Report } from "@/lib/reports";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My reports & profile — Nirapod Dhaka" },
      {
        name: "description",
        content:
          "Track your submitted hazard reports from Sent to Received to Resolved, and manage your emergency contact.",
      },
      { property: "og:title", content: "My reports & profile — Nirapod Dhaka" },
      {
        property: "og:description",
        content: "Track your hazard reports and manage your emergency contact.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, lang, textScale, setTextScale, highContrast, setHighContrast } = useApp();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }, [loading, user, navigate]);

  const { data: mine = [] } = useQuery({
    queryKey: ["my-reports", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .eq("reporter_id", user!.id)
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as Report[];
    },
  });

  async function saveContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: String(fd.get("full_name") ?? "").slice(0, 100),
        emergency_contact_name: String(fd.get("ecn") ?? "").slice(0, 100),
        emergency_contact_phone: String(fd.get("ecp") ?? "").slice(0, 20),
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      await refreshProfile();
      toast.success(t("saved"));
    }
  }

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <BrandMark compact />
          <LangToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        <Link
          to="/map"
          className="tap-target inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("map")}
        </Link>

        <h1 className="font-display mt-3 text-2xl">{t("profile")}</h1>

        <form
          onSubmit={saveContact}
          className="mt-4 space-y-3 rounded-xl border border-border bg-card p-4 shadow-card"
        >
          <Row name="full_name" label={t("fullName")} defaultValue={profile?.full_name ?? ""} />
          <Row
            name="ecn"
            label={t("emergencyContactName")}
            defaultValue={profile?.emergency_contact_name ?? ""}
          />
          <Row
            name="ecp"
            label={t("emergencyContactPhone")}
            type="tel"
            defaultValue={profile?.emergency_contact_phone ?? ""}
          />
          <button
            type="submit"
            disabled={busy}
            className="tap-target w-full rounded-xl bg-primary px-5 py-3 text-base font-semibold text-primary-foreground disabled:opacity-60"
          >
            {t("save")}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{t("myReports")}</h2>
        </div>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {[
            { id: "all", label: t("all") },
            { id: "inProgress", label: t("inProgress") },
            { id: "resolved", label: t("resolved") },
            { id: "rejected", label: t("rejected") },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab.id === "all" ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border text-foreground hover:bg-secondary"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ul className="mt-4 flex flex-col gap-3">
          {mine.length === 0 && (
            <li className="text-sm text-muted-foreground bg-card p-6 rounded-2xl border border-border text-center">
              {t("noReports")}
            </li>
          )}
          {mine.map((r) => (
            <ReportCard key={r.id} report={r} lang={lang} />
          ))}
        </ul>

        <h2 className="font-display mt-8 flex items-center gap-2 text-lg">
          <Settings2 className="size-5" aria-hidden />
          {t("settings")}
        </h2>
        <div className="mt-3 space-y-4 rounded-xl border border-border bg-card p-4">
          <div>
            <p className="text-sm font-semibold">{t("textSize")}</p>
            <div className="mt-2 flex gap-2">
              {(["base", "lg", "xl"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTextScale(s)}
                  aria-pressed={textScale === s}
                  className={`tap-target flex-1 rounded-lg border-2 px-3 py-2 text-sm font-semibold ${
                    textScale === s
                      ? "border-primary bg-primary-tint text-primary-deep"
                      : "border-border"
                  }`}
                >
                  {t(s === "base" ? "normal" : s === "lg" ? "large" : "xlarge")}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            aria-pressed={highContrast}
            className={`tap-target w-full rounded-lg border-2 px-3 py-2.5 text-sm font-semibold ${
              highContrast ? "border-primary bg-primary-tint text-primary-deep" : "border-border"
            }`}
          >
            {t("highContrast")}
          </button>
        </div>

        <button
          type="button"
          onClick={async () => {
            await signOut();
            void navigate({ to: "/", replace: true });
          }}
          className="tap-target mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-border px-5 py-3 text-sm font-semibold"
        >
          <LogOut className="size-4" aria-hidden />
          {t("logout")}
        </button>
      </main>
    </div>
  );
}

function Row({
  name,
  label,
  type = "text",
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="tap-target w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base shadow-sm focus:border-primary outline-none"
      />
    </div>
  );
}

function ReportCard({ report, lang }: { report: Report; lang: "en" | "bn" }) {
  const { t } = useApp();
  const [img, setImg] = useState<string | null>(null);

  useEffect(() => {
    void photoUrl(report.photo_url).then(setImg);
  }, [report.photo_url]);

  return (
    <li className="flex gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
      <div className="size-24 shrink-0 rounded-xl bg-secondary overflow-hidden flex flex-col items-center justify-center border border-border relative">
        {img ? (
          <img
            src={img}
            alt="Thumbnail"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <Camera className="size-6 text-muted-foreground opacity-30" />
        )}
        <div className="absolute top-1 left-1">
          <TypeBadge type={report.type} />
        </div>
      </div>
      <div className="flex flex-col flex-1 py-0.5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-base truncate">
            {subtypeLabel(report.subtype, lang)}
          </h3>
          <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
            {timeAgo(report.created_at, lang)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{report.area_name ?? t("dhaka")}</span>
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div
              className={`size-2 rounded-full ${report.status === "resolved" ? "bg-resolved" : "bg-infra"}`}
            />
            <span
              className={`text-xs font-bold ${report.status === "resolved" ? "text-resolved" : "text-infra"}`}
            >
              {report.status === "resolved" ? t("resolved") : t("inProgress")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {report.ai_confidence ? (
              <>
                <span className="text-xs font-bold text-resolved-deep">{Math.round(report.ai_confidence * 100)}%</span>
                <span className="text-[10px] text-muted-foreground">{t("verified")}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}
