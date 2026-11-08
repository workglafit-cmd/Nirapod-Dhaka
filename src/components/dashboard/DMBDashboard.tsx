import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  Clock,
  CloudRain,
  FileText,
  Flame,
  MapPin,
  Shield,
  Zap,
  TrendingUp
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
import type { DashboardStats } from "@/hooks/use-dashboard-data";
import { subtypeLabel, timeAgo } from "@/lib/reports";
import { cn } from "@/lib/utils";

type Props = {
  reports: Report[];
  stats: DashboardStats;
  hotspots: { lat: number; lng: number; report_count: number }[];
  weeklyData: { label: string; crime: number; infrastructure: number; accident: number }[];
  onStatusChange: (id: string, status: ReportStatus, resolutionImage?: string) => void;
};

export function DMBDashboard({
  reports,
  stats,
  hotspots,
  weeklyData,
  onStatusChange,
}: Props) {
  const { t, lang } = useApp();
  const [section, setSection] = useState("dashboard");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const isLoading = reports.length === 0 && stats.totalReports === 0;

  // Categorize disaster reports
  const floods = reports.filter((r) => r.subtype === "waterlogging");
  const fires = reports.filter((r) => r.subtype === "fire");
  const collapses = reports.filter((r) => r.subtype === "building");
  const emergencies = reports.filter((r) => r.status === "sent" && (r.ai_severity === "critical" || r.ai_priority_score! >= 80));

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

      default:
        return (
          <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-infra text-white shadow-md shadow-infra/20">
                  <AlertTriangle className="size-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl leading-tight tracking-tight">{t("dmbOpsTitle")}</h2>
                  <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="relative flex size-2 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-infra opacity-75"></span>
                      <span className="relative inline-flex size-1.5 rounded-full bg-infra"></span>
                    </span>
                    Live Data Feed · {new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Banner */}
            {emergencies.length > 0 && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-infra/30 bg-gradient-to-r from-infra-tint to-infra/10 p-5 shadow-sm animate-slide-in-up">
                <div className="absolute -right-12 -top-12 size-40 rounded-full bg-infra opacity-10 blur-3xl mix-blend-multiply" />
                <div className="relative flex items-center gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-infra text-white shadow-lg shadow-infra/30">
                    <Zap className="size-7 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-infra-deep">
                      {emergencies.length} Critical {t("dmbEmergencyReq").toLowerCase()}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-infra-deep/80">
                      Unacknowledged disaster or high-priority infrastructure emergencies require immediate attention.
                    </p>
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
                  label={t("dmbFloodReports")}
                  value={floods.length}
                  icon={<CloudRain className="size-5" />}
                  color="primary"
                  delay={0}
                />
                <KPICard
                  label={t("dmbFireReports")}
                  value={fires.length}
                  icon={<Flame className="size-5" />}
                  color="crime"
                  delay={100}
                />
                <KPICard
                  label={t("dmbCollapseReports")}
                  value={collapses.length}
                  icon={<Building2 className="size-5" />}
                  color="pending"
                  delay={200}
                />
                <KPICard
                  label={t("kpiResolvedToday")}
                  value={stats.resolvedToday}
                  icon={<Shield className="size-5" />}
                  color="resolved"
                  trend={{ value: 8, label: "vs yesterday" }}
                  delay={300}
                />
              </KPIGrid>
            )}

            {/* Map & Hazard Zones */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DashboardMap
                  reports={reports}
                  hotspots={hotspots}
                  onSelect={setSelectedReport}
                  isLoading={isLoading}
                />
              </div>

              <div className="flex flex-col gap-6">
                {/* Disaster Breakdown */}
                <div className="flex-1 rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md animate-slide-in-up" style={{ animationDelay: "150ms" }}>
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-display text-sm">
                      <AlertTriangle className="size-4 text-infra" />
                      {t("dmbHazardZones")}
                    </h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active</span>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { icon: CloudRain, label: t("dmbFloodReports"), count: floods.length, color: "text-primary bg-primary-tint border-primary/20" },
                      { icon: Flame, label: t("dmbFireReports"), count: fires.length, color: "text-crime bg-crime-tint border-crime/20" },
                      { icon: Building2, label: t("dmbCollapseReports"), count: collapses.length, color: "text-infra bg-infra-tint border-infra/20" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="group flex items-center gap-3 rounded-xl border border-border/50 bg-background px-3 py-2.5 transition-colors hover:bg-muted"
                      >
                        <div
                          className={cn(
                            "flex size-9 items-center justify-center rounded-lg border",
                            item.color,
                          )}
                        >
                          <item.icon className="size-4" />
                        </div>
                        <span className="flex-1 text-xs font-semibold text-foreground/90 group-hover:text-foreground">{item.label}</span>
                        <span className="font-display text-sm font-bold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Emergency Requests */}
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md animate-slide-in-up" style={{ animationDelay: "250ms" }}>
                  <h3 className="mb-5 flex items-center gap-2 font-display text-sm">
                    <Zap className="size-4 text-infra" />
                    {t("dmbEmergencyReq")}
                  </h3>
                  <div className="db-scroll flex max-h-48 flex-col gap-2 overflow-y-auto">
                    {reports.filter(r => r.status === "sent").length === 0 ? (
                      <div className="flex h-24 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                        <p className="text-xs text-muted-foreground">{t("noItems")}</p>
                      </div>
                    ) : (
                      reports.filter(r => r.status === "sent").slice(0, 5).map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedReport(r)}
                          className="group flex w-full items-start gap-3 rounded-xl border border-border/50 bg-background px-3 py-3 text-left transition-colors hover:border-primary/30 hover:bg-muted"
                        >
                          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary-tint group-hover:text-primary-deep">
                            <MapPin className="size-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-bold text-foreground group-hover:text-primary">
                              {r.description.slice(0, 40) || subtypeLabel(r.subtype, lang)}
                            </p>
                            <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                              {r.area_name ?? ""} · {timeAgo(r.created_at, lang)}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Queue & Analytics */}
            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 font-display text-sm">
                  <FileText className="size-4 text-primary" />
                  {t("dmbResponseQueue")}
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
