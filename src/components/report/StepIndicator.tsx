import { useApp } from "@/lib/app-context";
import { Check, FileText, Camera, ShieldCheck, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComposerStep = "details" | "photo" | "verify" | "review";

const STEPS: { id: ComposerStep; icon: typeof FileText; i18nKey: string }[] = [
  { id: "details", icon: FileText, i18nKey: "step1Report" },
  { id: "photo", icon: Camera, i18nKey: "step2Photo" },
  { id: "verify", icon: ShieldCheck, i18nKey: "step3Verify" },
  { id: "review", icon: Send, i18nKey: "step4Submit" },
];

export function StepIndicator({ current }: { current: ComposerStep }) {
  const { t } = useApp();
  const idx = STEPS.findIndex((s) => s.id === current);

  return (
    <ol className="flex w-full items-stretch gap-1 sm:gap-2 rounded-2xl border border-border bg-card/60 p-2 sm:p-3 shadow-sm">
      {STEPS.map((s, i) => {
        const isCurrent = i === idx;
        const isDone = i < idx;
        const Icon = s.icon;
        return (
          <li
            key={s.id}
            className={cn(
              "flex flex-1 items-center gap-1.5 sm:gap-2 rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 transition-colors",
              isCurrent && "bg-primary/10",
              isDone && "bg-emerald-500/10",
              !isCurrent && !isDone && "bg-transparent"
            )}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                isCurrent && "bg-primary text-primary-foreground",
                isDone && "bg-emerald-500 text-white",
                !isCurrent && !isDone && "bg-secondary text-muted-foreground"
              )}
            >
              {isDone ? <Check className="size-4" /> : i + 1}
            </span>
            <div className="hidden min-w-0 flex-col sm:flex">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("stepIndicatorLabel") || "Step"} {i + 1}
              </span>
              <span
                className={cn(
                  "truncate text-sm font-bold",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {t(s.i18nKey)}
              </span>
            </div>
            <span
              className={cn(
                "truncate text-xs font-semibold sm:hidden",
                isCurrent ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {t(s.i18nKey)}
            </span>
            {/* Show icon for visually-emphasised next step on mobile */}
            {isCurrent && (
              <Icon className="ml-auto size-4 shrink-0 text-primary sm:hidden" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
