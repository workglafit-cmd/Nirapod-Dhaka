import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Send,
  Shield,
  UserCheck,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";

type TimelineStage = {
  key: string;
  labelKey: string;
  icon: typeof Circle;
  completed: boolean;
  active: boolean;
  time?: string;
};

const STAGES: { key: string; labelKey: string; icon: typeof Circle }[] = [
  { key: "submitted", labelKey: "tlSubmitted", icon: Send },
  { key: "verified", labelKey: "tlVerified", icon: UserCheck },
  { key: "received", labelKey: "tlReceived", icon: Shield },
  { key: "assigned", labelKey: "tlAssigned", icon: FileText },
  { key: "in_progress", labelKey: "tlInProgress", icon: Wrench },
  { key: "resolved", labelKey: "tlResolved", icon: CheckCircle2 },
];

export function statusToStageIndex(status: string): number {
  if (status === "sent") return 0;
  if (status === "received") return 2;
  if (status === "resolved") return 5;
  return 0;
}

export function ActivityTimeline({
  currentStageIndex,
  createdAt,
  compact = false,
}: {
  currentStageIndex: number;
  createdAt?: string;
  compact?: boolean;
}) {
  const { t } = useApp();

  const stages: TimelineStage[] = STAGES.map((s, i) => ({
    ...s,
    completed: i < currentStageIndex,
    active: i === currentStageIndex,
    time: i === 0 && createdAt ? new Date(createdAt).toLocaleString() : undefined,
  }));

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {stages.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1">
            <div
              className={cn(
                "flex size-6 items-center justify-center rounded-full transition-colors",
                s.completed
                  ? "bg-primary text-primary-foreground"
                  : s.active
                    ? "bg-primary-tint text-primary-deep ring-2 ring-primary/30"
                    : "bg-muted text-muted-foreground",
              )}
            >
              <s.icon className="size-3" />
            </div>
            {i < stages.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-4 rounded-full",
                  s.completed ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {stages.map((s, i) => (
        <div key={s.key} className="flex gap-3">
          {/* Vertical line + dot */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                s.completed
                  ? "border-primary bg-primary text-primary-foreground"
                  : s.active
                    ? "border-primary bg-primary-tint text-primary-deep animate-pulse-soft"
                    : "border-border bg-card text-muted-foreground",
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <s.icon className="size-4" />
            </div>
            {i < stages.length - 1 && (
              <div
                className={cn(
                  "w-0.5 flex-1 min-h-[24px]",
                  s.completed ? "bg-primary db-timeline-line" : "bg-border",
                )}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            )}
          </div>

          {/* Label */}
          <div className="pb-6 pt-1">
            <p
              className={cn(
                "text-sm font-medium",
                s.completed || s.active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {t(s.labelKey)}
            </p>
            {s.time && (
              <p className="mt-0.5 text-xs text-muted-foreground">{s.time}</p>
            )}
            {s.active && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary-tint px-2 py-0.5 text-[10px] font-semibold text-primary-deep">
                <Clock className="size-3" />
                Current
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
