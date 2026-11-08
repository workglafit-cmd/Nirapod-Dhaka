import { ShieldAlert, TriangleAlert, CarFront, CheckCircle2, Clock, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import type { ReportStatus, ReportType } from "@/lib/reports";

export const typeIcon: Record<ReportType, typeof ShieldAlert> = {
  crime: ShieldAlert,
  infrastructure: TriangleAlert,
  accident: CarFront,
};

export const typeToken: Record<ReportType, string> = {
  crime: "crime",
  infrastructure: "infra",
  accident: "accident",
};

export function TypeBadge({ type, className }: { type: ReportType; className?: string }) {
  const { t } = useApp();
  const Icon = typeIcon[type];
  const tone = typeToken[type];
  const label = t(
    type === "crime" ? "crime" : type === "infrastructure" ? "infrastructure" : "accident",
  );
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "crime" && "bg-crime-tint text-crime-deep",
        tone === "infra" && "bg-infra-tint text-infra-deep",
        tone === "accident" && "bg-accident-tint text-accident-deep",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

const statusIcon: Record<ReportStatus, typeof Send> = {
  sent: Send,
  received: Clock,
  resolved: CheckCircle2,
};

export function StatusPill({ status, className }: { status: ReportStatus; className?: string }) {
  const { t } = useApp();
  const Icon = statusIcon[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "sent" && "bg-primary-tint text-primary-deep",
        status === "received" && "bg-pending-tint text-pending-deep",
        status === "resolved" && "bg-resolved-tint text-resolved-deep",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {t(status)}
    </span>
  );
}

export function StatusTracker({ status }: { status: ReportStatus }) {
  const { t } = useApp();
  const steps: ReportStatus[] = ["sent", "received", "resolved"];
  const activeIndex = steps.indexOf(status);
  return (
    <ol className="flex items-center gap-1.5" aria-label={t("status")}>
      {steps.map((s, i) => {
        const done = i <= activeIndex;
        const Icon = statusIcon[s];
        return (
          <li key={s} className="flex flex-1 items-center gap-1.5">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                done
                  ? s === "resolved"
                    ? "border-resolved bg-resolved-tint text-resolved-deep"
                    : "border-primary bg-primary-tint text-primary-deep"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </span>
            <span
              className={cn(
                "text-[11px] font-medium",
                done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {t(s)}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "h-0.5 flex-1 rounded-full",
                  i < activeIndex ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
