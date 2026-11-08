import { useState, useEffect } from "react";
import {
  CheckCircle2,
  ExternalLink,
  MapPin,
  MessageSquare,
  Send,
  ThumbsDown,
  ThumbsUp,
  X,
  Navigation,
  Shield,
  Clock,
  Cpu,
  ShieldAlert,
  Eye,
  Camera,
  CheckCircle,
  UploadCloud,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { TypeBadge, StatusPill } from "@/components/Badges";
import type { Report, ReportStatus } from "@/lib/reports";
import { subtypeLabel, timeAgo, photoUrl } from "@/lib/reports";
import { supabase } from "@/integrations/supabase/client";
import { fetchVotes } from "@/lib/reports";
import { ActivityTimeline, statusToStageIndex } from "./ActivityTimeline";

type Props = {
  report: Report | null;
  onClose: () => void;
  onStatusChange?: (id: string, status: ReportStatus, resolutionImage?: string) => void;
};

export function ReportDetail({ report, onClose, onStatusChange }: Props) {
  const { t, lang } = useApp();
  const [votes, setVotes] = useState<{ confirm: number; dispute: number } | null>(null);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ text: string; time: string; author: string }[]>([]);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionFile, setResolutionFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resolutionPreview, setResolutionPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!report) return;
    setVotes(null);
    setImgUrl(null);
    setIsResolving(false);
    setResolutionFile(null);
    setResolutionPreview(null);
    // Mock notes to make the drawer look active
    setNotes([
      { text: "Assigned to nearest patrol unit for verification.", time: "10 mins ago", author: "Dispatcher Alpha" }
    ]);
    void fetchVotes(report.id).then((v) => setVotes({ confirm: v.confirm, dispute: v.dispute }));
    void photoUrl(report.photo_url).then(setImgUrl);
  }, [report?.id]);

  if (!report) return null;

  const stageIndex = statusToStageIndex(report.status);
  const isHighPriority = (report.ai_priority_score ?? 0) >= 80 || report.ai_severity === "critical";

  const handleResolveSubmit = async () => {
    if (!onStatusChange) return;
    if (!resolutionFile) {
      alert("Please attach a proof photo to resolve this incident.");
      return;
    }
    
    setIsUploading(true);
    try {
      const ext = resolutionFile.name.split(".").pop();
      const fileName = `${report.id}-${Date.now()}.${ext}`;
      
      const { data, error } = await supabase.storage
        .from("proofs")
        .upload(fileName, resolutionFile);
        
      if (error) throw error;
      
      onStatusChange(report.id, "resolved", data.path);
      setIsResolving(false);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload proof. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-border bg-background shadow-[0_0_40px_rgba(0,0,0,0.1)] animate-slide-in-right db-scroll">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <TypeBadge type={report.type} />
            <StatusPill status={report.status} />
            <span className="text-[10px] font-bold text-muted-foreground">ID: {report.id.split("-")[0].toUpperCase()}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* AI Intelligence Card (Operational Focus) */}
          {(report.ai_priority_score || report.ai_reason) && (
            <div className={cn(
              "overflow-hidden rounded-2xl border-2 shadow-sm animate-slide-in-up",
              isHighPriority ? "border-crime/20 bg-gradient-to-br from-card to-crime/5" : "border-primary/20 bg-gradient-to-br from-card to-primary/5"
            )}>
              <div className={cn(
                "flex items-center gap-2 border-b px-5 py-3",
                isHighPriority ? "border-crime/10 bg-crime/10" : "border-primary/10 bg-primary/10"
              )}>
                <Cpu className={cn("size-4", isHighPriority ? "text-crime-deep" : "text-primary-deep")} />
                <h3 className={cn("font-display text-sm", isHighPriority ? "text-crime-deep" : "text-primary-deep")}>
                  {t("aiSafetyAssessmentTitle")}
                </h3>
              </div>
              
              <div className="p-5">
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center justify-center">
                    <span className={cn(
                      "flex size-14 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-sm",
                      isHighPriority ? "bg-crime" : "bg-primary"
                    )}>
                      {report.ai_priority_score ?? "--"}
                    </span>
                    <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority</span>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("severityLabel")}</p>
                        <p className={cn("mt-1 text-sm font-bold capitalize", report.ai_severity === "critical" ? "text-crime" : "text-foreground")}>
                          {report.ai_severity || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("urgencyLabel")}</p>
                        <p className="mt-1 text-sm font-bold text-foreground">Immediate</p>
                      </div>
                    </div>
                    
                    {report.ai_reason && (
                      <div className="rounded-xl bg-background/50 p-3 border border-border/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">AI Reasoning</p>
                        <p className="text-xs italic text-foreground/80 leading-relaxed">"{report.ai_reason}"</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-resolved-deep">
                      <CheckCircle className="size-3.5" />
                      {t("visualEvidenceCheckComplete")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Core Report Info */}
          <div className="space-y-4 animate-slide-in-up" style={{ animationDelay: "100ms" }}>
            <div>
              <h2 className="font-display text-2xl leading-tight">
                {report.ai_incident_type || subtypeLabel(report.subtype, lang) || t(report.type)}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground/80 leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50">
                "{report.description}"
              </p>
            </div>

            {/* Photo & Map Split */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Photo */}
              <div className="group relative h-40 overflow-hidden rounded-xl border border-border bg-muted">
                {imgUrl ? (
                  <>
                    <img src={imgUrl} alt="Evidence" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-white">
                      <Camera className="size-3.5" /> Evidence
                    </span>
                  </>
                ) : (
                  <div className="flex size-full flex-col items-center justify-center text-muted-foreground">
                    <Eye className="size-8 opacity-20" />
                    <span className="mt-2 text-xs font-semibold">No visual evidence</span>
                  </div>
                )}
              </div>
              
              {/* Location */}
              <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                    <MapPin className="size-3.5" /> Location
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground line-clamp-2">{report.area_name ?? "Unknown Area"}</p>
                  <p className="mt-1 text-[10px] font-medium text-muted-foreground font-mono">
                    {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${report.lat},${report.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-tint py-2 text-xs font-bold text-primary-deep transition-colors hover:bg-primary hover:text-white"
                >
                  <Navigation className="size-3.5" />
                  {t("actionNavigate")}
                </a>
              </div>
            </div>
            
            {/* Meta row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <ThumbsUp className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Community Verifications</p>
                  <p className="text-sm font-bold text-foreground">
                    <span className="text-resolved-deep">{votes?.confirm ?? 0}</span> confirmed, <span className="text-crime-deep">{votes?.dispute ?? 0}</span> disputed
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Clock className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reported At</p>
                  <p className="text-sm font-bold text-foreground">{timeAgo(report.created_at, lang)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="animate-slide-in-up" style={{ animationDelay: "200ms" }}>
            <h3 className="mb-4 flex items-center gap-2 font-display text-sm">
              <Shield className="size-4 text-primary" />
              {t("activityTimeline")}
            </h3>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <ActivityTimeline currentStageIndex={stageIndex} createdAt={report.created_at} />
            </div>
          </div>

          {/* Internal Notes */}
          <div className="animate-slide-in-up" style={{ animationDelay: "300ms" }}>
            <h3 className="mb-4 flex items-center gap-2 font-display text-sm">
              <MessageSquare className="size-4 text-primary" />
              {t("internalNotes")}
            </h3>
            <div className="space-y-3">
              {notes.map((n, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{n.author}</span>
                    <span className="text-[10px] font-medium text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground/90">{n.text}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log a dispatch note..."
                className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium outline-none transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && note.trim()) {
                    setNotes((prev) => [
                      ...prev,
                      { text: note.trim(), time: "Just now", author: "You" },
                    ]);
                    setNote("");
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (note.trim()) {
                    setNotes((prev) => [
                      ...prev,
                      { text: note.trim(), time: "Just now", author: "You" },
                    ]);
                    setNote("");
                  }
                }}
                className="flex size-11 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>

          <div className="h-20" /> {/* Spacer */}
        </div>

        {/* Bottom Sticky Actions */}
        {onStatusChange && (
          <div className="sticky bottom-0 z-20 flex flex-col gap-3 border-t border-border bg-card/95 px-6 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            
            {/* Resolution Upload UI */}
            {isResolving && report.status === "received" && (
              <div className="mb-2 animate-fade-in space-y-3 rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-bold text-foreground">Attach Resolution Proof</p>
                <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:bg-muted/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setResolutionFile(file);
                        setResolutionPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  />
                  {resolutionPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={resolutionPreview} alt="Proof preview" className="h-32 w-full rounded-lg object-cover" />
                      <p className="text-xs font-semibold text-primary">Tap to change image</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UploadCloud className="size-8 opacity-50" />
                      <p className="text-sm font-medium">Tap to upload photo proof</p>
                      <p className="text-xs">Required to close the case</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResolving(false);
                      setResolutionFile(null);
                      setResolutionPreview(null);
                    }}
                    className="flex-1 rounded-xl border border-border bg-background py-2 text-sm font-bold text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResolveSubmit}
                    disabled={!resolutionFile || isUploading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-resolved px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isUploading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                    Submit Resolution
                  </button>
                </div>
              </div>
            )}

            {!isResolving && (
              <div className="flex gap-3">
                {report.status === "sent" && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(report.id, "received")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <CheckCircle2 className="size-4" />
                    Acknowledge & Receive
                  </button>
                )}
                {report.status === "received" && (
                  <button
                    type="button"
                    onClick={() => setIsResolving(true)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-resolved px-4 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <CheckCircle2 className="size-4" />
                    Mark Resolved
                  </button>
                )}
                {report.status === "resolved" && (
                  <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-resolved-tint px-4 py-3.5 text-sm font-bold text-resolved-deep">
                    <CheckCircle2 className="size-4" />
                    Case Closed
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
