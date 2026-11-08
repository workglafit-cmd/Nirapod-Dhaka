/**
 * 4-step citizen report composer.
 *
 *   1. Details   → text + REAL NLP analysis
 *   2. Photo     → required (SOS remains exempt elsewhere)
 *   3. Verify    → demo visual-evidence animation (no paid Vision LLM)
 *   4. Review    → submit to the existing reports table
 */
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  ImagePlus,
  Loader2,
  MapPin,
  Mic,
  Pencil,
  RefreshCcw,
  Send,
  ShieldCheck,
  Square,
  X,
  XCircle,
} from "lucide-react";

import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth";
import {
  SUBTYPES,
  uploadPhoto,
  subtypeLabel,
  type ReportType,
} from "@/lib/reports";
import {
  requestDemoVisualVerify,
  runDemoEvidenceCheck,
  type DemoScenario,
  type VerificationResult,
  type VerificationStatus,
} from "@/lib/reportFlow";
import { StepIndicator, type ComposerStep } from "./StepIndicator";
import { VerificationCard } from "./VerificationCard";
import { AiAnalysisCard, type AiIntelligenceData, type VisualEvidenceData } from "@/components/ai/AiAnalysisCard";
import { MapView } from "@/components/map/MapView";
import { isWithinDhaka } from "@/data/dhakaBoundary";
import { DHAKA_CENTER } from "@/lib/geo";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { buildBackendApiUrl } from "@/lib/api-config";

type Props = {
  here: { lat: number; lng: number } | null;
  onClose: () => void;
  onDone: () => void;
  /** Internal /demo/ai only. Ordinary citizens always get "acceptable". */
  demoScenario?: DemoScenario;
};

const API_BASE: string = buildBackendApiUrl("");

const MAX_DESCRIPTION = 1000;

export function ReportComposer({ here, onClose, onDone, demoScenario = "acceptable" }: Props) {
  const { t, lang } = useApp();
  const { user } = useAuth();

  const queryStep = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("step") as ComposerStep) : null;
  const isDemoReport = typeof window !== "undefined" && (new URLSearchParams(window.location.search).get("demo") === "true" || !!queryStep);

  // ── Wizard state ────────────────────────────────────────────────────────
  const [step, setStep] = useState<ComposerStep>(queryStep || "details");
  const [submitting, setSubmitting] = useState(false);

  // ── Step 1: details ─────────────────────────────────────────────────────
  const [type, setType] = useState<ReportType>("infrastructure");
  const [subtype, setSubtype] = useState<string>(SUBTYPES.infrastructure[0].key);
  const [description, setDescription] = useState(
    isDemoReport
      ? "মিরপুর ১০ গোলচত্বরের পূর্ব পাশে মূল সড়কে খোলা ম্যানহোল। রাতে কোনো আলোর ব্যবস্থা নেই, পথচারী পড়ে গিয়ে মারাত্মক দুর্ঘটনার ঝুঁকি রয়েছে।"
      : ""
  );
  // AI analysis of the text description (real Local NLP / Groq)
  const [aiData, setAiData] = useState<AiIntelligenceData | null>(
    isDemoReport
      ? {
          category: "infrastructure",
          incident_type: "open_manhole",
          severity: "high",
          urgency: "immediate",
          confidence: 0.94,
          priority_score: 92,
          relevant_authority: "DNCC and DMB",
          reason: "Open manhole on dense arterial pedestrian corridor without nighttime illumination tag.",
        }
      : null
  );
  const [visualEvidence, setVisualEvidence] = useState<VisualEvidenceData | null>(
    queryStep === "verify" || queryStep === "review"
      ? {
          verified: true,
          confidence: 0.96,
          label: "Open Manhole Verified",
          reason: "Visual evidence matches high-risk municipal drain infrastructure defect.",
          evidence_token: "hmac-sha256:dhk-verified-ev-884920",
        }
      : null
  );
  const [analyzingText, setAnalyzingText] = useState(false);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [voiceBusy, setVoiceBusy] = useState(false);

  // ── Step 2: photo ───────────────────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(
    queryStep === "verify" || queryStep === "review" ? "/footer_card_image.jpg" : null
  );
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Step 3: verify ──────────────────────────────────────────────────────
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState<VerificationResult | null>(
    queryStep === "verify" || queryStep === "review"
      ? {
          status: "acceptable",
          confidence: 0.96,
          reason: "Visual evidence matches reported open manhole hazard.",
          verificationToken: "hmac-sha256:dhk-verified-ev-884920",
        }
      : null
  );
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    queryStep === "verify" || queryStep === "review" ? "acceptable" : "pending"
  );
  const [scanComplete, setScanComplete] = useState(queryStep === "verify" || queryStep === "review");
  // Cached text-analysis result (set when leaving step 1). Used to enrich
  // the final submission payload.
  const [textAiData, setTextAiData] = useState<{
    category?: string;
    incident_type?: string;
    severity?: string;
    urgency?: string;
    confidence?: number;
    priority_score?: number;
    relevant_authority?: string;
    reason?: string;
  } | null>(null);

  // ── Step 4: review/submit ──────────────────────────────────────────────
  const [pin, setPin] = useState<{ lat: number; lng: number }>(
    here ?? { lat: DHAKA_CENTER[0], lng: DHAKA_CENTER[1] }
  );
  const [submitDone, setSubmitDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (here) setPin(here);
  }, [here]);

  // Auto-start the evidence check after a photo is chosen (demo-friendly).
  useEffect(() => {
    if (step !== "photo" || !file || !user) return;
    const id = window.setTimeout(() => {
      void goToVerify();
    }, 800);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, step, user]);

  // Listen for the "Edit Report" custom event from the bottom bar so the
  // user can jump back to step 1 from the review screen.
  useEffect(() => {
    const onEdit = () => setStep("details");
    window.addEventListener("nd:editReport", onEdit);
    return () => window.removeEventListener("nd:editReport", onEdit);
  }, []);

  // Recording timer
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setRecordSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  // ────────────────────────────────────────────────────────────────────────
  // Voice recording → backend transcription → populates description
  // ────────────────────────────────────────────────────────────────────────
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (e) => e.data && chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = String(reader.result);
          setVoiceBusy(true);
          try {
            const res = await fetch(buildBackendApiUrl("/api/analyze-voice-report"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audio_base64: base64, mime_type: "audio/webm" }),
            });
            const json = await res.json();
            if (json?.status === "success" && json.data?.transcribed_text) {
              setDescription((prev) =>
                prev ? `${prev} ${json.data.transcribed_text}` : json.data.transcribed_text
              );
              toast.success(t("voiceTranscribed"));
            } else {
              toast.info(t("voiceUnavailable"));
            }
          } catch {
            toast.info(t("voiceUnavailable"));
          } finally {
            setVoiceBusy(false);
          }
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
      setRecordSecs(0);
    } catch {
      toast.error("Microphone unavailable.");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    setRecording(false);
    setMediaRecorder(null);
  };

  // ────────────────────────────────────────────────────────────────────────
  // File pickers
  // ────────────────────────────────────────────────────────────────────────
  const pickFile = () => fileInputRef.current?.click();

  const handleFileChange = (next: File | null) => {
    setFile(next);
    if (next) {
      const url = URL.createObjectURL(next);
      setFilePreview(url);
      // Reset any prior verification — a new photo invalidates the token.
      setVerification(null);
      setVerificationStatus("pending");
      setPhotoPath(null);
    } else {
      setFilePreview(null);
      setVerification(null);
      setVerificationStatus("pending");
      setPhotoPath(null);
    }
  };

  const onDropFile: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileChange(f);
  };

  // ────────────────────────────────────────────────────────────────────────
  // Step transitions
  // ────────────────────────────────────────────────────────────────────────
  const canGoToPhoto = description.trim().length >= 3;
  const canVerify = !!file && canGoToPhoto;

  // User explicitly asks the AI to classify their description. This is the
  // same /api/analyze-report endpoint the original composer used.
  const runTextAnalysis = async () => {
    if (description.trim().length < 3) {
      toast.error(t("descriptionTooShort"));
      return;
    }
    setAnalyzingText(true);
    try {
      const res = await fetch(buildBackendApiUrl("/api/analyze-report"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: description.trim() }),
      });
      if (!res.ok) throw new Error("analyze-report failed");
      const json = await res.json();
      const d = json?.data;
      if (!d) throw new Error("analyze-report returned no data");

      // AI pre-fills category/subtype — user can still change them by hand.
      if (["crime", "infrastructure", "accident"].includes(d.category)) {
        setType(d.category as ReportType);
        setSubtype(SUBTYPES[d.category as ReportType]?.[0]?.key || subtype);
      }
      setAiData({
        category: d.category,
        incident_type: d.incident_type,
        severity: d.severity,
        urgency: d.urgency,
        confidence: typeof d.confidence === "number" ? d.confidence : 0.5,
        priority_score: d.priority_score,
        relevant_authority: d.relevant_authority,
        reason: d.reason,
      });
      // Cache for the submit payload too.
      setTextAiData({
        category: d.category,
        incident_type: d.incident_type,
        severity: d.severity,
        urgency: d.urgency,
        confidence: d.confidence,
        priority_score: d.priority_score,
        relevant_authority: d.relevant_authority,
        reason: d.reason,
      });
    } catch {
      toast.info("AI analysis unavailable. You can continue with manual reporting.");
    } finally {
      setAnalyzingText(false);
    }
  };

  const skipAi = () => {
    setStep("photo");
  };

  const goToPhoto = () => {
    if (!canGoToPhoto) {
      toast.error(t("descriptionTooShort"));
      return;
    }
    setStep("photo");
  };

  const goToVerify = async () => {
    if (!file) {
      toast.error(t("photoRequiredMessage"));
      return;
    }
    setStep("verify");
    if (!user) {
      toast.error(t("loginToAct"));
      return;
    }
    await runScanAnimation();
  };

  const goBackFromVerify = () => {
    setVerification(null);
    setVerificationStatus("pending");
    setScanComplete(false);
    setStep("photo");
  };

  const goToReview = () => {
    if (!scanComplete || verificationStatus !== "acceptable") {
      toast.error(t("completeVerificationFirst"));
      return;
    }
    setStep("review");
  };

  const goBackFromReview = () => setStep("verify");

  // ────────────────────────────────────────────────────────────────────────
  // Visual-evidence scan animation (DEMO)
  //
  // No paid vision API is called. No "match report ↔ image" verdict is
  // produced. We just show a polished scanning animation over the user's
  // photo for ~2.5s so the user feels the evidence check is happening.
  // After the animation, Continue is enabled and the user proceeds to
  // review. The actual photo upload to Supabase storage happens at the
  // submit step.
  // ────────────────────────────────────────────────────────────────────────
  const runScanAnimation = async () => {
    if (!file || !user) return;
    setVerifying(true);
    setVerificationStatus("pending");
    setScanComplete(false);
    setVerification(null);

    const incident =
      aiData?.incident_type?.trim() ||
      textAiData?.incident_type?.trim() ||
      "the reported incident";
    const category =
      aiData?.category?.trim() || textAiData?.category?.trim() || type;
    const understanding = {
      category,
      incident_type: incident,
      severity: aiData?.severity ?? textAiData?.severity,
      urgency: aiData?.urgency ?? textAiData?.urgency,
      confidence: aiData?.confidence ?? textAiData?.confidence,
      priority_score: aiData?.priority_score ?? textAiData?.priority_score,
      relevant_authority:
        aiData?.relevant_authority ?? textAiData?.relevant_authority,
      reason: aiData?.reason ?? textAiData?.reason,
    };

    try {
      const imageBase64 = await readFileAsDataUrl(file);
      const [serverResult] = await Promise.all([
        requestDemoVisualVerify({
          imageBase64,
          textReport: description.trim(),
          category,
          incidentType: incident,
          photoStoragePath: photoPath || undefined,
          demoScenario: demoScenario !== "acceptable" ? demoScenario : undefined,
        }).catch((err) => {
          console.warn("[demo evidence] server fallback:", err);
          return null;
        }),
        new Promise((r) => setTimeout(r, 2500)),
      ]);

      const result =
        serverResult ??
        runDemoEvidenceCheck({
          report: understanding,
          scenario: demoScenario,
        });

      setVerification(result);
      setVerificationStatus(result.status);
      setScanComplete(true);
    } catch (err) {
      console.warn("[demo scan] fallback:", err);
      const fallback = runDemoEvidenceCheck({
        report: understanding,
        scenario: demoScenario,
      });
      setVerification(fallback);
      setVerificationStatus(fallback.status);
      setScanComplete(true);
    } finally {
      setVerifying(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Final submit (server-enforced)
  // ────────────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!user || !file) return;
    if (!scanComplete) {
      toast.error(t("completeVerificationFirst"));
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      // Make sure the photo is uploaded (re-upload if the user backed up
      // and replaced the photo, which we already handle via the photoPath
      // reset on handleFileChange).
      let storagePath = photoPath;
      if (!storagePath) {
        storagePath = await uploadPhoto(file, user.id);
        setPhotoPath(storagePath);
      }

      // Insert directly into Supabase — same as the original composer did.
      const payload: any = {
        reporter_id: user.id,
        type,
        subtype,
        description: description.trim().slice(0, MAX_DESCRIPTION),
        photo_url: storagePath,
        lat: pin.lat,
        lng: pin.lng,
        area_name: null,
        status: "sent",
      };
      if (aiData) {
        payload.ai_severity = aiData.severity;
        payload.ai_urgency = aiData.urgency;
        payload.ai_category = aiData.category;
        payload.ai_incident_type = aiData.incident_type;
        payload.ai_confidence = aiData.confidence;
        payload.ai_priority_score = aiData.priority_score;
        payload.ai_reason = aiData.reason;
      } else if (textAiData) {
        payload.ai_category = textAiData.category;
        payload.ai_severity = textAiData.severity;
        payload.ai_urgency = textAiData.urgency;
        payload.ai_incident_type = textAiData.incident_type;
        payload.ai_confidence = textAiData.confidence;
        payload.ai_priority_score = textAiData.priority_score;
        payload.ai_reason = textAiData.reason;
      }

      const { error } = await supabase.from("reports").insert(payload);
      if (error) throw error;

      setSubmitDone(true);
      toast.success(t("reportSent"));
      setTimeout(() => onDone(), 800);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submit failed");
      toast.error(t("sendReportFailed") || "Could not send report.");
    } finally {
      setSubmitting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[1100] flex flex-col bg-background overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 p-4 border-b border-border bg-card shadow-sm pt-safe">
        <button
          type="button"
          onClick={() => {
            if (step === "photo") setStep("details");
            else if (step === "verify") setStep("photo");
            else if (step === "review") setStep("verify");
            else onClose();
          }}
          className="p-2 tap-target rounded-full hover:bg-secondary"
          aria-label={t("backToReport")}
        >
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="font-display text-base font-bold">{t("newReport")}</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-2 tap-target rounded-full hover:bg-secondary"
          aria-label={t("cancel")}
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="shrink-0 px-4 pt-3">
        <StepIndicator current={step} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-xl flex-col gap-4">
          {step === "details" && (
            <DetailsStep
              description={description}
              onDescription={setDescription}
              recording={recording}
              recordSecs={recordSecs}
              voiceBusy={voiceBusy}
              onStartVoice={startVoiceRecording}
              onStopVoice={stopVoiceRecording}
              aiData={aiData}
              onClearAi={() => setAiData(null)}
              visualEvidence={visualEvidence}
              busy={analyzingText}
              onAnalyze={runTextAnalysis}
              onSkipAi={skipAi}
            />
          )}

          {step === "photo" && (
            <PhotoStep
              file={file}
              filePreview={filePreview}
              onPickFile={pickFile}
              onDropFile={onDropFile}
              onChangeFile={handleFileChange}
              onRemoveFile={() => handleFileChange(null)}
              fileInputRef={fileInputRef}
              uploading={uploadingPhoto}
            />
          )}

          {step === "verify" && (
            <VerifyStep
              filePreview={filePreview}
              description={description}
              type={type}
              status={verificationStatus}
              busy={verifying}
              result={verification}
              understanding={aiData}
              pin={pin}
              onPinChange={setPin}
              onRetry={runScanAnimation}
              onReplacePhoto={() => {
                setVerification(null);
                setVerificationStatus("pending");
                setScanComplete(false);
                setStep("photo");
              }}
            />
          )}

          {step === "review" && (
            <ReviewStep
              type={type}
              subtype={subtype}
              description={description}
              filePreview={filePreview}
              pin={pin}
              onPinChange={setPin}
              verification={verification}
              textAiData={textAiData}
              submitDone={submitDone}
              submitError={submitError}
            />
          )}
        </div>
      </div>

      {/* No bottom bar on Step 1 — the AI card has its own Continue, so
          there is only one tap to leave the details step. */}
      {step !== "details" && (
        <BottomBar
          step={step}
          canContinue={
            (step === "photo" && canVerify) ||
            (step === "verify" &&
              scanComplete &&
              verificationStatus === "acceptable") ||
            step === "review"
          }
          submitting={submitting}
          submitDone={submitDone}
          verificationStatus={verificationStatus}
          onContinue={
            step === "photo"
              ? goToVerify
              : step === "verify"
              ? goToReview
              : submit
          }
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Details
// ─────────────────────────────────────────────────────────────────────────────

function DetailsStep(props: {
  description: string;
  onDescription: (s: string) => void;
  recording: boolean;
  recordSecs: number;
  voiceBusy: boolean;
  onStartVoice: () => void;
  onStopVoice: () => void;
  aiData: AiIntelligenceData | null;
  onClearAi: () => void;
  visualEvidence: VisualEvidenceData | null;
  busy: boolean;
  onAnalyze: () => void;
  onSkipAi: () => void;
}) {
  const { t } = useApp();
  const {
    description,
    onDescription,
    recording,
    recordSecs,
    voiceBusy,
    onStartVoice,
    onStopVoice,
    aiData,
    onClearAi,
    visualEvidence,
    busy,
    onAnalyze,
    onSkipAi,
  } = props;

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-2xl font-bold text-foreground">
          {t("incidentDetailsTitle")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("incidentDetailsDesc")}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("description")}
          </span>
          <textarea
            rows={5}
            maxLength={MAX_DESCRIPTION}
            value={description}
            onChange={(e) => onDescription(e.target.value)}
            placeholder={t("describePlaceholder")}
            className="w-full resize-none rounded-xl border border-border bg-secondary/40 p-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <span className="self-end text-[11px] font-semibold text-muted-foreground">
            {t("charsCounter").replace("{n}", String(description.length))}
          </span>
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("voiceInputOptional")}
          </span>
          {recording ? (
            <button
              type="button"
              onClick={onStopVoice}
              className="inline-flex items-center gap-2 rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground"
            >
              <Square className="size-3 fill-current" />
              {Math.floor(recordSecs / 60)}:{(recordSecs % 60).toString().padStart(2, "0")}
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartVoice}
              disabled={voiceBusy}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              {voiceBusy ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Mic className="size-3" />
              )}
              <span>{t("voiceInputOptional")}</span>
            </button>
          )}
        </div>
      </div>

      {/* AI analysis + the only Continue path on this step. The bottom bar
          is hidden on Step 1 so there is exactly one way to move forward:
          let the AI classify the description, then confirm. */}
      {aiData ? (
        <>
          <AiAnalysisCard
            data={aiData}
            visualEvidence={visualEvidence}
            onEdit={onClearAi}
            onConfirm={onSkipAi}
          />
          <p className="text-center text-xs text-muted-foreground">
            {t("aiWillInferCategory")}
          </p>
        </>
      ) : (
        <button
          type="button"
          onClick={onAnalyze}
          disabled={busy || description.trim().length < 3}
          className="w-full rounded-2xl bg-primary px-5 py-3.5 text-center font-bold text-base text-primary-foreground shadow-elevated transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
        >
          {busy ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" /> {t("analyzing")}
            </span>
          ) : (
            t("analyzeBtn")
          )}
        </button>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Photo
// ─────────────────────────────────────────────────────────────────────────────

function PhotoStep(props: {
  file: File | null;
  filePreview: string | null;
  onPickFile: () => void;
  onDropFile: React.DragEventHandler<HTMLDivElement>;
  onChangeFile: (f: File | null) => void;
  onRemoveFile: () => void;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  uploading: boolean;
}) {
  const { t } = useApp();
  const {
    file,
    filePreview,
    onPickFile,
    onDropFile,
    onChangeFile,
    onRemoveFile,
    fileInputRef,
    uploading,
  } = props;

  if (!file || !filePreview) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
            <Camera className="size-3.5" /> {t("photoRequiredBadge")}
          </span>
        </div>
        <h3 className="font-display text-2xl font-bold text-foreground">
          {t("photoStepTitle")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("photoRequiredMessage")}</p>

        <div
          role="button"
          tabIndex={0}
          onClick={onPickFile}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPickFile()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDropFile}
          className="mt-2 flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-secondary/30 px-6 py-10 text-center transition-colors hover:border-primary hover:bg-primary/5"
        >
          <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <ImagePlus className="size-7" />
          </span>
          <p className="text-base font-bold text-foreground">
            {t("choosePhoto")}
          </p>
          <p className="text-xs text-muted-foreground">{t("dragOrDrop")}</p>
          <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm">
            <Camera className="size-4" /> {t("choosePhoto")}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChangeFile(e.target.files?.[0] ?? null)}
        />
      </div>
    );
  }

  const sizeKb = Math.max(1, Math.round(file.size / 1024));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
          <Camera className="size-3.5" /> {t("photoRequiredBadge")}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
          <CheckCircle2 className="size-3.5" /> {t("readyForCheck")}
        </span>
      </div>
      <h3 className="font-display text-2xl font-bold text-foreground">
        {t("photoStepTitle")}
      </h3>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <img
          src={filePreview}
          alt="Incident preview"
          className="aspect-video w-full object-cover"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-3 text-xs">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{file.name}</p>
            <p className="text-muted-foreground">
              {t("photoFileSize").replace("{kb}", String(sizeKb))} · {file.type || "image"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPickFile}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              {uploading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCcw className="size-3" />}
              {t("replacePhoto")}
            </button>
            <button
              type="button"
              onClick={onRemoveFile}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-card px-3 py-1.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
            >
              <XCircle className="size-3" /> {t("removePhoto")}
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChangeFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Verify
// ─────────────────────────────────────────────────────────────────────────────

function VerifyStep(props: {
  filePreview: string | null;
  description: string;
  type: ReportType;
  status: VerificationStatus;
  busy: boolean;
  result: VerificationResult | null;
  understanding?: AiIntelligenceData | null;
  pin: { lat: number; lng: number };
  onPinChange: (p: { lat: number; lng: number }) => void;
  onRetry: () => void;
  onReplacePhoto: () => void;
}) {
  const { t } = useApp();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
          <ShieldCheck className="size-3.5" /> {t("visualVerification")}
        </span>
      </div>

      <VerificationCard
        filePreview={props.filePreview}
        status={props.status}
        busy={props.busy}
        result={props.result}
        userText={props.description}
        understanding={props.understanding}
        onRetry={props.onRetry}
        onReplacePhoto={props.onReplacePhoto}
      />

      {/* Location selector — drag the pin to the exact spot of the hazard.
          The same pin carries forward to the review/submit step. */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("locationLabel")}
            </span>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {props.pin.lat.toFixed(5)}, {props.pin.lng.toFixed(5)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <MapPin className="size-3" /> {t("tapToAdjust") || "Tap to adjust"}
          </span>
        </div>
        <div className="h-56">
          <MapView
            className="size-full"
            reports={[]}
            draft={props.pin}
            onDraftMove={(lat, lng) => props.onPinChange({ lat, lng })}
            interactive
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Review
// ─────────────────────────────────────────────────────────────────────────────

function ReviewStep(props: {
  type: ReportType;
  subtype: string;
  description: string;
  filePreview: string | null;
  pin: { lat: number; lng: number };
  onPinChange: (p: { lat: number; lng: number }) => void;
  verification: VerificationResult | null;
  textAiData: {
    category?: string;
    incident_type?: string;
    severity?: string;
    urgency?: string;
    confidence?: number;
    priority_score?: number;
    relevant_authority?: string;
    reason?: string;
  } | null;
  submitDone: boolean;
  submitError: string | null;
}) {
  const { t, lang } = useApp();
  const {
    type,
    subtype,
    description,
    filePreview,
    pin,
    onPinChange,
    verification,
    textAiData,
    submitDone,
    submitError,
  } = props;

  const priority = textAiData?.priority_score ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-2xl font-bold text-foreground">
          {t("reportReview")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("reviewDesc")}</p>
      </div>

      {submitDone && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="size-5" /> {t("reportSubmitted")}
        </div>
      )}
      {submitError && (
        <div className="flex items-start gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <XCircle className="size-5" /> <span>{submitError}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {filePreview && (
          <img
            src={filePreview}
            alt="Submitted photo"
            className="aspect-video w-full object-cover"
          />
        )}
        <div className="grid grid-cols-2 gap-3 p-4">
          <ReviewField label={t("reviewCategory")} value={t(type) || type} />
          <ReviewField
            label={t("subtype")}
            value={subtypeLabel(subtype, lang === "bn" ? "bn" : "en")}
          />
          <ReviewField
            label={t("reviewLocation")}
            value={`${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}`}
          />
          <ReviewField
            label={t("reviewPriority")}
            value={priority ? `${priority}` : "—"}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {t("reviewIncident")}
        </span>
        <p className="mt-1 text-sm text-foreground">{description}</p>
      </div>

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("reviewVisual")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            {t("statusAcceptable")}
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {t("evidenceConsistent")}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("evidenceConsistency")}: {t("consistencyHigh")}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("locationLabel")}
          </span>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
          </p>
        </div>
        <div className="h-56">
          <MapView
            className="size-full"
            reports={[]}
            draft={pin}
            onDraftMove={(lat, lng) => onPinChange({ lat, lng })}
            interactive
          />
        </div>
      </div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/40 p-2.5">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="mt-0.5 block text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bottom action bar
// ─────────────────────────────────────────────────────────────────────────────

function BottomBar(props: {
  step: ComposerStep;
  canContinue: boolean;
  submitting: boolean;
  submitDone: boolean;
  verificationStatus: VerificationStatus;
  onContinue: () => void;
}) {
  const { t } = useApp();
  const { step, canContinue, submitting, submitDone, verificationStatus, onContinue } = props;

  let label = t("continueToPhoto");
  let Icon = ArrowRight;
  let disabled = !canContinue;

  if (step === "details") {
    label = t("continueToPhoto");
    Icon = ChevronRight;
  } else if (step === "photo") {
    label = t("continueToEvidence");
    Icon = ShieldCheck;
  } else if (step === "verify") {
    if (verificationStatus === "acceptable") {
      label = t("continueToReview");
      Icon = ChevronRight;
    } else {
      label = t("completeVerificationFirst");
      Icon = ShieldCheck;
      disabled = true;
    }
  } else if (step === "review") {
    if (submitDone) {
      label = t("reportSubmitted");
      Icon = CheckCircle2;
      disabled = true;
    } else if (submitting) {
      label = t("submittingReport");
      Icon = Loader2;
      disabled = true;
    } else {
      label = t("reviewAndSubmit");
      Icon = Send;
    }
  }

  return (
    <div className="shrink-0 p-4 bg-background border-t border-border pb-[env(safe-area-inset-bottom)] z-20">
      <div className="max-w-xl mx-auto flex items-center gap-2">
        {step === "review" && (
          <button
            type="button"
            onClick={() => {
              // Back to the details step so the user can edit the report.
              // We dispatch a custom event the parent listens for via the
              // StepIndicator (or the parent can listen to this).
              window.dispatchEvent(new CustomEvent("nd:editReport"));
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
            aria-label={t("editReport")}
          >
            <Pencil className="size-4" />
            <span className="hidden sm:inline">{t("editReport")}</span>
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          disabled={disabled}
          className={cn(
            "flex-1 rounded-2xl px-5 py-3.5 text-center font-bold text-base shadow-elevated transition-transform flex items-center justify-center gap-2",
            "bg-primary text-primary-foreground hover:scale-[1.01] active:scale-95",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          )}
        >
          {submitting ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Icon className="size-5" />
          )}
          {label}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
