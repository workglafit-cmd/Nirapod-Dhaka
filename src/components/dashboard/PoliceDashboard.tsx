import { useState } from "react";
import {
  AlertTriangle,
  Clock,
  FileText,
  MapPin,
  Shield,
  ShieldAlert,
  Siren,
  TrendingUp,
  Settings as SettingsIcon,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { KPICard, KPIGrid } from "./KPICards";
import { ReportQueue } from "./ReportQueue";
import { DashboardMap } from "./DashboardMap";
import { ReportDetail } from "./ReportDetail";
import { AIPriorityQueue } from "./AIPriorityQueue";
import { WeeklyChart, CategoryPieChart, ResolutionRateChart, ResponseTimeChart } from "./AnalyticsCharts";
import { DashboardShell } from "./DashboardShell";
import { KPIGridSkeleton } from "./DashboardSkeletons";
import type { Report, ReportStatus } from "@/lib/reports";
import type { DashboardStats, SosAlert } from "@/hooks/use-dashboard-data";
import { timeAgo } from "@/lib/reports";
import { cn } from "@/lib/utils";

type Props = {
  reports: Report[];
  stats: DashboardStats;
  sosAlerts: SosAlert[];
  hotspots: { lat: number; lng: number; report_count: number }[];
  weeklyData: { label: string; crime: number; infrastructure: number; accident: number }[];
  onStatusChange: (id: string, status: ReportStatus, resolutionImage?: string) => void;
};

export function PoliceDashboard({
  reports,
  stats,
  sosAlerts,
  hotspots,
  weeklyData,
  onStatusChange,
}: Props) {
  const { t, lang } = useApp();
  const [section, setSection] = useState("dashboard");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const isLoading = reports.length === 0 && stats.totalReports === 0;

  const content = () => {
    switch (section) {
      case "map":
        return (
          <DashboardMap
            reports={reports}
            hotspots={hotspots}
            onSelect={setSelectedReport}
            height="h-[calc(100vh-120px)]"
            isLoading={isLoading}
          />
        );

      case "reports":
        return (
          <ReportQueue
            reports={reports}
            onSelect={setSelectedReport}
            onStatusChange={onStatusChange}
            isLoading={isLoading}
          />
        );

      case "analytics":
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <WeeklyChart data={weeklyData} />
            <CategoryPieChart stats={stats} />
            <ResolutionRateChart stats={stats} />
            <ResponseTimeChart />
          </div>
        );

      case "settings":
        return (
          <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-8 text-center text-muted-foreground shadow-sm">
            <SettingsIcon className="mb-4 size-12 text-muted-foreground/30" />
            <p className="font-display text-lg text-foreground">{t("dbSideSettings")}</p>
            <p className="mt-2 text-sm max-w-sm">Configuration options for your operational view are managed centrally.</p>
          </div>
        );

      default:
        return (
          <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-crime text-white shadow-md shadow-crime/20">
                  <ShieldAlert className="size-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl leading-tight tracking-tight">{t("policeOpsTitle")}</h2>
                  <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="relative flex size-2 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crime opacity-75"></span>
                      <span className="relative inline-flex size-1.5 rounded-full bg-crime"></span>
                    </span>
                    Live Data Feed · {new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
            </div>

            {/* Active SOS Banner */}
            {sosAlerts.length > 0 && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-crime/30 bg-gradient-to-r from-crime-tint to-crime/10 p-5 shadow-sm animate-slide-in-up">
                <div className="absolute -right-12 -top-12 size-40 rounded-full bg-crime opacity-10 blur-3xl mix-blend-multiply" />
                <div className="relative flex items-center gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-crime text-white shadow-lg shadow-crime/30">
                    <Siren className="size-7 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg text-crime-deep">
                      {t("policeActiveSos")} — {sosAlerts.length} {t("kpiSosAlerts").toLowerCase()}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {sosAlerts.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-crime/20 bg-background/50 px-3 py-1.5 text-xs font-bold text-crime-deep backdrop-blur-sm"
                        >
                          <MapPin className="size-3.5" />
                          {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                          <span className="ml-1 text-[10px] text-muted-foreground font-medium">
                            · {timeAgo(s.created_at, lang)}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Priority Section */}
            {!isLoading && <AIPriorityQueue reports={reports} onSelect={setSelectedReport} />}

            {/* KPI Cards */}
            {isLoading ? (
              <KPIGridSkeleton count={4} />
            ) : (
              <KPIGrid>
                <KPICard
                  label="Active Crime Reports"
                  value={stats.openReports}
                  icon={<FileText className="size-5" />}
                  color="primary"
                  delay={0}
                />
                <KPICard
                  label={t("kpiSosAlerts")}
                  value={stats.sosActive}
                  icon={<Siren className="size-5" />}
                  color="crime"
                  delay={100}
                />
                <KPICard
                  label={t("kpiResolvedToday")}
                  value={stats.resolvedToday}
                  icon={<Shield className="size-5" />}
                  color="resolved"
                  trend={{ value: 12, label: "vs yesterday" }}
                  delay={200}
                />
                <KPICard
                  label={t("kpiAvgResponse")}
                  value={stats.avgResponseMin}
                  icon={<Clock className="size-5" />}
                  color="pending"
                  delay={300}
                />
              </KPIGrid>
            )}

            {/* Map & Hotspots */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DashboardMap
                  reports={reports}
                  hotspots={hotspots}
                  onSelect={setSelectedReport}
                  isLoading={isLoading}
                />
              </div>

              {/* High Risk Hotspots Panel */}
              <div className="flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md animate-slide-in-up" style={{ animationDelay: "150ms" }}>
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-display text-sm">
                    <AlertTriangle className="size-4 text-crime" />
                    {t("policeHighRisk")}
                  </h3>
                  <span className="rounded-full bg-crime-tint px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-crime-deep">Live</span>
                </div>

                <div className="flex-1 space-y-3">
                  {hotspots.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                      <p className="text-xs text-muted-foreground">{t("noItems")}</p>
                    </div>
                  ) : (
                    hotspots.slice(0, 5).map((h, i) => (
                      <div
                        key={i}
                        className="group flex items-center gap-3 rounded-xl border border-crime/10 bg-gradient-to-r from-card to-crime-tint/10 px-3 py-3 transition-colors hover:border-crime/30"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-crime text-white shadow-sm">
                          <ShieldAlert className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground">
                            {h.lat.toFixed(4)}, {h.lng.toFixed(4)}
                          </p>
                          <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                            {h.report_count} incident reports in 48h
                          </p>
                        </div>
                        <span className="shrink-0 rounded bg-crime/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-crime-deep">
                          High
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Queue & Analytics */}
            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 font-display text-sm">
                  <FileText className="size-4 text-primary" />
                  {t("crimeResponseQueue")}
                </h3>
                <ReportQueue
                  reports={reports}
                  onSelect={setSelectedReport}
                  onStatusChange={onStatusChange}
                  isLoading={isLoading}
                />
              </div>

              <div>
                <h3 className="mb-4 flex items-center gap-2 font-display text-sm">
                  <TrendingUp className="size-4 text-primary" />
                  {t("dbSideAnalytics")}
                </h3>
                <div className="flex flex-col gap-6">
                  <WeeklyChart data={weeklyData} />
                  <ResolutionRateChart stats={stats} />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardShell
      activeSection={section}
      onSectionChange={setSection}
      reports={reports}
      onReportSelect={setSelectedReport}
    >
      {content()}

      <ReportDetail
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onStatusChange={onStatusChange}
      />
    </DashboardShell>
  );
}
