import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Printer,
  Copy,
  Check,
  Download,
  ShieldAlert,
  Building2,
  DollarSign,
  TrendingDown,
  Calendar,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { PolicyBrief } from "@/lib/policy-brief-generator";
import { useApp } from "@/lib/app-context";

type Props = {
  brief: PolicyBrief | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PolicyBriefModal({ brief, open, onOpenChange }: Props) {
  const { lang } = useApp();
  const [copied, setCopied] = useState(false);

  if (!brief) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `# ${brief.title}
**Document Ref:** ${brief.documentRef}  
**Date:** ${brief.generatedAt}  
**Target Directorate:** ${brief.targetEntity}

---

## Executive Summary
${brief.executiveSummary}

---

## 1. Problem Dossier & Empirical Evidence
${brief.problemDossier
  .map(
    (p, i) =>
      `### ${i + 1}. ${p.category} [Severity: ${p.severityLevel}]\n${p.evidenceText}`,
  )
  .join("\n\n")}

---

## 2. Statutory Capital & Operational Directives
${brief.statutoryDirectives
  .map(
    (d) =>
      `### Directive #${d.number}: ${d.title}\n- **Action:** ${d.actionDescription}\n- **Lead Agency:** ${d.leadAgency}`,
  )
  .join("\n\n")}

---

## 3. Financial Outlay & Phasing
${brief.budgetBreakdown
  .map(
    (b) =>
      `- **${b.item}:** ৳${b.allocatedLakhBdt} Lakh ($${b.allocatedUsd.toLocaleString()} USD)`,
  )
  .join("\n")}

---

## 4. Projected Civic & Safety Outcomes
${brief.projectedOutcomes
  .map(
    (o) =>
      `- **${o.metric}:** Baseline ${o.baseline} ➔ Target ${o.target} (${o.projectedDelta})`,
  )
  .join("\n")}

---

## 5. Implementation Milestones
${brief.implementationMilestones
  .map((m) => `- **${m.dayRange}:** ${m.deliverable}`)
  .join("\n")}

---
**Sign-off Authorities:**
${brief.signOffAuthorities.map((a) => `- ${a}`).join("\n")}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    toast.success("Policy Directive copied as Markdown!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border-stone-200/90 bg-[#FAF8F5] shadow-2xl rounded-3xl">
        {/* Printable Paper Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200/90 bg-white/95 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs">
              <FileText className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-xs">
                  Evidence-Based Directive
                </span>
                <span className="text-xs font-mono font-semibold text-stone-500">
                  {brief.documentRef}
                </span>
              </div>
              <h2 className="text-sm font-bold font-editorial text-stone-900">
                Municipal Urban Planning Memorandum
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-colors shadow-xs"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? "Copied!" : "Copy Markdown"}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E29A26] hover:bg-[#D48B17] text-stone-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <Printer className="size-3.5" />
              Print / Export PDF
            </button>
          </div>
        </div>

        {/* Official Memo Document Body */}
        <div className="p-6 sm:p-10 space-y-8 bg-white text-stone-900 print:p-0">
          {/* Official Letterhead */}
          <div className="border-b-2 border-stone-200/90 pb-6 text-center space-y-2 relative">
            <div className="w-12 h-12 mx-auto mb-2 opacity-90">
              <img src="/disaster.png" alt="Government of Bangladesh" className="w-full h-full object-contain" />
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
              Government of the People's Republic of Bangladesh
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Dhaka Urban Planning & Public Safety Directorate
            </h1>
            <p className="text-xs text-stone-500 font-mono">
              Inter-Agency Coordination Council: DNCC • DSCC • DMP • DMB • RAJUK
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border border-border bg-secondary/30 p-4 text-xs">
            <div>
              <span className="text-muted-foreground block">Reference ID</span>
              <span className="font-mono font-bold">{brief.documentRef}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Date of Issue</span>
              <span className="font-semibold">{brief.generatedAt}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Classification</span>
              <span className="font-bold text-amber-700">Official / Action Priority</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Target Authority</span>
              <span className="font-semibold truncate block">{brief.targetEntity}</span>
            </div>
          </div>

          {/* Title & Executive Summary */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-display text-foreground leading-snug">
              {lang === "bn" ? brief.titleBn : brief.title}
            </h2>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-2">
                <Sparkles className="size-3.5" /> Executive Summary & Policy Justification
              </h3>
              <p className="text-sm leading-relaxed text-foreground/90 font-medium whitespace-pre-line">
                {lang === "bn" ? brief.executiveSummaryBn : brief.executiveSummary}
              </p>
            </div>
          </div>

          {/* Section 1: Problem Dossier */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
              <ShieldAlert className="size-4 text-amber-600" />
              1. Empirical Ground-Truth Evidence Dossier
            </h3>
            <div className="grid gap-3">
              {brief.problemDossier.map((prob, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border p-4 bg-background/50 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <span className="text-xs font-bold text-foreground">
                      {prob.category}
                    </span>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {prob.evidenceText}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      prob.severityLevel === "Critical"
                        ? "bg-red-500/15 text-red-700"
                        : prob.severityLevel === "High"
                          ? "bg-amber-500/15 text-amber-700"
                          : "bg-blue-500/15 text-blue-700"
                    }`}
                  >
                    {prob.severityLevel} Severity
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Statutory Directives */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
              <Building2 className="size-4 text-primary" />
              2. Recommended Statutory & Capital Directives
            </h3>
            <div className="space-y-3">
              {brief.statutoryDirectives.map((dir) => (
                <div
                  key={dir.number}
                  className="rounded-xl border border-border p-4 bg-background/50 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                        {dir.number}
                      </span>
                      {dir.title}
                    </h4>
                    <span className="text-[11px] font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                      {dir.leadAgency}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-8 leading-relaxed">
                    {dir.actionDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Financial Outlay */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
              <DollarSign className="size-4 text-emerald-600" />
              3. Budget Allocation & Financial Phasing
            </h3>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-xs text-left">
                <thead className="bg-secondary/60 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="p-3">Intervention Component</th>
                    <th className="p-3 text-right">Allocated (BDT)</th>
                    <th className="p-3 text-right">Equivalent (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {brief.budgetBreakdown.map((row, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20">
                      <td className="p-3 font-medium text-foreground">{row.item}</td>
                      <td className="p-3 text-right font-mono font-bold">
                        ৳{row.allocatedLakhBdt} Lakh
                      </td>
                      <td className="p-3 text-right font-mono text-muted-foreground">
                        ${row.allocatedUsd.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-primary/5 font-bold text-foreground">
                    <td className="p-3">Total Estimated Capital Outlay</td>
                    <td className="p-3 text-right font-mono text-primary font-bold">
                      ৳
                      {brief.budgetBreakdown
                        .reduce((acc, b) => acc + b.allocatedLakhBdt, 0)
                        .toFixed(1)}{" "}
                      Lakh
                    </td>
                    <td className="p-3 text-right font-mono text-primary font-bold">
                      $
                      {brief.budgetBreakdown
                        .reduce((acc, b) => acc + b.allocatedUsd, 0)
                        .toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Projected Outcomes */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
              <TrendingDown className="size-4 text-emerald-600" />
              4. Evidence-Based Projected Civic Outcomes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {brief.projectedOutcomes.map((out, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border p-3.5 bg-background/50 space-y-1.5"
                >
                  <span className="text-xs font-semibold text-muted-foreground block">
                    {out.metric}
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-muted-foreground line-through mr-2">
                        {out.baseline}
                      </span>
                      <span className="font-bold text-foreground">{out.target}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {out.projectedDelta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Implementation Milestones */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
              <Calendar className="size-4 text-blue-600" />
              5. Phased Execution Roadmap
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {brief.implementationMilestones.map((m, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border p-3 bg-secondary/30 space-y-1"
                >
                  <span className="text-[11px] font-bold text-primary uppercase font-mono tracking-wider">
                    {m.dayRange}
                  </span>
                  <p className="text-xs text-foreground font-medium">{m.deliverable}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t-2 border-border/80">
            <div className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">
              Authorized Sign-off & Inter-Agency Ratification:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] text-muted-foreground">
              {brief.signOffAuthorities.map((auth, idx) => (
                <div key={idx} className="border-t border-border/60 pt-2 space-y-1">
                  <div className="font-serif italic text-primary/80">Digitally Ratified ✓</div>
                  <div className="font-semibold text-foreground">{auth}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
