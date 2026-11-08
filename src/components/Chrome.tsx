import { Link } from "@tanstack/react-router";
import { Languages, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useApp();
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-card p-1",
        className,
      )}
      role="group"
      aria-label="Language / ভাষা"
    >
      <Languages className="ml-1.5 size-4 text-muted-foreground" aria-hidden />
      {(["bn", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            lang === l
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {l === "bn" ? "বাংলা" : "English"}
        </button>
      ))}
    </div>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const { t } = useApp();
  return (
    <Link to="/" className="inline-flex items-center gap-2">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <ShieldCheck className="size-5" aria-hidden />
      </span>
      {!compact && (
        <span className="font-display text-lg leading-none tracking-wide">{t("appName")}</span>
      )}
    </Link>
  );
}
