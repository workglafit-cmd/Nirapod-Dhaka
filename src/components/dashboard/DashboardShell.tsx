import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ClipboardList,
  LayoutDashboard,
  Map,
  Menu,
  Settings,
  ShieldCheck,
  X,
  LogOut,
  Sparkles,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { useAuth, roleI18nKey } from "@/lib/auth";
import { LangToggle } from "@/components/Chrome";
import { NotificationPanel } from "./NotificationPanel";
import { SearchCommand } from "./SearchCommand";
import type { Report } from "@/lib/reports";

type SidebarItem = {
  labelKey: string;
  icon: typeof LayoutDashboard;
  id: string;
};

const NAV_ITEMS: SidebarItem[] = [
  { labelKey: "dashboard", icon: LayoutDashboard, id: "dashboard" },
  { labelKey: "dbSideLiveMap", icon: Map, id: "map" },
  { labelKey: "dbSideReports", icon: ClipboardList, id: "reports" },
  { labelKey: "dbSideAnalytics", icon: BarChart3, id: "analytics" },
  { labelKey: "dbSidePlanning", icon: Compass, id: "planning" },
];

type Props = {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (id: string) => void;
  reports?: Report[];
  onReportSelect?: (r: Report) => void;
};

export function DashboardShell({
  children,
  activeSection,
  onSectionChange,
  reports = [],
  onReportSelect,
}: Props) {
  const { t, lang } = useApp();
  const { profile, role, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const roleName = t(roleI18nKey(role));

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "db-sidebar fixed inset-y-0 left-0 z-50 flex flex-col",
          "lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-64",
          "transition-all duration-250 ease-out",
        )}
      >
        {/* Logo area */}
        <div
          className={cn(
            "flex items-center border-b border-border px-4 py-4",
            collapsed ? "justify-center" : "gap-3",
          )}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-display text-sm leading-tight">{t("appName")}</p>
              <p className="truncate text-[10px] font-semibold text-primary-deep">{roleName}</p>
            </div>
          )}
          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X className="size-5" />
          </button>
          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="hidden rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted lg:flex"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              className={cn("size-4 transition-transform", collapsed && "rotate-180")}
            />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSectionChange(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? t(item.labelKey) : undefined}
              >
                <item.icon className="size-[18px] shrink-0" />
                {!collapsed && <span>{t(item.labelKey)}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border p-3 space-y-1">
          <Link
            to="/ai"
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md transition-all hover:from-emerald-600 hover:to-teal-700 hover:scale-[1.02]",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? (lang === "bn" ? "এআই ইন্টেলিজেন্স" : "AI Intelligence") : undefined}
          >
            <Sparkles className="size-[18px] shrink-0" />
            {!collapsed && <span>{lang === "bn" ? "এআই ইন্টেলিজেন্স" : "AI Intelligence"}</span>}
          </Link>
          <button
            type="button"
            onClick={() => {
              onSectionChange("settings");
              setSidebarOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              activeSection === "settings" && "bg-primary text-primary-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <Settings className="size-[18px] shrink-0" />
            {!collapsed && <span>{t("dbSideSettings")}</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              void signOut();
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500/80 transition-colors hover:bg-red-500/10 hover:text-red-500",
              collapsed && "justify-center px-2",
            )}
          >
            <LogOut className="size-[18px] shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>

          {/* Profile */}
          {!collapsed && (
            <div className="mt-2 flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {(profile?.full_name ?? "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-xs font-semibold">{profile?.full_name ?? "User"}</p>
                <p className="truncate text-[10px] text-muted-foreground">{roleName}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="relative z-[100] flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          {/* Search */}
          <div className="flex-1">
            <SearchCommand reports={reports} onSelect={(r) => onReportSelect?.(r)} />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <LangToggle />
            <NotificationPanel />
            {/* Profile button */}
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={t("logout")}
            >
              <span className="text-xs font-bold">
                {(profile?.full_name ?? "U").charAt(0).toUpperCase()}
              </span>
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto db-scroll">
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
