import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  MapPin,
  SortAsc,
  ThumbsUp,
  Search,
  Shield,
  ShieldAlert,
  AlertTriangle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { TypeBadge, StatusPill } from "@/components/Badges";
import type { Report, ReportType, ReportStatus } from "@/lib/reports";
import { subtypeLabel, timeAgo } from "@/lib/reports";
import { useReportVotes } from "@/hooks/use-dashboard-data";
import { QueueSkeleton } from "./DashboardSkeletons";

type Props = {
  reports: Report[];
  onSelect: (r: Report) => void;
  onStatusChange?: (id: string, status: ReportStatus) => void;
  showActions?: boolean;
  isLoading?: boolean;
};

type SortMode = "priority" | "newest" | "oldest";
type FilterType = "all" | ReportType | "high-risk";
type FilterStatus = "all" | ReportStatus;

export function ReportQueue({ reports, onSelect, onStatusChange, showActions = true, isLoading = false }: Props) {
  const { t, lang } = useApp();
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...reports];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.description.toLowerCase().includes(q) ||
          r.area_name?.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.subtype?.toLowerCase().includes(q) ||
          r.ai_incident_type?.toLowerCase().includes(q)
      );
    }

    if (filterType === "high-risk") {
      result = result.filter(r => (r.ai_priority_score ?? 0) >= 80 || r.ai_severity === "critical");
    } else if (filterType !== "all") {
      result = result.filter((r) => r.type === filterType);
    }

    if (filterStatus !== "all") {
      result = result.filter((r) => r.status === filterStatus);
    }

    result.sort((a, b) => {
      if (sortMode === "priority") {
        const pa = a.ai_priority_score ?? 0;
        const pb = b.ai_priority_score ?? 0;
        if (pa !== pb) return pb - pa;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortMode === "newest" ? tb - ta : ta - tb;
    });

    return result;
  }, [reports, search, sortMode, filterType, filterStatus]);

  const reportIds = useMemo(() => filtered.slice(0, 20).map((r) => r.id), [filtered]);
  const { data: votesMap } = useReportVotes(reportIds);

  if (isLoading) {
    return <QueueSkeleton count={5} />;
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      {/* Enhanced Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/20 px-4 py-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchGlobal")}
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((f) => !f)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
            showFilters
              ? "border-primary bg-primary-tint text-primary-deep"
              : "border-border bg-card text-muted-foreground hover:bg-muted",
          )}
        >
          <Filter className="size-3.5" />
          {t("filterBy")}
        </button>

        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <option value="priority">{t("priority")} {t("sortBy")}</option>
          <option value="newest">{t("newest")}</option>
          <option value="oldest">{t("oldest")}</option>
        </select>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/10 px-4 py-3 animate-slide-in-up">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              {t("chooseType")}:
            </span>
            {(["all", "high-risk", "crime", "infrastructure", "accident"] as const).map((ft) => (
              <button
                key={ft}
                type="button"
                onClick={() => setFilterType(ft)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                  filterType === ft
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-border",
                )}
              >
                {ft === "all" ? t("all") : ft === "high-risk" ? "High Risk" : t(ft)}
              </button>
            ))}
          </div>
          
          <div className="h-4 w-px bg-border hidden sm:block" />
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              {t("status")}:
            </span>
            {(["all", "sent", "received", "resolved"] as const).map((fs) => (
              <button
                key={fs}
                type="button"
                onClick={() => setFilterStatus(fs)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                  filterStatus === fs
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-border",
                )}
              >
                {fs === "all" ? t("all") : t(fs)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report list */}
      <div className="db-scroll max-h-[600px] overflow-y-auto bg-background/50">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <CheckCircle2 className="size-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-display text-lg text-foreground">{t("clearStatusNotice")}</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">{t("noItems")}</p>
          </div>
        ) : (
          filtered.slice(0, 100).map((r, i) => {
            const votes = votesMap?.[r.id];
            const isHighPriority = (r.ai_priority_score ?? 0) >= 80 || r.ai_severity === "critical";
            
            return (
              <div
                key={r.id}
                className={cn(
                  "group flex items-center gap-4 border-b border-border/80 px-4 py-4 transition-all hover:bg-muted/50 cursor-pointer animate-fade-in",
                  isHighPriority && r.status !== "resolved" ? "bg-crime/5 hover:bg-crime/10 border-l-2 border-l-crime" : "border-l-2 border-l-transparent"
                )}
                style={{ animationDelay: `${Math.min(i, 15) * 30}ms` }}
                onClick={() => onSelect(r)}
              >
                {/* Visual Indicator (Photo or Icon) */}
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                  {r.photo_url ? (
                    <div className="flex size-full items-center justify-center bg-muted/80 text-muted-foreground group-hover:bg-muted/60 transition-colors">
                      <Eye className="size-5" />
                    </div>
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <FileText className="size-6 text-muted-foreground/60" />
                    </div>
                  )}
                  {isHighPriority && (
                    <div className="absolute -right-2 -top-2 size-6 rounded-full bg-crime/20 flex items-center justify-center blur-[2px]" />
                  )}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {r.ai_incident_type || subtypeLabel(r.subtype, lang) || r.description.slice(0, 50)}
                    </p>
                    {isHighPriority && (
                      <span className="flex items-center gap-1 rounded bg-crime/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-crime-deep">
                        <ShieldAlert className="size-3" />
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {r.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1 font-medium text-foreground/80 truncate max-w-[150px]">
                      <MapPin className="size-3.5 text-primary/80" />
                      {r.area_name ?? `${r.lat.toFixed(3)}, ${r.lng.toFixed(3)}`}
                    </span>
                    <span className="size-1 rounded-full bg-border" />
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {timeAgo(r.created_at, lang)}
                    </span>
                    
                    {votes && (
                      <>
                        <span className="size-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1 font-medium text-resolved-deep">
                          <ThumbsUp className="size-3.5" />
                          {votes.confirm} {t("upvotes")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Side: Badges & Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    {r.ai_priority_score ? (
                      <span className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold shadow-sm",
                        r.ai_priority_score >= 80 ? "bg-crime text-white" : 
                        r.ai_priority_score >= 50 ? "bg-pending text-pending-deep" : "bg-muted text-foreground"
                      )}>
                        <Shield className="size-3" />
                        {r.ai_priority_score}
                      </span>
                    ) : (
                      <TypeBadge type={r.type} />
                    )}
                    <StatusPill status={r.status} />
                  </div>

                  {showActions && (
                    <div className="flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      {r.status === "sent" && onStatusChange && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(r.id, "received");
                          }}
                          className="rounded-lg bg-primary-tint px-3 py-1.5 text-xs font-bold text-primary-deep transition-all hover:bg-primary hover:text-white shadow-sm"
                        >
                          {t("actionReceive")}
                        </button>
                      )}
                      {r.status === "received" && onStatusChange && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(r.id, "resolved");
                          }}
                          className="rounded-lg bg-resolved-tint px-3 py-1.5 text-xs font-bold text-resolved-deep transition-all hover:bg-resolved hover:text-white shadow-sm"
                        >
                          {t("actionResolve")}
                        </button>
                      )}
                      <a
                        href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
                        title={t("actionNavigate")}
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Status */}
      <div className="flex items-center justify-between border-t border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground">
        <span>{filtered.length} {t("dbSideReports").toLowerCase()}</span>
        <span>{filtered.filter(r => r.status === "sent").length} {t("needsAttention")}</span>
      </div>
    </div>
  );
}
