import { useState, useMemo } from "react";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Droplets,
  FileText,
  Lamp,
  Shield,
  Trash2,
  TrendingUp,
  Construction,
  Cpu
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { UrbanPlanningStudio } from "@/components/planning/UrbanPlanningStudio";
import { KPICard, KPIGrid } from "./KPICards";
import { ReportQueue } from "./ReportQueue";
import { DashboardMap } from "./DashboardMap";
import { ReportDetail } from "./ReportDetail";
import { AIPriorityQueue } from "./AIPriorityQueue";
import {
  WeeklyChart,
  CategoryPieChart,
  ResolutionRateChart,
  ResponseTimeChart,
} from "./AnalyticsCharts";
import { DashboardShell } from "./DashboardShell";
import { KPIGridSkeleton, QueueSkeleton, MapSkeleton } from "./DashboardSkeletons";
import type { Report, ReportStatus } from "@/lib/reports";
import type { DashboardStats, SosAlert } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";

type Props = {
  reports: Report[];
  allReports: Report[];
  stats: DashboardStats;
  sosAlerts: SosAlert[];
  hotspots: { lat: number; lng: number; report_count: number }[];
  weeklyData: { label: string; crime: number; infrastructure: number; accident: number }[];
  onStatusChange: (id: string, status: ReportStatus, resolutionImage?: string) => void;
};

type InfraCategory = {
  icon: typeof Construction;
  labelKey: string;
  subtypes: string[];
  color: string;
};

const INFRA_CATEGORIES: InfraCategory[] = [
  { icon: Construction, labelKey: "ccRoadDamage", subtypes: ["road"], color: "text-infra bg-infra-tint border-infra/20" },
  { icon: Droplets, labelKey: "ccDrainage", subtypes: ["drain", "waterlogging"], color: "text-primary bg-primary-tint border-primary/20" },
  { icon: AlertTriangle, labelKey: "openManhole", subtypes: ["manhole"], color: "text-crime bg-crime-tint border-crime/20" },
  { icon: Lamp, labelKey: "ccStreetLights", subtypes: ["streetlight"], color: "text-pending bg-pending-tint border-pending/20" },
];

export function CityCorpDashboard({
  reports,
  allReports,
  stats,
  sosAlerts,
  hotspots,
  weeklyData,
  onStatusChange,
}: Props) {
  const { t, lang } = useApp();
  const [section, setSection] = useState("dashboard");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Fallback loading check
  const isLoading = allReports.length === 0 && stats.totalReports === 0;

  // Infrastructure breakdown
  const infraCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of INFRA_CATEGORIES) {
      map[cat.labelKey] = allReports.filter(
        (r) => r.subtype && cat.subtypes.includes(r.subtype),
      ).length;
    }
    return map;
  }, [allReports]);

  // Department performance workload
  const deptPerf = useMemo(() => {
    const crime = allReports.filter((r) => r.type === "crime");
    const infra = allReports.filter((r) => r.type === "infrastructure");
    const accident = allReports.filter((r) => r.type === "accident");
    return [
      {
        name: t("police"),
        total: crime.filter((r) => r.status !== "resolved").length,
        resolved: crime.filter((r) => r.status === "resolved").length,
        color: "bg-crime",
        bg: "bg-crime-tint"
      },
      {
        name: t("roleDmb"),
        total: accident.filter((r) => r.status !== "resolved").length,
        resolved: accident.filter((r) => r.status === "resolved").length,
        color: "bg-infra",
        bg: "bg-infra-tint"
      },
      {
        name: t("roleCityCorp"),
        total: infra.filter((r) => r.status !== "resolved").length,
        resolved: infra.filter((r) => r.status === "resolved").length,
        color: "bg-primary",
        bg: "bg-primary-tint"
      },
    ];
  }, [allReports, t]);

  const content = () => {
    switch (section) {
      case "map":
        return (
          <DashboardMap
            reports={allReports}
            hotspots={hotspots}
            onSelect={setSelectedReport}
            height="h-[calc(100vh-120px)]"
            isLoading={isLoading}
          />
        );

      case "reports":
        return (
          <ReportQueue
            reports={allReports}
            onSelect={setSelectedReport}
            onStatusChange={onStatusChange}
            isLoading={isLoading}
          />
        );

      case "planning":
        return <UrbanPlanningStudio />;

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
            {/* Header Area */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                  <Shield className="size-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl leading-tight tracking-tight">{t("cityCorpOpsTitle")}</h2>
                  <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="relative flex size-2 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-resolved opacity-75"></span>
                      <span className="relative inline-flex size-1.5 rounded-full bg-resolved"></span>
                    </span>
                    Live Data Feed · {new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
            </div>

            {/* Smart Nation Planning Studio Banner */}
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-emerald-500/10 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-700 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    Smart Nation Suite
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Evidence-Based Policy Outcomes
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Urban Planning & Infrastructure Policy Studio
                </h3>
                <p className="text-xs text-muted-foreground max-w-xl">
                  Simulate capital interventions across Dhaka wards, model 5-year societal ROI, and generate official cabinet policy briefs powered by multi-source data fusion.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSection("planning")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                Launch Policy Studio ➔
              </button>
            </div>

            {/* AI Priority Section */}
            {!isLoading && <AIPriorityQueue reports={allReports} onSelect={setSelectedReport} />}

            {/* KPI Cards */}
            {isLoading ? (
              <KPIGridSkeleton count={4} />
            ) : (
              <KPIGrid>
                <KPICard
                  label={t("kpiTotalReports")}
                  value={stats.totalReports}
                  icon={<FileText className="size-5" />}
                  color="primary"
                  delay={0}
                />
                <KPICard
                  label={t("kpiOpenReports")}
                  value={stats.openReports}
                  icon={<Clock className="size-5" />}
                  color="pending"
                  delay={100}
                />
                <KPICard
                  label={t("kpiResolvedToday")}
                  value={stats.resolvedToday}
                  icon={<CheckCircle2 className="size-5" />}
                  color="resolved"
                  trend={{ value: 15, label: "vs yesterday" }}
                  delay={200}
                />
                <KPICard
                  label={t("kpiHighPriority")}
                  value={stats.highPriority}
                  icon={<AlertTriangle className="size-5" />}
                  color="crime"
                  delay={300}
                />
              </KPIGrid>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DashboardMap
                  reports={allReports}
                  hotspots={hotspots}
                  onSelect={setSelectedReport}
                  isLoading={isLoading}
                />
              </div>

              <div className="flex flex-col gap-6">
                {/* Infrastructure Status */}
                <div className="flex-1 rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md animate-slide-in-up" style={{ animationDelay: "150ms" }}>
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-display text-sm">
                      <Building2 className="size-4 text-infra" />
                      {t("ccInfraIssues")}
                    </h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active</span>
                  </div>
                  
                  <div className="space-y-3">
                    {INFRA_CATEGORIES.map((cat) => {
                      const count = infraCounts[cat.labelKey] ?? 0;
                      return (
                        <div
                          key={cat.labelKey}
                          className="group flex items-center gap-3 rounded-xl border border-border/50 bg-background px-3 py-2.5 transition-colors hover:bg-muted"
                        >
                          <div
                            className={cn(
                              "flex size-9 items-center justify-center rounded-lg border",
                              cat.color,
                            )}
                          >
                            <cat.icon className="size-4" />
                          </div>
                          <span className="flex-1 text-xs font-semibold text-foreground/90 group-hover:text-foreground">{t(cat.labelKey)}</span>
                          <span className="font-display text-sm font-bold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Department Workload */}
                <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md animate-slide-in-up" style={{ animationDelay: "250ms" }}>
                  <h3 className="mb-5 flex items-center gap-2 font-display text-sm">
                    <BarChart3 className="size-4 text-primary" />
                    {t("authorityWorkload")}
                  </h3>
                  <div className="space-y-4">
                    {deptPerf.map((dept) => {
                      const totalWork = dept.total + dept.resolved;
                      const rate = totalWork > 0 ? Math.round((dept.resolved / totalWork) * 100) : 0;
                      
                      return (
                        <div key={dept.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-foreground/90">{dept.name}</span>
                            <span className="text-muted-foreground font-mono text-[10px]">
                              <span className="text-foreground">{dept.total}</span> active
                            </span>
                          </div>
                          <div className={cn("h-2.5 w-full overflow-hidden rounded-full", dept.bg)}>
                            <div
                              className={cn("h-full transition-all duration-1000 ease-out", dept.color)}
                              style={{ width: `${Math.max(rate, 5)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Queue & Analytics */}
            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 font-display text-sm">
                  <FileText className="size-4 text-primary" />
                  {t("allStreams")}
                </h3>
                <ReportQueue
                  reports={allReports}
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
      reports={allReports}
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
