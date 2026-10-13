import { Alert, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  HiArrowDownTray,
  HiArrowTrendingDown,
  HiArrowTrendingUp,
  HiBanknotes,
  HiCalendarDays,
  HiChartBarSquare,
  HiCheckCircle,
  HiUserGroup,
  HiBolt,
  HiTrophy,
  HiClock,
} from "react-icons/hi2";
import api, { getErrorMessage } from "../../../services/apiClient";
import Skeleton from "../../../components/ui/Skeleton";

/* ==================== TYPES ==================== */

type Report = {
  period: { from: string; to: string };
  metrics: {
    newClients: number;
    wonDeals: number;
    revenue: number;
    conversion: number;
    changes: Record<string, number>;
  };
  monthly: {
    label: string;
    newClients: number;
    wonDeals: number;
    revenue: number;
  }[];
  statuses: { key: string; label: string; count: number; percent: number }[];
  topCompanies: {
    company: string;
    clients: number;
    wonDeals: number;
    conversion: number;
    revenue: number;
  }[];
};

/* ==================== FORMATTERS ==================== */

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("en-US");

const COLORS = ["#4f6ff2", "#75a8eb", "#fbb72c", "#23bb8b", "#ec6684"];

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const monthAgo = () => daysAgo(29);

/* ==================== PRESETS ==================== */

const RANGE_PRESETS = [
  { key: "today", label: "Bugun", from: today, to: today },
  { key: "7d", label: "7 kun", from: () => daysAgo(6), to: today },
  { key: "30d", label: "30 kun", from: () => daysAgo(29), to: today },
  { key: "90d", label: "90 kun", from: () => daysAgo(89), to: today },
  {
    key: "year",
    label: "Bu yil",
    from: () => `${new Date().getFullYear()}-01-01`,
    to: today,
  },
] as const;

/* ==================== MAIN ==================== */

export default function Reports() {
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [activePreset, setActivePreset] = useState<string>("30d");

  const changeFrom = (value: string) => {
    setFrom(value);
    if (value > to) setTo(value);
    setActivePreset("custom");
  };
  const changeTo = (value: string) => {
    setTo(value);
    if (value < from) setFrom(value);
    setActivePreset("custom");
  };

  const applyPreset = (preset: (typeof RANGE_PRESETS)[number]) => {
    setFrom(preset.from());
    setTo(preset.to());
    setActivePreset(preset.key);
  };

  const report = useQuery<Report>({
    queryKey: ["reports", from, to],
    queryFn: async () =>
      (await api.get("/reports", { params: { from, to } })).data,
  });

  const data = report.data;

  const metricCards = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: "newClients",
        label: "Yangi mijozlar",
        value: number.format(data.metrics.newClients),
        icon: HiUserGroup,
        accent: "#4f6ff2",
        tint: "bg-blue-50 text-blue-600",
      },
      {
        key: "wonDeals",
        label: "Yopilgan bitimlar",
        value: number.format(data.metrics.wonDeals),
        icon: HiCheckCircle,
        accent: "#10b981",
        tint: "bg-emerald-50 text-emerald-600",
      },
      {
        key: "revenue",
        label: "Umumiy daromad",
        value: currency.format(data.metrics.revenue),
        icon: HiBanknotes,
        accent: "#8b5cf6",
        tint: "bg-violet-50 text-violet-600",
      },
      {
        key: "conversion",
        label: "Konversiya",
        value: `${data.metrics.conversion}%`,
        icon: HiChartBarSquare,
        accent: "#f59e0b",
        tint: "bg-amber-50 text-amber-600",
      },
    ];
  }, [data]);

  const hasData = Boolean(
    data?.monthly.some((i) => i.newClients || i.wonDeals || i.revenue),
  );

  const totalClients =
    data?.statuses.reduce((sum, s) => sum + s.count, 0) ?? 0;

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ["Kompaniya", "Yangi mijozlar", "Yopilgan bitimlar", "Konversiya", "Daromad"],
      ...data.topCompanies.map((item) => [
        item.company,
        item.clients,
        item.wonDeals,
        `${item.conversion}%`,
        item.revenue,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((i) => `"${String(i).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `hisobot-${from}-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const periodLabel = useMemo(() => {
    const fmt = (s: string) =>
      new Date(s).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    return `${fmt(from)} — ${fmt(to)}`;
  }, [from, to]);

  return (
    <section className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 lg:px-8">
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-[25px] font-bold tracking-tight text-[#19233b]">
            Hisobotlar
            {report.isFetching && (
              <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600">
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Yangilanmoqda
              </span>
            )}
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            Savdo ko'rsatkichlari va mijozlar tahlili.
          </p>
        </div>
        <Button
          onClick={exportCsv}
          disabled={!data?.topCompanies.length || report.isFetching}
          variant="contained"
          startIcon={<HiArrowDownTray />}
          sx={{
            height: 40,
            borderRadius: "10px",
            bgcolor: "#5657e9",
            textTransform: "none",
            fontWeight: 700,
            px: 2.25,
            boxShadow: "0 4px 14px rgba(86,87,233,.28)",
            "&:hover": { bgcolor: "#4849cf", boxShadow: "0 6px 20px rgba(86,87,233,.35)" },
          }}
        >
          CSV eksport
        </Button>
      </div>

      {/* ==================== PERIOD TOOLBAR ==================== */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-[0_4px_16px_-8px_rgba(15,23,42,.1)]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-50 p-1">
            {RANGE_PRESETS.map((p) => {
              const active = activePreset === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p)}
                  className={`h-8 rounded-lg px-3 text-[12px] font-bold transition ${
                    active
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <span className="hidden h-6 w-px bg-slate-200 sm:block" />

          {/* Custom range */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
            <HiCalendarDays className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              max={to}
              value={from}
              onChange={(e) => changeFrom(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-600 outline-none"
              aria-label="Boshlanish sanasi"
            />
            <span className="text-slate-300">—</span>
            <input
              type="date"
              min={from}
              max={today()}
              value={to}
              onChange={(e) => changeTo(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-600 outline-none"
              aria-label="Tugash sanasi"
            />
          </div>

          <span className="ml-auto hidden items-center gap-1.5 text-[11px] font-semibold text-slate-400 sm:flex">
            <HiClock className="h-3.5 w-3.5" />
            {periodLabel}
          </span>
        </div>
      </div>

      {/* ==================== CONTENT ==================== */}
      {report.isError ? (
        <Alert className="mt-6" severity="error">
          Hisobotni yuklab bo'lmadi: {getErrorMessage(report.error)}
        </Alert>
      ) : report.isLoading ? (
        <ReportsSkeleton />
      ) : (
        data && (
          <>
            {/* ---- METRIC CARDS ---- */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metricCards.map(({ key, ...card }) => (
                <MetricCard
                  key={key}
                  {...card}
                  change={data.metrics.changes[key] || 0}
                />
              ))}
            </div>

            {/* ---- CHARTS ROW ---- */}
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.8fr_1fr]">
              {/* Bar chart */}
              <Card
                title="Oylik ko'rsatkichlar"
                subtitle="Yangi mijozlar va yopilgan bitimlar dinamikasi"
                icon={<HiChartBarSquare className="h-4 w-4" />}
              >
                <div className="h-[280px]">
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.monthly}
                        margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={{ stroke: "#edf0f3" }}
                          tick={{ fill: "#8e98ab", fontSize: 11, fontWeight: 600 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "#a4adbd", fontSize: 11 }}
                        />
                        <RTooltip
                          cursor={{ fill: "#f5f7ff", radius: 8 }}
                          contentStyle={{
                            borderRadius: 10,
                            border: "1px solid #e5e7eb",
                            fontSize: 12,
                            boxShadow: "0 8px 24px -8px rgba(15,23,42,.15)",
                          }}
                          formatter={(value, name) => [
                            name === "Daromad"
                              ? currency.format(Number(value))
                              : `${value} ta`,
                            name,
                          ]}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 4 }}
                        />
                        <Bar
                          dataKey="newClients"
                          name="Yangi mijozlar"
                          fill="#5570ef"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={28}
                        />
                        <Bar
                          dataKey="wonDeals"
                          name="Yopilgan bitimlar"
                          fill="#23bb8b"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={28}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Empty label="Tanlangan davrda ma'lumot yo'q." />
                  )}
                </div>
              </Card>

              {/* Pie chart */}
              <Card
                title="Mijozlar holati"
                subtitle="Status bo'yicha taqsimot"
                icon={<HiUserGroup className="h-4 w-4" />}
              >
                <div className="flex h-[280px] flex-col">
                  {data.statuses.some((s) => s.count) ? (
                    <>
                      <div className="relative h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.statuses.filter((s) => s.count)}
                              dataKey="count"
                              nameKey="label"
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={72}
                              paddingAngle={3}
                              stroke="none"
                            >
                              {data.statuses
                                .filter((s) => s.count)
                                .map((s, i) => (
                                  <Cell key={s.key} fill={COLORS[i]} />
                                ))}
                            </Pie>
                            <RTooltip
                              formatter={(value, name) => [`${value} ta`, name]}
                              contentStyle={{
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                                fontSize: 12,
                                boxShadow: "0 8px 24px -8px rgba(15,23,42,.15)",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Center total */}
                        <div className="pointer-events-none absolute inset-0 grid place-items-center">
                          <div className="text-center">
                            <div className="text-[22px] font-bold leading-none text-[#1f2a44]">
                              {totalClients}
                            </div>
                            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              jami
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
                        {data.statuses.map((s, i) =>
                          s.count ? (
                            <div
                              key={s.key}
                              className="flex items-center gap-1.5"
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: COLORS[i] }}
                              />
                              <span className="text-[11px] font-semibold text-slate-500">
                                {s.label}
                              </span>
                              <span className="text-[11px] font-bold text-slate-700">
                                {s.count}
                              </span>
                            </div>
                          ) : null,
                        )}
                      </div>
                    </>
                  ) : (
                    <Empty label="Leadlar hali qo'shilmagan." />
                  )}
                </div>
              </Card>
            </div>

            {/* ---- SECOND ROW ---- */}
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.8fr_1fr]">
              <Card
                title="Eng yaxshi kompaniyalar"
                subtitle="Mijozlar, bitimlar va daromad bo'yicha reyting"
                icon={<HiTrophy className="h-4 w-4" />}
              >
                <TopCompanies items={data.topCompanies} />
              </Card>

              <Card
                title="Status taqsimoti"
                subtitle="Foiz ko'rsatkichlari"
                icon={<HiBolt className="h-4 w-4" />}
              >
                <div className="space-y-4">
                  {data.statuses.map((item, index) => (
                    <div key={item.key}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[index] }}
                          />
                          <span className="font-semibold text-slate-600">
                            {item.label}
                          </span>
                        </div>
                        <span className="font-bold text-slate-500">
                          {item.count}{" "}
                          <span className="ml-1 text-slate-400">
                            {item.percent}%
                          </span>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percent}%`,
                            backgroundColor: COLORS[index],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )
      )}
    </section>
  );
}

/* ==================== SUB: METRIC CARD ==================== */

function MetricCard({
  label,
  value,
  icon: Icon,
  tint,
  accent,
  change,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  accent: string;
  change: number;
}) {
  const positive = change >= 0;
  const TrendIcon = positive ? HiArrowTrendingUp : HiArrowTrendingDown;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_16px_-5px_rgba(15,23,42,.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-10px_rgba(15,23,42,.18)]">
      {/* Top accent on hover */}
      <span
        className="absolute inset-x-0 top-0 h-1 opacity-0 transition group-hover:opacity-100"
        style={{ backgroundColor: accent }}
      />

      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-1.5 truncate text-[26px] font-bold leading-none tracking-tight text-[#1f2a44]">
            {value}
          </p>
        </div>
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint} transition group-hover:scale-110`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-bold ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          <TrendIcon className="h-3 w-3" />
          {positive ? "+" : ""}
          {change}%
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          avvalgi davrga nisbatan
        </span>
      </div>
    </div>
  );
}

/* ==================== SUB: CARD ==================== */

function Card({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_16px_-5px_rgba(15,23,42,.08)]">
      <div className="mb-4 flex items-center gap-2.5">
        {icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-[15px] font-bold leading-tight text-[#263149]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-[11.5px] text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ==================== SUB: EMPTY ==================== */

function Empty({ label }: { label: string }) {
  return (
    <div className="grid h-full place-items-center text-center">
      <div>
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-400">
          <HiChartBarSquare className="h-5.5 w-5.5" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

/* ==================== SUB: TOP COMPANIES ==================== */

const MEDALS = ["🥇", "🥈", "🥉"];

function TopCompanies({ items }: { items: Report["topCompanies"] }) {
  if (!items.length)
    return (
      <Empty label="Kompaniyali leadlar paydo bo'lganda jadval ko'rinadi." />
    );

  const maxRevenue = Math.max(...items.map((i) => i.revenue), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[580px] text-left text-xs">
        <thead className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
          <tr>
            <th className="pb-2.5 pl-1"># Kompaniya</th>
            <th className="pb-2.5 text-right">Mijozlar</th>
            <th className="pb-2.5 text-right">Bitimlar</th>
            <th className="pb-2.5 text-right">Konversiya</th>
            <th className="pb-2.5 pr-1 text-right">Daromad</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.company}
              className="group border-b border-slate-50 transition last:border-0 hover:bg-indigo-50/30"
            >
              <td className="py-3 pl-1">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center text-base">
                    {MEDALS[index] ?? (
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                        {index + 1}
                      </span>
                    )}
                  </span>
                  <span className="truncate font-bold text-slate-700">
                    {item.company}
                  </span>
                </div>
              </td>
              <td className="py-3 text-right font-semibold text-slate-600">
                {item.clients}
              </td>
              <td className="py-3 text-right font-semibold text-slate-600">
                {item.wonDeals}
              </td>
              <td className="py-3 text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10.5px] font-bold text-indigo-600">
                  {item.conversion}%
                </span>
              </td>
              <td className="py-3 pr-1 text-right">
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-emerald-600">
                    {currency.format(item.revenue)}
                  </span>
                  <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{
                        width: `${(item.revenue / maxRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ==================== SUB: SKELETON ==================== */

function ReportsSkeleton() {
  return (
    <div className="mt-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.8fr_1fr]">
        <Skeleton className="h-[360px] rounded-2xl" />
        <Skeleton className="h-[360px] rounded-2xl" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.8fr_1fr]">
        <Skeleton className="h-[320px] rounded-2xl" />
        <Skeleton className="h-[320px] rounded-2xl" />
      </div>
    </div>
  );
}