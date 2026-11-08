import { useState, useMemo } from "react";
import { Layers, Map as MapIcon, Siren, AlertTriangle, ShieldAlert, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { MapView } from "@/components/map/MapView";
import type { Report } from "@/lib/reports";
import { MapSkeleton } from "./DashboardSkeletons";

type DashboardMapProps = {
  reports: Report[];
  hotspots?: { lat: number; lng: number; report_count: number }[];
  onSelect?: (r: Report) => void;
  height?: string;
  isLoading?: boolean;
};

type MapFilter = "all" | "crime" | "infrastructure" | "accident" | "sos" | "ai_risk";

export function DashboardMap({
  reports,
  hotspots = [],
  onSelect,
  height = "h-[420px]",
  isLoading = false,
}: DashboardMapProps) {
  const { t } = useApp();
  const [filter, setFilter] = useState<MapFilter>("all");

  const filteredReports = useMemo(() => {
    switch (filter) {
      case "crime":
        return reports.filter((r) => r.type === "crime");
      case "infrastructure":
        return reports.filter((r) => r.type === "infrastructure");
      case "accident":
        return reports.filter((r) => r.type === "accident");
      case "sos":
        // SOS is handled by separate alerts in the real app, but for map filter we show criticals
        return reports.filter((r) => r.ai_severity === "critical");
      case "ai_risk":
        return reports.filter((r) => (r.ai_priority_score ?? 0) >= 70);
      default:
        return reports;
    }
  }, [reports, filter]);

  if (isLoading) {
    return <MapSkeleton />;
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-slide-in-up">
      {/* Map Header with Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <MapIcon className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-base text-foreground">{t("liveSafetyMap")}</h3>
            <p className="text-xs text-muted-foreground">{t("liveSafetyMapSubtext")}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filters:</span>
          
          <button
            onClick={() => setFilter("all")}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold transition-all", filter === "all" ? "bg-foreground text-background shadow-sm" : "bg-background text-muted-foreground hover:bg-muted border border-border")}
          >
            {t("all")}
          </button>
          <button
            onClick={() => setFilter("crime")}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold transition-all", filter === "crime" ? "bg-crime text-white shadow-sm" : "bg-background text-muted-foreground hover:bg-muted border border-border")}
          >
            {t("crime")}
          </button>
          <button
            onClick={() => setFilter("infrastructure")}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold transition-all", filter === "infrastructure" ? "bg-infra text-white shadow-sm" : "bg-background text-muted-foreground hover:bg-muted border border-border")}
          >
            {t("infrastructure")}
          </button>
          <button
            onClick={() => setFilter("ai_risk")}
            className={cn("group relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all overflow-hidden", filter === "ai_risk" ? "bg-primary-deep text-white shadow-sm" : "bg-background text-muted-foreground hover:bg-muted border border-border")}
          >
            <Cpu className={cn("size-3.5", filter === "ai_risk" ? "text-primary-tint" : "text-primary")} />
            AI Risk
            <span className="ml-1 rounded bg-primary/20 px-1 py-0.5 text-[8px] uppercase tracking-wider text-primary group-hover:bg-primary/30">Prototype</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className={cn("relative w-full bg-background", height)}>
        {/* Status overlay pill */}
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-border/50 bg-card/90 px-3 py-2 text-xs font-bold shadow-sm backdrop-blur-md">
          <div className="relative flex size-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-resolved opacity-75"></span>
            <span className="relative inline-flex size-1.5 rounded-full bg-resolved"></span>
          </div>
          {filteredReports.length} {t("activeReportsCount")}
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-2 rounded-xl border border-border/50 bg-card/90 p-3 text-[10px] font-semibold shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-crime shadow-[0_0_8px_rgba(239,68,68,0.6)]" /> High Severity
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-pending shadow-[0_0_8px_rgba(245,158,11,0.6)]" /> Medium Priority
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(14,165,233,0.6)]" /> Standard Report
          </div>
          <div className="mt-1 border-t border-border/50 pt-1.5 text-muted-foreground">
            Updated just now
          </div>
        </div>

        {/* The actual Leaflet Map */}
        <MapView 
          reports={filteredReports} 
          hotspots={hotspots}
          onSelect={onSelect}
          className="size-full z-0" 
        />
      </div>
    </div>
  );
}
