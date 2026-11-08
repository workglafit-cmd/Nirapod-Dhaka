import { useEffect, useState, useRef } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useApp } from "@/lib/app-context";
import { TypeBadge, StatusPill } from "@/components/Badges";
import type { Report } from "@/lib/reports";
import { subtypeLabel, timeAgo } from "@/lib/reports";
import { MapPin, Search } from "lucide-react";

type Props = {
  reports: Report[];
  onSelect: (r: Report) => void;
};

export function SearchCommand({ reports, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const { t, lang } = useApp();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {/* Trigger button for top nav */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">{t("searchGlobal")}</span>
        <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden rounded-2xl border-border p-0 shadow-elevated sm:max-w-xl">
          <Command className="bg-card" shouldFilter={true}>
            <CommandInput
              placeholder={t("searchGlobal")}
              className="h-12 border-b border-border text-base"
            />
            <CommandList className="db-scroll max-h-80">
              <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
                {t("searchNoResults")}
              </CommandEmpty>
              <CommandGroup heading={t("dbSideReports")}>
                {reports.slice(0, 50).map((r) => (
                  <CommandItem
                    key={r.id}
                    value={`${r.id} ${r.description} ${r.area_name ?? ""} ${r.type} ${r.subtype ?? ""}`}
                    onSelect={() => {
                      onSelect(r);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <MapPin className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                      <p className="truncate text-sm font-medium">
                        {r.description.slice(0, 60) || subtypeLabel(r.subtype, lang)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.area_name ?? `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`}
                        {" · "}
                        {timeAgo(r.created_at, lang)}
                      </p>
                    </div>
                    <TypeBadge type={r.type} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
