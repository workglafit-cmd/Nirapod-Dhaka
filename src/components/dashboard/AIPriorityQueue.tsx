import { ShieldAlert, MapPin, ExternalLink, ChevronRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { subtypeLabel, timeAgo } from "@/lib/reports";
import type { Report } from "@/lib/reports";
import { StatusPill } from "@/components/Badges";

type AIPriorityQueueProps = {
  reports: Report[];
  onSelect: (report: Report) => void;
};

export function AIPriorityQueue({ reports, onSelect }: AIPriorityQueueProps) {
  const { t, lang } = useApp();

  const priorityReports = reports
    .filter((r) => (r.ai_priority_score ?? 0) >= 80 && r.status !== "resolved")
    .sort((a, b) => (b.ai_priority_score ?? 0) - (a.ai_priority_score ?? 0))
    .slice(0, 3);

  if (priorityReports.length === 0) return null;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-crime text-white shadow-sm">
          <ShieldAlert className="size-4" />
        </div>
        <div>
          <h3 className="font-display text-base tracking-tight text-foreground">{t("aiPriorityQueue")}</h3>
          <p className="text-xs text-muted-foreground">{t("immediateAttention")}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {priorityReports.map((report, i) => (
          <button
            key={report.id}
            type="button"
            onClick={() => onSelect(report)}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-crime/10 bg-gradient-to-br from-card to-crime-tint/20 p-5 text-left shadow-sm transition-all hover:border-crime/30 hover:shadow-md animate-slide-in-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Top row */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-crime text-sm font-black text-white shadow-sm">
                  {report.ai_priority_score}
                </span>
                <div>
                  <span className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    report.ai_severity === "critical" ? "bg-crime text-white" : "bg-pending text-pending-deep"
                  )}>
                    {report.ai_severity || "High"}
                  </span>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Priority Score</p>
                </div>
              </div>
              <StatusPill status={report.status} />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <h4 className="font-display text-sm leading-tight text-foreground line-clamp-1">
                {report.ai_incident_type || subtypeLabel(report.subtype, lang) || report.description.slice(0, 50)}
              </h4>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{report.area_name || "Unknown Location"}</span>
              </p>
              
              {/* AI Reason Quote */}
              {report.ai_reason && (
                <div className="mt-2 rounded-xl bg-muted/60 p-2.5">
                  <p className="text-xs italic text-muted-foreground line-clamp-2">"{report.ai_reason}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
              <div className="flex items-center gap-1 text-[10px] font-medium text-resolved-deep">
                <CheckCircle className="size-3" />
                {t("visualEvidenceCheckComplete")}
              </div>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
