import { Alert } from "@mui/material";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiCheck,
  HiUsers,
  HiBriefcase,
  HiCurrencyDollar,
  HiClipboardDocumentList,
  HiSparkles,
} from "react-icons/hi2";
import api, { getErrorMessage, getSession } from "../../services/apiClient";
import Skeleton from "../../components/ui/Skeleton";

type DashboardData = {
  metrics: {
    totalClients: number;
    activeDeals: number;
    salesVolume: number;
    openTasks: number;
  };
  changes: Record<string, number>;
  monthlySales: { month: string; total: number }[];
  leadStatuses: { name: string; value: number; percent: number }[];
  recentActivities: { id: string; text: string; updatedAt: string }[];
};

const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("en-US");

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/dashboard/manager")
      .then(({ data: next }) => setData(next))
      .catch((e) => setError(getErrorMessage(e)));
  }, []);

  if (error)
    return (
      <Alert severity="error" className="rounded-xl">
        Dashboard ma&apos;lumotlarini yuklab bo&lsquo;lmadi: {error}
      </Alert>
    );

  if (!data) return <DashboardSkeleton />;

  const user = getSession()?.user;

  const cards = [
    {
      title: "Jami mijozlar",
      value: number.format(data.metrics.totalClients),
      key: "totalClients",
      icon: HiUsers,
      gradient: "from-indigo-500 to-blue-500",
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
    {
      title: "Faol bitimlar",
      value: number.format(data.metrics.activeDeals),
      key: "activeDeals",
      icon: HiBriefcase,
      gradient: "from-violet-500 to-purple-500",
      bg: "bg-violet-50",
      text: "text-violet-600",
    },
    {
      title: "Sotuv hajmi",
      value: money.format(data.metrics.salesVolume),
      key: "salesVolume",
      icon: HiCurrencyDollar,
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      title: "Ochiq vazifalar",
      value: number.format(data.metrics.openTasks),
      key: "openTasks",
      icon: HiClipboardDocumentList,
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
  ];

  const hasSales = data.monthlySales.some((item) => item.total > 0);
  const hasStatuses = data.leadStatuses.some((item) => item.value > 0);
  const totalLeads = data.leadStatuses.reduce((s, i) => s + i.value, 0);

  return (
    <section className="mx-auto max-w-[1100px] animate-[fadeIn_0.4s_ease-out] px-1">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-[28px] font-bold tracking-tight text-transparent">
              Dashboard
            </h1>
            <span className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
              Live
            </span>
          </div>
          <p className="mt-1 text-[13px] text-slate-500">
            Xush kelibsiz,{" "}
            <span className="font-semibold text-slate-700">
              {user?.fullName?.split(" ")[0] || "Manager"}
            </span>
            ! Bugungi biznes ko&lsquo;rsatkichlari.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, i) => {
          const change = data.changes[card.key] || 0;
          const Icon = card.icon;
          const isPositive = change >= 0;
          return (
            <div
              key={card.key}
              style={{ animationDelay: `${i * 60}ms` }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06),0_16px_40px_-12px_rgba(15,23,42,0.12)] animate-[slideUp_0.5s_ease-out_backwards]"
            >
              {/* Gradient accent bar */}
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.gradient}`}
              />

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[11.5px] font-medium uppercase tracking-wide text-slate-400">
                    {card.title}
                  </p>
                  <p className="mt-2 text-[26px] font-bold leading-tight tracking-tight text-slate-900">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.bg} ${card.text} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    isPositive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {isPositive ? (
                    <HiArrowTrendingUp className="h-3 w-3" />
                  ) : (
                    <HiArrowTrendingDown className="h-3 w-3" />
                  )}
                  {change > 0 ? `+${change}%` : change < 0 ? `${change}%` : "0%"}
                </span>
                <span className="text-[11px] text-slate-400">oxirgi oy</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.8fr_1fr]">
        {/* Sales Chart */}
        <div className="animate-[slideUp_0.5s_ease-out_0.2s_backwards] rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-800">
                Sotuvlar dinamikasi
              </h2>
              <p className="mt-0.5 text-[11.5px] text-slate-400">
                Oylik sotuv hajmi (USD)
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <HiSparkles className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 h-[240px]">
            {hasSales ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.monthlySales}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.85} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                    dy={6}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#cbd5e1", fontSize: 10 }}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc", radius: 8 }}
                    formatter={(value) => [money.format(Number(value)), "Sotuv"]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                      boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                      padding: "8px 12px",
                    }}
                    labelStyle={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}
                  />
                  <Bar
                    dataKey="total"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty label="Sotuvlar paydo bo'lganda grafik shu yerda ko'rinadi." />
            )}
          </div>
        </div>

        {/* Lead Statuses */}
        <div className="animate-[slideUp_0.5s_ease-out_0.3s_backwards] rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-slate-800">
                Leads holati
              </h2>
              <p className="mt-0.5 text-[11.5px] text-slate-400">
                Jami {number.format(totalLeads)} ta lead
              </p>
            </div>
          </div>

          <div className="relative mt-4 h-[160px]">
            {hasStatuses ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.leadStatuses.filter((s) => s.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {data.leadStatuses
                        .filter((s) => s.value > 0)
                        .map((_, index) => (
                          <Cell key={index} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} ta`, name]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                        boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                        padding: "8px 12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[22px] font-bold text-slate-900">
                    {number.format(totalLeads)}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">
                    Jami
                  </span>
                </div>
              </>
            ) : (
              <Empty label="Leadlar hali yo'q" />
            )}
          </div>

          <div className="mt-5 space-y-2.5">
            {data.leadStatuses.map((status, index) => (
              <div
                key={status.name}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: colors[index % colors.length],
                      boxShadow: `0 0 0 3px ${colors[index % colors.length]}20`,
                    }}
                  />
                  <span className="text-[12.5px] font-medium text-slate-600">
                    {status.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold text-slate-800">
                    {status.value}
                  </span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-500">
                    {status.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mt-5 animate-[slideUp_0.5s_ease-out_0.4s_backwards] rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">
              Oxirgi faoliyatlar
            </h2>
            <p className="mt-0.5 text-[11.5px] text-slate-400">
              Eng so'nggi harakatlar
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-semibold text-slate-500">
            {data.recentActivities.length} ta
          </span>
        </div>

        {data.recentActivities.length ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.recentActivities.map((activity, i) => (
              <div
                key={activity.id}
                style={{ animationDelay: `${i * 40}ms` }}
                className="group flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 transition-all duration-200 hover:border-indigo-100 hover:bg-indigo-50/40 animate-[fadeIn_0.4s_ease-out_backwards]"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm transition-transform duration-200 group-hover:scale-110">
                  <HiCheck className="h-3.5 w-3.5" strokeWidth={3} />
                </div>
                <span className="truncate text-[12.5px] font-medium text-slate-600">
                  {activity.text}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-[12.5px] text-slate-400">
            Hali faoliyat yo'q. Birinchi leadni qo'shing.
          </p>
        )}
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

/* ---------------- Skeleton ---------------- */

function DashboardSkeleton() {
  return (
    <section
      className="mx-auto max-w-[1100px] px-1"
      aria-label="Dashboard yuklanmoqda"
      aria-busy="true"
    >
      {/* Header */}
      <Skeleton className="h-8 w-44 rounded-lg" />
      <Skeleton className="mt-2 h-4 w-72 max-w-full rounded" />

      {/* Cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/70 bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="mt-3 h-7 w-24 rounded-md" />
              </div>
              <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
            <Skeleton className="mt-4 h-5 w-24 rounded-full" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.8fr_1fr]">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="mt-2 h-3 w-32 rounded" />
          <div className="mt-8 flex h-[200px] items-end gap-3 px-2">
            {[42, 64, 48, 76, 58, 86, 67, 92, 72, 84, 61, 78].map(
              (height, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t-md"
                  style={{ height: `${height}%` } as React.CSSProperties}
                />
              )
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="mt-2 h-3 w-24 rounded" />
          <div className="relative mx-auto mt-6 h-40 w-40">
            <Skeleton className="h-40 w-40 rounded-full" />
            <div className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-white" />
          </div>
          <div className="mt-5 space-y-2.5">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-6 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Activities */}
      <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-6">
        <Skeleton className="h-4 w-36 rounded" />
        <Skeleton className="mt-2 h-3 w-40 rounded" />
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Helpers ---------------- */

function Empty({ label }: { label: string }) {
  return (
    <div className="grid h-full place-items-center px-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <HiSparkles className="h-4 w-4 text-slate-400" />
        </div>
        <p className="max-w-[220px] text-[12px] leading-relaxed text-slate-400">
          {label}
        </p>
      </div>
    </div>
  );
}