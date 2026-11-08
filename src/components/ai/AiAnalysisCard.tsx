import React from "react";
import { useApp } from "@/lib/app-context";
import {
  ShieldAlert,
  TriangleAlert,
  CarFront,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Siren,
  Flame,
  Pencil,
  ArrowRight,
  Info,
  Camera,
  Layers,
  Sparkles
} from "lucide-react";

export type AiIntelligenceData = {
  category: "crime" | "infrastructure" | "accident" | "other" | string;
  incident_type: string;
  severity: "low" | "medium" | "high" | "critical" | string;
  urgency: "low" | "medium" | "high" | "critical" | string;
  language?: string;
  relevant_authority: "police" | "city_corp" | "dmb" | "unknown" | string;
  confidence: number;
  priority_score?: number;
  reason: string;
};

export type VisualEvidenceData = {
  visual_hazard_detected?: boolean;
  visual_category?: string;
  visual_incident_type?: string;
  visual_severity?: string;
  visual_evidence_summary?: string;
  cross_comparison?: {
    match_status?: "matching" | "discrepancy" | "inconclusive" | string;
    discrepancy_note?: string;
  };
};

type Props = {
  data: AiIntelligenceData;
  visualEvidence?: VisualEvidenceData | null;
  onEdit: () => void;
  onConfirm: () => void;
};

export function AiAnalysisCard({ data, visualEvidence, onEdit, onConfirm }: Props) {
  const { t, lang } = useApp();
  const confPercent = Math.round((data.confidence ?? 0.5) * 100);
  const priorityScore = data.priority_score;

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "crime":
        return <ShieldAlert className="size-5 text-crime-deep" />;
      case "infrastructure":
        return <TriangleAlert className="size-5 text-infra-deep" />;
      case "accident":
        return <CarFront className="size-5 text-accident-deep" />;
      default:
        return <Layers className="size-5 text-primary" />;
    }
  };

  const getAuthorityName = (auth: string) => {
    switch (auth.toLowerCase()) {
      case "city_corp":
        return lang === "bn" ? "ঢাকা সিটি কর্পোরেশন" : "Dhaka City Corporation";
      case "police":
        return lang === "bn" ? "বাংলাদেশ পুলিশ" : "Bangladesh Police";
      case "dmb":
        return lang === "bn" ? "দুর্যোগ ব্যবস্থাপনা ব্যুরো" : "Disaster Management Bureau";
      default:
        return lang === "bn" ? "সংশ্লিষ্ট মিউনিসিপ্যাল কর্তৃপক্ষ" : "Relevant Municipal Authority";
    }
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "critical":
        return "bg-destructive text-destructive-foreground font-bold";
      case "high":
        return "bg-amber-500 text-white font-bold";
      case "medium":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-semibold";
      default:
        return "bg-secondary text-muted-foreground font-semibold";
    }
  };

  const hasDiscrepancy = visualEvidence?.cross_comparison?.match_status === "discrepancy";

  return (
    <div className="flex flex-col gap-4 rounded-3xl border-2 border-primary/30 bg-card p-5 lg:p-6 shadow-elevated">
      {/* Header Badge & Recommendation Notice */}
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-primary/10">
            {getCategoryIcon(data.category)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("aiIntelligence")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                <Sparkles className="size-3" /> {t("recommendation")}
              </span>
            </div>
            <h3 className="font-display text-base font-bold capitalize text-foreground">
              {data.incident_type || data.category}
            </h3>
          </div>
        </div>

        {/* Priority Score Pill */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">{t("aiPriority")}</span>
          <span className="inline-flex items-center rounded-xl bg-primary px-3 py-1 text-xs font-extrabold text-primary-foreground shadow-sm">
            {priorityScore} / 100
          </span>
        </div>
      </div>

      {/* Grid of Extracted Attributes */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-secondary/40 p-3">
          <span className="block text-[10px] font-bold uppercase text-muted-foreground">{t("categoryLabel")}</span>
          <span className="text-sm font-bold capitalize text-foreground">{data.category}</span>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/40 p-3">
          <span className="block text-[10px] font-bold uppercase text-muted-foreground">{t("severityLabel")}</span>
          <span className={`inline-block rounded-md px-2 py-0.5 text-xs uppercase ${getSeverityStyle(data.severity)}`}>
            {data.severity}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/40 p-3">
          <span className="block text-[10px] font-bold uppercase text-muted-foreground">{t("urgencyLabel")}</span>
          <span className={`inline-block rounded-md px-2 py-0.5 text-xs uppercase ${getSeverityStyle(data.urgency)}`}>
            {data.urgency}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/40 p-3">
          <span className="block text-[10px] font-bold uppercase text-muted-foreground">{t("recAuthority")}</span>
          <span className="text-xs font-bold text-foreground line-clamp-1">{getAuthorityName(data.relevant_authority)}</span>
        </div>
      </div>

      {/* Model Confidence Meter */}
      <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-secondary/20 p-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-muted-foreground">{t("modelConfidence")}</span>
          <span className="text-foreground font-bold">{confPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${confPercent}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">
          {t("modelEstimationDesc")}
        </span>
      </div>

      {/* Visual Evidence Summary & Discrepancy Warning (if Photo attached) */}
      {visualEvidence && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Camera className="size-4 text-primary" />
            <span>{t("visualEvidenceAnalysis")}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {visualEvidence.visual_evidence_summary || t("photoEvidenceFallback")}
          </p>

          {hasDiscrepancy && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-amber-700 dark:text-amber-400 text-xs font-medium">
              <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">{t("visualDiscrepancyNotice")}</span>
                {visualEvidence.cross_comparison?.discrepancy_note || t("photoEvidenceFallbackDesc")}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Operational AI Explanation */}
      {data.reason && (
        <div className="rounded-2xl border border-border bg-secondary/30 p-3 text-xs">
          <span className="font-bold text-foreground block mb-0.5">{t("safetyAssessmentSummary")}</span>
          <p className="text-muted-foreground leading-relaxed">{data.reason}</p>
        </div>
      )}

      {/* Mandatory Human Review Disclaimer */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-secondary/50 rounded-xl p-2.5">
        <Info className="size-4 text-primary shrink-0" />
        <span>{t("aiRecommendNotice")}</span>
      </div>

      {/* Human Review Action Buttons */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 tap-target inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-secondary active:scale-95"
        >
          <Pencil className="size-4" /> {t("editDetailsBtn")}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 tap-target inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-elevated transition-transform hover:scale-[1.02] active:scale-95"
        >
          {t("confirmLocationBtn")} <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
