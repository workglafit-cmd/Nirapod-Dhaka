/**
 * Visual-evidence step — DEMO verification experience.
 *
 * The previous version called a paid vision LLM. For the demo we
 * deterministically derive a verification verdict from the real NLP
 * report understanding. No external vision API is invoked from this path.
 *
 * The verdict is intentionally phrased as "evidence appears consistent
 * with the reported incident" — never as "vision AI detected X".
 */

const DEFAULT_API: string =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

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
  verification_token?: string | null;
  ai_detected?: string | null;
  demo_scenario: DemoScenario;
  demo_mode?: boolean;
};

export type ReportUnderstanding = {
  category?: string;
  incident_type?: string;
  severity?: string;
  urgency?: string;
  confidence?: number;
  priority_score?: number;
  relevant_authority?: string;
  reason?: string;
};

const ACCEPTABLE_PHRASES = {
  visual_summary:
    "Uploaded photo appears suitable as visual evidence for the reported incident.",
  consistency_reason:
    "The submitted photo is being used as supporting visual evidence for the incident identified from the report.",
};

const MISMATCH_PHRASES = {
  visual_summary:
    "The submitted photo does not appear consistent with the reported incident.",
  consistency_reason:
    "The evidence does not match the incident type that was understood from the report.",
};

const UNCERTAIN_PHRASES = {
  visual_summary:
    "Photo was received but could not be confidently evaluated as supporting evidence.",
  consistency_reason:
    "Upload a clearer, more directly relevant photo of the reported incident.",
};

const DEMO_CONFIDENCE: Record<DemoScenario, number> = {
  acceptable: 0.86,
  mismatch: 0.81,
  uncertain: 0.42,
};

export function runDemoEvidenceCheck(args: {
  report: ReportUnderstanding;
  scenario: DemoScenario;
}): VerificationResult & { status: Exclude<VerificationStatus, "pending"> } {
  const { report, scenario } = args;
  const phrases =
    scenario === "acceptable"
      ? ACCEPTABLE_PHRASES
      : scenario === "mismatch"
        ? MISMATCH_PHRASES
        : UNCERTAIN_PHRASES;

  const incidentLabel = report?.incident_type?.trim() || "the reported incident";
  const categoryLabel = report?.category?.trim() || "reported";
  const status =
    scenario === "acceptable" ? "acceptable" :
    scenario === "mismatch"   ? "mismatch"   :
                                "uncertain";

  return {
    status,
    match: status === "acceptable",
    confidence: DEMO_CONFIDENCE[scenario],
    visual_summary: phrases.visual_summary,
    consistency_reason: phrases.consistency_reason,
    category_match: status === "acceptable",
    verification_token: null,
    ai_detected: incidentLabel,
    demo_scenario: scenario,
    demo_mode: true,
  };
}

/**
 * Server-side demo verification. Issues an HMAC token. Does not call a
 * paid Vision LLM when DEMO_VISUAL_VERIFICATION is enabled on the server.
 *
 * `verified` is never sent. The server ignores it even if a client forges it.
 */
export async function requestDemoVisualVerify(args: {
  imageBase64: string;
  textReport: string;
  category: string;
  incidentType?: string;
  photoStoragePath?: string;
  /** Only used from /demo/ai. Citizen flow must omit this. */
  demoScenario?: DemoScenario;
}): Promise<VerificationResult & { status: Exclude<VerificationStatus, "pending"> }> {
  const body: Record<string, unknown> = {
    image_base64: args.imageBase64,
    text_report: args.textReport,
    category: args.category,
    incident_type: args.incidentType,
    photo_storage_path: args.photoStoragePath || null,
  };
  if (args.demoScenario) {
    body.demo_scenario = args.demoScenario;
  }

  const res = await fetch(`${DEFAULT_API}/api/demo-visual-verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  const d = json?.data;
  if (!res.ok || !d) {
    throw new Error(json?.message || "demo visual verify failed");
  }

  const status = (d.status || "uncertain") as Exclude<VerificationStatus, "pending">;
  const scenario: DemoScenario =
    d.demo_scenario === "mismatch" || d.demo_scenario === "uncertain"
      ? d.demo_scenario
      : "acceptable";

  return {
    status,
    match: Boolean(d.match),
    confidence: typeof d.confidence === "number" ? d.confidence : DEMO_CONFIDENCE[scenario],
    visual_summary: d.visual_summary || ACCEPTABLE_PHRASES.visual_summary,
    consistency_reason: d.consistency_reason || ACCEPTABLE_PHRASES.consistency_reason,
    category_match: Boolean(d.category_match),
    verification_token: d.verification_token ?? null,
    ai_detected: d.ai_detected ?? args.incidentType ?? null,
    demo_scenario: scenario,
    demo_mode: true,
  };
}

/** @deprecated Demo flow does not call paid vision. Kept so old imports compile. */
export async function verifyImageWithBackend(_args: {
  imageBase64: string;
  textReport: string;
  category: string;
  photoStoragePath: string;
}): Promise<VerificationResult & { status: Exclude<VerificationStatus, "pending"> }> {
  return runDemoEvidenceCheck({
    report: { category: _args.category },
    scenario: "acceptable",
  });
}

export const REPORT_API_BASE = DEFAULT_API;
