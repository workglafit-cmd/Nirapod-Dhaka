import { cn } from "@/lib/utils";

export function KPICardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="size-9 rounded-xl bg-muted" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-8 w-16 rounded bg-muted" />
        <div className="h-3 w-32 rounded bg-muted/60" />
      </div>
    </div>
  );
}

export function KPIGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ReportRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5 animate-pulse">
      <div className="size-12 shrink-0 rounded-xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="h-3 w-3/4 rounded bg-muted/60" />
        <div className="h-3 w-1/2 rounded bg-muted/40" />
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <div className="h-6 w-20 rounded-full bg-muted" />
        <div className="h-6 w-16 rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function QueueSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="h-9 w-64 rounded-xl bg-muted" />
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-xl bg-muted" />
          <div className="h-9 w-20 rounded-xl bg-muted" />
        </div>
      </div>
      <div className="divide-y divide-border/60">
        {Array.from({ length: count }).map((_, i) => (
          <ReportRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="relative flex h-[420px] w-full items-center justify-center rounded-2xl border border-border/80 bg-muted/40 p-4 shadow-sm animate-pulse">
      <div className="text-center text-sm text-muted-foreground">
        <div className="mx-auto mb-2 size-8 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
        <span>Loading Live Safety Map...</span>
      </div>
    </div>
  );
}
