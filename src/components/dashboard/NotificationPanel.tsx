import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  FileText,
  MapPin,
  ShieldAlert,
  Siren,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import { timeAgo } from "@/lib/reports";
import { useAuth } from "@/lib/auth";
import { Link } from "@tanstack/react-router";

type Notification = {
  id: string;
  type: "report" | "sos" | "verified" | "assigned" | "priority" | "escalation";
  titleKey: string;
  description: string;
  time: string;
  read: boolean;
};

const iconMap = {
  report: FileText,
  sos: Siren,
  verified: CheckCircle2,
  assigned: MapPin,
  priority: AlertTriangle,
  escalation: ShieldAlert,
};

const colorMap = {
  report: "text-primary bg-primary-tint",
  sos: "text-crime bg-crime-tint",
  verified: "text-resolved bg-resolved-tint",
  assigned: "text-primary bg-primary-tint",
  priority: "text-infra bg-infra-tint",
  escalation: "text-crime bg-crime-tint",
};

function generateMockNotifications(): Notification[] {
  const now = Date.now();
  return [
    {
      id: "n1",
      type: "sos",
      titleKey: "notifSosActive",
      description: "Gulshan 1, Dhaka",
      time: new Date(now - 2 * 60_000).toISOString(),
      read: false,
    },
    {
      id: "n2",
      type: "report",
      titleKey: "notifNewReport",
      description: "Open manhole — Dhanmondi",
      time: new Date(now - 15 * 60_000).toISOString(),
      read: false,
    },
    {
      id: "n3",
      type: "priority",
      titleKey: "notifHighPriority",
      description: "Building collapse — Mirpur 10",
      time: new Date(now - 45 * 60_000).toISOString(),
      read: false,
    },
    {
      id: "n4",
      type: "verified",
      titleKey: "notifReportVerified",
      description: "32 confirmations — Snatching report",
      time: new Date(now - 2 * 3600_000).toISOString(),
      read: true,
    },
    {
      id: "n5",
      type: "assigned",
      titleKey: "notifOfficerAssigned",
      description: "Inspector Mahmud — Case #R-4521",
      time: new Date(now - 5 * 3600_000).toISOString(),
      read: true,
    },
    {
      id: "n6",
      type: "escalation",
      titleKey: "notifInfraEscalation",
      description: "Road damage escalated to City Corp",
      time: new Date(now - 18 * 3600_000).toISOString(),
      read: true,
    },
  ];
}

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function NotificationPanel({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [notifications] = useState(generateMockNotifications);
  const { t, lang } = useApp();
  const { user } = useAuth();

  const unread = user ? notifications.filter((n) => !n.read).length : 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            className="relative flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t("dbSideNotifications")}
          >
            <Bell className="size-[18px]" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-crime text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent className="z-[1000] w-80 sm:w-96 p-0 rounded-2xl shadow-elevated border-border" align="end" sideOffset={8}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-display text-sm">{t("dbSideNotifications")}</h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        {!user ? (
          <div className="p-8 text-center space-y-4">
            <ShieldAlert className="size-12 text-muted-foreground mx-auto" />
            <h3 className="font-display text-lg">{t("loginToAct")}</h3>
            <p className="text-sm text-muted-foreground">{t("needAccount")}</p>
            <div className="flex flex-col gap-3 mt-4">
              <Link to="/auth" search={{ mode: "login" }} onClick={() => setOpen(false)} className="w-full inline-flex justify-center items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-deep transition-colors">
                {t("login")}
              </Link>
              <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)} className="w-full inline-flex justify-center items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors">
                {t("signup")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="db-scroll max-h-96 overflow-y-auto">
            {/* Today */}
            <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("notifToday")}
            </p>
          </div>
          {notifications
            .filter((n) => Date.now() - new Date(n.time).getTime() < 86_400_000)
            .map((n) => {
              const Icon = iconMap[n.type];
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                    !n.read && "bg-primary-tint/30",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      colorMap[n.type],
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium">{t(n.titleKey)}</p>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {timeAgo(n.time, lang)}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              );
            })}

          {/* Earlier */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("notifThisWeek")}
            </p>
          </div>
          {notifications
            .filter((n) => Date.now() - new Date(n.time).getTime() >= 86_400_000)
            .map((n) => {
              const Icon = iconMap[n.type];
              return (
                <div
                  key={n.id}
                  className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      colorMap[n.type],
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium text-muted-foreground">{t(n.titleKey)}</p>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {timeAgo(n.time, lang)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
