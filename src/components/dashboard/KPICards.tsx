import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type KPICardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  color?: "primary" | "crime" | "infra" | "resolved" | "pending" | "sos";
  trend?: { value: number; label: string };
  delay?: number;
};

const colorMap = {
  primary: { bg: "bg-primary-tint", text: "text-primary-deep", icon: "text-primary" },
  crime: { bg: "bg-crime-tint", text: "text-crime-deep", icon: "text-crime" },
  infra: { bg: "bg-infra-tint", text: "text-infra-deep", icon: "text-infra" },
  resolved: { bg: "bg-resolved-tint", text: "text-resolved-deep", icon: "text-resolved" },
  pending: { bg: "bg-pending-tint", text: "text-pending-deep", icon: "text-pending" },
  sos: { bg: "bg-crime-tint", text: "text-crime-deep", icon: "text-crime" },
};

function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    if (diff === 0) return;

    const startTime = performance.now();
    let raf: number;

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        ref.current = value;
      }
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

export function KPICard({ label, value, icon, color = "primary", trend, delay = 0 }: KPICardProps) {
  const c = colorMap[color];

  return (
    <div
      className={cn(
        "db-kpi group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card",
        "animate-slide-in-up",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Decorative gradient blob */}
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-[0.08]",
          c.bg,
        )}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className={cn("font-display text-3xl tracking-tight", c.text)}>
            <AnimatedCounter value={value} />
          </p>
          {trend && (
            <p
              className={cn(
                "flex items-center gap-1 text-[11px] font-semibold",
                trend.value >= 0 ? "text-resolved-deep" : "text-crime-deep",
              )}
            >
              <span>{trend.value >= 0 ? "↑" : "↓"}</span>
              <span>
                {Math.abs(trend.value)}% {trend.label}
              </span>
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            c.bg,
            c.icon,
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function KPIGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
  );
}
