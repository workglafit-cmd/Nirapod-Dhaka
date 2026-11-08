import { SEED_REPORTS, SEED_SOS_ALERTS } from "@/data/seedData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Report, ReportType, ReportStatus } from "@/lib/reports";
import type { AppRole } from "@/lib/auth";

/* ── Role-based report filtering ── */

const POLICE_TYPES: ReportType[] = ["crime"];
const DMB_SUBTYPES = ["fire", "building", "waterlogging", "road_accident", "other_accident"];
const INFRA_SUBTYPES = ["manhole", "drain", "road", "streetlight"];

function filterForRole(reports: Report[], role: AppRole | null): Report[] {
  if (role === "city_corp") return reports;
  if (role === "police") return reports.filter((r) => r.type === "crime");
  if (role === "dmb")
    return reports.filter(
      (r) =>
        r.type === "accident" ||
        (r.type === "infrastructure" && r.subtype && DMB_SUBTYPES.includes(r.subtype)),
    );
  return reports;
}

/* ── Hooks ── */

export function useDashboardReports(role: AppRole | null) {
  const query = useQuery({
    queryKey: ["dashboard-reports"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500);
        if (!error && data && data.length > 0) {
          return data as unknown as Report[];
        }
      } catch (err) {
        console.warn("[DashboardReports] Falling back to seed reports:", err);
      }
      return SEED_REPORTS;
    },
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const filtered = useMemo(
    () => filterForRole(query.data ?? SEED_REPORTS, role),
    [query.data, role],
  );

  return { ...query, data: filtered, all: query.data ?? SEED_REPORTS };
}

export type DashboardStats = {
  openReports: number;
  pending: number;
  resolvedToday: number;
  newToday: number;
  highPriority: number;
  totalReports: number;
  avgResponseMin: number;
  sosActive: number;
  byType: Record<ReportType, number>;
  byStatus: Record<ReportStatus, number>;
  bySubtype: Record<string, number>;
};

export function useDashboardStats(reports: Report[], sosCount: number): DashboardStats {
  return useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneHourAgo = now.getTime() - 60 * 60 * 1000;

    const open = reports.filter((r) => r.status !== "resolved");
    const pending = reports.filter((r) => r.status === "sent");
    const resolvedToday = reports.filter(
      (r) => r.status === "resolved" && new Date(r.created_at).getTime() >= todayStart,
    );
    const newToday = reports.filter((r) => new Date(r.created_at).getTime() >= todayStart);
    const highPriority = reports.filter((r) => {
      const age = now.getTime() - new Date(r.created_at).getTime();
      return r.status === "sent" && age > 2 * 60 * 60 * 1000;
    });

    const byType: Record<string, number> = { crime: 0, infrastructure: 0, accident: 0 };
    const byStatus: Record<string, number> = { sent: 0, received: 0, resolved: 0 };
    const bySubtype: Record<string, number> = {};
    for (const r of reports) {
      byType[r.type] = (byType[r.type] ?? 0) + 1;
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      if (r.subtype) bySubtype[r.subtype] = (bySubtype[r.subtype] ?? 0) + 1;
    }

    // Simulated average response time (minutes) — based on ratio of received/resolved
    const received = reports.filter((r) => r.status !== "sent");
    const avgMs =
      received.length > 0
        ? received.reduce((sum, r) => {
            const created = new Date(r.created_at).getTime();
            // Estimate response as time since creation (updated_at not in client type)
            const elapsed = Date.now() - created;
            return sum + Math.min(elapsed, 24 * 3600_000);
          }, 0) / received.length
        : 0;

    return {
      openReports: open.length,
      pending: pending.length,
      resolvedToday: resolvedToday.length,
      newToday: newToday.length,
      highPriority: highPriority.length,
      totalReports: reports.length,
      avgResponseMin: Math.round(avgMs / 60_000),
      sosActive: sosCount,
      byType: byType as Record<ReportType, number>,
      byStatus: byStatus as Record<ReportStatus, number>,
      bySubtype,
    };
  }, [reports, sosCount]);
}

export type SosAlert = {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  status: string;
  nearest_station_id: string | null;
  contact_notified: boolean;
  created_at: string;
  updated_at: string;
};

export function useSosAlerts() {
  return useQuery({
    queryKey: ["sos-alerts"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("sos_alerts")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return data as SosAlert[];
        }
      } catch (err) {
        console.warn("[SosAlerts] Falling back to seed alerts:", err);
      }
      return SEED_SOS_ALERTS;
    },
    refetchInterval: 10_000,
    staleTime: 5_000,
  });
}

export function useReportActions() {
  const qc = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, resolution_image_url }: { id: string; status: ReportStatus; resolution_image_url?: string }) => {
      const updatePayload: any = { status };
      if (resolution_image_url) updatePayload.resolution_image_url = resolution_image_url;
      const { error } = await supabase.from("reports").update(updatePayload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["dashboard-reports"] });
    },
  });

  return { updateStatus };
}

/* ── Vote counts for a batch of reports ── */

export function useReportVotes(reportIds: string[]) {
  return useQuery({
    queryKey: ["report-votes-batch", reportIds.slice(0, 20).join(",")],
    queryFn: async () => {
      if (reportIds.length === 0) return {} as Record<string, { confirm: number; dispute: number }>;
      const { data } = await supabase
        .from("report_votes")
        .select("report_id, vote")
        .in("report_id", reportIds.slice(0, 50));
      const map: Record<string, { confirm: number; dispute: number }> = {};
      for (const row of data ?? []) {
        if (!map[row.report_id]) map[row.report_id] = { confirm: 0, dispute: 0 };
        map[row.report_id][row.vote as "confirm" | "dispute"]++;
      }
      return map;
    },
    enabled: reportIds.length > 0,
    staleTime: 30_000,
  });
}

/* ── Weekly analytics data (computed from reports) ── */

export function useWeeklyData(reports: Report[]) {
  return useMemo(() => {
    const now = new Date();
    const days: { label: string; crime: number; infrastructure: number; accident: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString("en", { weekday: "short" });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86_400_000;
      const dayReports = reports.filter((r) => {
        const t = new Date(r.created_at).getTime();
        return t >= dayStart && t < dayEnd;
      });
      days.push({
        label: dayStr,
        crime: dayReports.filter((r) => r.type === "crime").length,
        infrastructure: dayReports.filter((r) => r.type === "infrastructure").length,
        accident: dayReports.filter((r) => r.type === "accident").length,
      });
    }
    return days;
  }, [reports]);
}
