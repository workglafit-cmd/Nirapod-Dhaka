import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, dashboardPathFor } from "@/lib/auth";
import { useApp } from "@/lib/app-context";
import {
  useDashboardReports,
  useDashboardStats,
  useSosAlerts,
  useReportActions,
  useWeeklyData,
} from "@/hooks/use-dashboard-data";
import { fetchHotspots } from "@/lib/reports";
import { useQuery } from "@tanstack/react-query";
import { PoliceDashboard } from "@/components/dashboard/PoliceDashboard";
import { DMBDashboard } from "@/components/dashboard/DMBDashboard";
import { CityCorpDashboard } from "@/components/dashboard/CityCorpDashboard";
import { Loader2 } from "lucide-react";
import type { ReportStatus } from "@/lib/reports";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Authority Dashboard — Nirapod Dhaka" },
      {
        name: "description",
        content:
          "Manage reports, track incidents, and coordinate responses across Dhaka's public safety network.",
      },
      { property: "og:title", content: "Authority Dashboard — Nirapod Dhaka" },
      {
        property: "og:description",
        content: "Government authority management dashboard for Dhaka public safety.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { session, role: authRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const demoRole = (search?.get("demo") as "police" | "dmb" | "city_corp") || null;

  // Redirect citizens to map, unauthenticated to auth
  useEffect(() => {
    if (demoRole) return;
    if (authLoading) return;
    if (!session) {
      void navigate({ to: "/auth", replace: true });
      return;
    }
    
    // Wait until role is determined
    if (authRole === null) return;
    
    console.log("DEBUG AUTH:", {
      userId: session.user.id,
      role: authRole,
      dashboardSelected: dashboardPathFor(authRole)
    });

    if (authRole === "citizen") {
      void navigate({ to: "/map", replace: true });
    }
  }, [session, authRole, authLoading, navigate, demoRole]);

  // Only render dashboard for authority roles
  if (!demoRole && (authLoading || !session || authRole === null || authRole === "citizen")) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthorityDashboard overrideRole={demoRole} />;
}

function AuthorityDashboard({ overrideRole }: { overrideRole?: "police" | "dmb" | "city_corp" | null }) {
  const { role: authRole } = useAuth();
  const role = overrideRole || authRole;
  const { data: reports, all: allReports } = useDashboardReports(role);
  const { data: sosAlerts = [] } = useSosAlerts();
  const stats = useDashboardStats(reports, sosAlerts.length);
  const { updateStatus } = useReportActions();
  const weeklyData = useWeeklyData(allReports);

  const { data: hotspots = [] } = useQuery({
    queryKey: ["dashboard-hotspots"],
    queryFn: fetchHotspots,
    staleTime: 60_000,
  });

  const handleStatusChange = (id: string, status: ReportStatus, resolutionImage?: string) => {
    updateStatus.mutate({ id, status, resolution_image_url: resolutionImage });
  };

  if (role === "police") {
    return (
      <PoliceDashboard
        reports={reports}
        stats={stats}
        sosAlerts={sosAlerts}
        hotspots={hotspots}
        weeklyData={weeklyData}
        onStatusChange={handleStatusChange}
      />
    );
  }

  if (role === "dmb") {
    return (
      <DMBDashboard
        reports={reports}
        stats={stats}
        hotspots={hotspots}
        weeklyData={weeklyData}
        onStatusChange={handleStatusChange}
      />
    );
  }

  // city_corp — master dashboard
  return (
    <CityCorpDashboard
      reports={reports}
      allReports={allReports}
      stats={stats}
      sosAlerts={sosAlerts}
      hotspots={hotspots}
      weeklyData={weeklyData}
      onStatusChange={handleStatusChange}
    />
  );
}
