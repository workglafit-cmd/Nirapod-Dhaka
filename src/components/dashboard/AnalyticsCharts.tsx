import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import type { DashboardStats } from "@/hooks/use-dashboard-data";

const COLORS = {
  crime: "var(--crime)",
  infrastructure: "var(--infra)",
  accident: "var(--color-primary)",
  resolved: "var(--resolved)",
  primary: "var(--color-primary)",
};

const PIE_COLORS = ["#E23350", "#E8A33D", "#0E9C8C"];

type ChartCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:shadow-md animate-slide-in-up",
        className,
      )}
    >
      <h3 className="mb-5 font-display text-sm tracking-tight text-foreground/90">{title}</h3>
      <div className="flex-1">{children}</div>
    </div>
  );
}

type WeeklyData = { label: string; crime: number; infrastructure: number; accident: number }[];

export function WeeklyChart({ data }: { data: WeeklyData }) {
  const { t } = useApp();
  return (
    <ChartCard title={t("chartWeeklyReports")}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              fontSize: 12,
              boxShadow: "var(--shadow-soft)",
            }}
          />
          <Bar dataKey="crime" name={t("crime")} fill={COLORS.crime} radius={[4, 4, 0, 0]} />
          <Bar
            dataKey="infrastructure"
            name={t("infrastructure")}
            fill={COLORS.infrastructure}
            radius={[4, 4, 0, 0]}
          />
          <Bar dataKey="accident" name={t("accident")} fill={COLORS.accident} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CategoryPieChart({ stats }: { stats: DashboardStats }) {
  const { t } = useApp();
  const data = [
    { name: t("crime"), value: stats.byType.crime },
    { name: t("infrastructure"), value: stats.byType.infrastructure },
    { name: t("accident"), value: stats.byType.accident },
  ].filter((d) => d.value > 0);

  return (
    <ChartCard title={t("chartCategoryDist")}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={32}
            formatter={(value) => (
              <span style={{ fontSize: 11, color: "var(--color-foreground)" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ResolutionRateChart({ stats }: { stats: DashboardStats }) {
  const { t } = useApp();
  const total = stats.totalReports || 1;
  const rate = Math.round((stats.byStatus.resolved / total) * 100);
  const data = [
    { name: t("resolved"), value: stats.byStatus.resolved },
    { name: t("kpiPending"), value: total - stats.byStatus.resolved },
  ];

  return (
    <ChartCard title={t("chartResolutionRate")}>
      <div className="flex items-center justify-center gap-6">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              <Cell fill="var(--resolved)" />
              <Cell fill="var(--color-border)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          <p className="font-display text-4xl text-resolved-deep">{rate}%</p>
          <p className="text-xs text-muted-foreground">{t("chartResolutionRate")}</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-resolved" />
              {stats.byStatus.resolved} {t("resolved")}
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-border" />
              {total - stats.byStatus.resolved} {t("kpiPending")}
            </span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

export function ResponseTimeChart() {
  const { t } = useApp();
  // Simulated hourly response times
  const data = [
    { hour: "6AM", time: 45 },
    { hour: "8AM", time: 32 },
    { hour: "10AM", time: 28 },
    { hour: "12PM", time: 35 },
    { hour: "2PM", time: 22 },
    { hour: "4PM", time: 18 },
    { hour: "6PM", time: 25 },
    { hour: "8PM", time: 38 },
    { hour: "10PM", time: 42 },
  ];

  return (
    <ChartCard title={t("chartAvgResponseTime")}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            width={28}
            unit="m"
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value} min`, t("chartAvgResponseTime")]}
          />
          <Line
            type="monotone"
            dataKey="time"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--color-primary)" }}
            activeDot={{ r: 5, fill: "var(--color-primary)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
