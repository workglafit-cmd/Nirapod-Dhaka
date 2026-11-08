import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import type { AiIntelligenceData } from "@/components/ai/AiAnalysisCard";

/**
 * Visual-evidence step — DEMO verification experience.
 *
 * No paid vision LLM is called. The card runs a short scanning animation
 * over the user's uploaded photo and then produces a deterministic
 * verdict derived from the real NLP report understanding.
 *
 * For the normal citizen workflow the scenario is "acceptable" and the
 * user can continue. The /demo/ai page can pass "mismatch" or
 * "uncertain" to show the same UI in alternative states.
 */
export type VerificationStatus =
  | "pending"
  | "acceptable"
  | "mismatch"
  | "uncertain"
  | "image_quality_low"
  | "analysis_failed";

export type DemoScenario = "acceptable" | "mismatch" | "uncertain";

export type VerificationResult = {
  status: Exclude<VerificationStatus, "pending">;
  match: boolean;
  /** Deterministic value in [0.0, 1.0]. NOT a real CV confidence. */
  confidence: number;
  visual_summary: string;
  consistency_reason: string;
  category_match: boolean;
  /** Local base64 token; non-null only when status === "acceptable". */
  verification_token?: string | null;
  /** Human-readable label of the incident, sourced from real NLP. */
  ai_detected?: string | null;
  /** Identifies the demo scenario that produced this result. */
  demo_scenario?: DemoScenario;
};

type Props = {
  /** File preview data-URL for the scanning animation. */
  filePreview?: string | null;
  /** Async state of the verification step. */
  status: VerificationStatus;
  /** True while the demo animation is running. */
  busy?: boolean;
  /** The most recent successful verification result, if any. */
  result?: VerificationResult | null;
  /** The text the user submitted. */
  userText?: string;
  /** Real NLP result from /api/analyze-report. */
  understanding?: AiIntelligenceData | null;
  /** Re-trigger the demo check. */
  onRetry?: () => void;
  /** Replace the current photo. */
  onReplacePhoto?: () => void;
};

export function VerificationCard({
  filePreview,
  status,
  busy,
  result,
  userText,
  understanding,
  onRetry,
  onReplacePhoto,
}: Props) {
  if (status === "pending" || busy) {
    return <ScanningState filePreview={filePreview} />;
  }

  if (status === "acceptable" && result) {
    return (
      <AcceptableState
        result={result}
        userText={userText}
        understanding={understanding}
      />
    );
  }

  if (status === "mismatch") {
    return (
      <MismatchState
        result={result}
        userText={userText}
        understanding={understanding}
        onReplace={onReplacePhoto}
      />
    );
  }

  if (status === "uncertain" || status === "image_quality_low") {
    return (
      <UncertainState
        result={result}
        understanding={understanding}
        onReplace={onReplacePhoto}
      />
    );
  }

  if (status === "analysis_failed") {
    return <FailedState onRetry={onRetry} onReplace={onReplacePhoto} />;
  }

  return (
    <UncertainState
      result={result}
      understanding={understanding}
      onReplace={onReplacePhoto}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scanning animation — used while the demo verification is "running"
// ─────────────────────────────────────────────────────────────────────────────

const SCAN_STEP_KEYS = [
  "scanStep_report",
  "scanStep_incident",
  "scanStep_evidence",
  "scanStep_prepare",
] as const;
const SCAN_STEP_DELAYS_MS = [500, 1000, 1500, 2200];

function ScanningState({ filePreview }: { filePreview?: string | null }) {
  const { t } = useApp();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 80);
    return () => clearInterval(id);
  }, []);

  // Derive "elapsed" from the wall clock so the steps feel like a real
  // animation rather than a state machine.
  const elapsed = tick * 80;

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          <Loader2 className="size-5 animate-spin" />
        </span>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">
            {t("evidenceCheckTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("evidenceCheckSubtitle")}
          </p>
        </div>
      </div>

      {filePreview && <ScanOverlay src={filePreview} />}

      <ul className="flex flex-col gap-1.5 text-sm">
        {SCAN_STEP_KEYS.map((key, i) => {
          const done = elapsed >= SCAN_STEP_DELAYS_MS[i];
          return (
            <li
              key={key}
              className={cn(
                "flex items-center gap-2 transition-colors",
                done ? "text-emerald-700" : "text-muted-foreground"
              )}
            >
              {done ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <CircleDashed className="size-4 shrink-0 animate-pulse" />
              )}
              <span className="font-medium">{t(key as any)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ScanOverlay({ src }: { src: string }) {
  const { t } = useApp();
  return (
    <div className="relative max-h-[min(52vh,420px)] overflow-hidden rounded-xl border border-border bg-black/5">
      <img
        src={src}
        alt=""
        className="aspect-video max-h-[min(52vh,420px)] w-full object-cover opacity-90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-primary/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 h-0.5 bg-primary/70 shadow-[0_0_12px_rgba(16,185,129,0.55)]"
        style={{ animation: "nd-scanline 1.6s ease-in-out infinite" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-card/90 text-primary shadow"
      >
        <ShieldCheck className="size-5 nd-shield-spin" />
      </div>
      <style>{`
        @keyframes nd-scanline {
          0%   { top: 4%;  opacity: 0.35; }
          50%  { top: 92%; opacity: 0.95; }
          100% { top: 4%;  opacity: 0.35; }
        }
        .nd-shield-spin { animation: nd-shield 2.4s linear infinite; }
        @keyframes nd-shield {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI understood summary — shown above the result card
// ─────────────────────────────────────────────────────────────────────────────

function AiUnderstoodSummary({
  understanding,
}: {
  understanding?: AiIntelligenceData | null;
}) {
  const { t } = useApp();
  if (!understanding) return null;
  const incident = understanding.incident_type?.trim();
  const category = understanding.category?.trim();
  if (!incident && !category) return null;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
        {t("aiUnderstoodTitle")}
      </span>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {category && (
          <span className="text-sm font-bold text-foreground">
            {t(category) || category}
          </span>
        )}
        {incident && (
          <span className="text-sm font-semibold text-foreground/80">
            {incident}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted-foreground">
        {understanding.severity && (
          <span className="rounded-md bg-secondary px-2 py-0.5">
            {t("severityLabel")} {t(understanding.severity) || understanding.severity}
          </span>
        )}
        {understanding.urgency && (
          <span className="rounded-md bg-secondary px-2 py-0.5">
            {t("urgencyLabel")} {t(understanding.urgency) || understanding.urgency}
          </span>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {t("evidenceCheckHint")}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Result states
// ─────────────────────────────────────────────────────────────────────────────

function AcceptableState({
  result,
  userText,
  understanding,
}: {
  result: VerificationResult;
  userText?: string;
  understanding?: AiIntelligenceData | null;
}) {
  const { t } = useApp();
  return (
    <div className="flex flex-col gap-3">
      <AiUnderstoodSummary understanding={understanding} />
      <div
        className="flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
            <CheckCircle2 className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">
              {t("evidenceCheckComplete")}
            </h3>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              {t("statusAcceptable")}
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("reportedIncident")}
            </span>
            <span className="mt-1 block text-sm font-semibold text-foreground">
              {result.ai_detected?.trim() || "—"}
            </span>
            {understanding?.category && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t(understanding.category) || understanding.category}
              </span>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("yourReport")}
            </span>
            <p className="mt-1 line-clamp-4 text-sm text-foreground/90">
              {userText?.trim() || "—"}
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-1.5 text-sm">
          <li className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="size-4 shrink-0" />
            <span className="font-medium">{t("photoSubmitted")}</span>
          </li>
          <li className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="size-4 shrink-0" />
            <span className="font-medium">{t("evidenceConsistent")}</span>
          </li>
        </ul>

        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">{t("evidenceConsistency")}</span>
            <span className="text-foreground font-bold">{t("consistencyHigh")}</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {result.consistency_reason}
          </p>
          <p className="mt-2 text-[10px] italic text-muted-foreground/80">
            {t("humanReviewRequired")}
          </p>
        </div>
      </div>
    </div>
  );
}

function MismatchState({
  result,
  userText,
  understanding,
  onReplace,
}: {
  result?: VerificationResult | null;
  userText?: string;
  understanding?: AiIntelligenceData | null;
  onReplace?: () => void;
}) {
  const { t } = useApp();
  return (
    <div className="flex flex-col gap-3">
      <AiUnderstoodSummary understanding={understanding} />
      <div
        className="flex flex-col gap-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 shadow-sm"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-700">
            <ShieldAlert className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">
              {t("evidenceCheckMismatchTitle")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("evidenceCheckMismatchDesc")}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("reportedIncident")}
            </span>
            <span className="mt-1 block text-sm font-semibold text-foreground">
              {result?.ai_detected?.trim() || "—"}
            </span>
            {understanding?.category && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t(understanding.category) || understanding.category}
              </span>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("evidenceStatus")}
            </span>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {t("evidenceDoesNotMatch")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReplace}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.01] active:scale-95"
        >
          <Upload className="size-4" /> {t("uploadDifferentPhoto")}
        </button>
      </div>
    </div>
  );
}

function UncertainState({
  result,
  understanding,
  onReplace,
}: {
  result?: VerificationResult | null;
  understanding?: AiIntelligenceData | null;
  onReplace?: () => void;
}) {
  const { t } = useApp();
  return (
    <div className="flex flex-col gap-3">
      <AiUnderstoodSummary understanding={understanding} />
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
            <CircleDashed className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">
              {t("evidenceCheckUncertainTitle")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("evidenceCheckUncertainDesc")}
            </p>
          </div>
        </div>
        {result?.visual_summary && (
          <p className="rounded-xl border border-border bg-card/60 p-3 text-xs text-muted-foreground">
            {result.visual_summary}
          </p>
        )}
        <button
          type="button"
          onClick={onReplace}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
        >
          <Upload className="size-4" /> {t("uploadClearerPhoto")}
        </button>
      </div>
    </div>
  );
}

function FailedState({
  onRetry,
  onReplace,
}: {
  onRetry?: () => void;
  onReplace?: () => void;
}) {
  const { t } = useApp();
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
          <XCircle className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">
            {t("apiFailedTitle")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("apiFailedExplanation")}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.01] active:scale-95"
          >
            <RefreshCcw className="size-4" /> {t("tryAgain")}
          </button>
        )}
        {onReplace && (
          <button
            type="button"
            onClick={onReplace}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
          >
            <Upload className="size-4" /> {t("replacePhoto")}
          </button>
        )}
      </div>
    </div>
  );
}

export default VerificationCard;
