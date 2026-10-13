import type { IconType } from "react-icons";
import {
  HiBuildingOffice2,
  HiCalendarDays,
  HiChartBarSquare,
  HiClipboardDocumentCheck,
  HiSparkles,
  HiBell,
  HiArrowRight,
  HiCheck,
  HiClock,
} from "react-icons/hi2";
import { useState } from "react";

type PageType = "companies" | "tasks" | "calendar" | "reports";

type Theme = {
  Icon: IconType;
  gradient: string;
  glow: string;
  soft: string;
  accent: string;
  text: string;
  ring: string;
};

type Content = {
  title: string;
  description: string;
  eta: string;
  progress: number;
  features: string[];
  theme: Theme;
};

const THEMES: Record<PageType, Theme> = {
  companies: {
    Icon: HiBuildingOffice2,
    gradient: "linear-gradient(135deg, #6b6af4, #4c4ae0)",
    glow: "bg-indigo-300/45",
    soft: "bg-indigo-50",
    accent: "#5657e9",
    text: "text-indigo-700",
    ring: "ring-indigo-100",
  },
  tasks: {
    Icon: HiClipboardDocumentCheck,
    gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    glow: "bg-amber-300/45",
    soft: "bg-amber-50",
    accent: "#f59e0b",
    text: "text-amber-700",
    ring: "ring-amber-100",
  },
  calendar: {
    Icon: HiCalendarDays,
    gradient: "linear-gradient(135deg, #34d399, #10b981)",
    glow: "bg-emerald-300/45",
    soft: "bg-emerald-50",
    accent: "#10b981",
    text: "text-emerald-700",
    ring: "ring-emerald-100",
  },
  reports: {
    Icon: HiChartBarSquare,
    gradient: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
    glow: "bg-violet-300/45",
    soft: "bg-violet-50",
    accent: "#8b5cf6",
    text: "text-violet-700",
    ring: "ring-violet-100",
  },
};

const CONTENT: Record<PageType, Content> = {
  companies: {
    title: "Kompaniyalar",
    description:
      "Hamkor kompaniyalarni bir joyda boshqaring — kontaktlar, bitimlar va tarix bilan.",
    eta: "2 hafta ichida",
    progress: 72,
    features: [
      "Kompaniya kartochkalari va tez qidiruv",
      "Kontaktlar va aloqa tarixi",
      "Bitimlar va konversiya statistikasi",
    ],
    theme: THEMES.companies,
  },
  tasks: {
    title: "Vazifalar",
    description:
      "Jamoa vazifalarini rejalashtiring, kuzatib boring va muddatlarni nazorat qiling.",
    eta: "3 hafta ichida",
    progress: 45,
    features: [
      "Kanban va ro'yxat ko'rinishlari",
      "Mas'ul shaxs va muddat belgilash",
      "Eslatmalar va bildirishnomalar",
    ],
    theme: THEMES.tasks,
  },
  calendar: {
    title: "Kalendar",
    description:
      "Uchrashuvlar, qo'ng'iroqlar va muhim sanalaringizni bir joyga jamlaymiz.",
    eta: "4 hafta ichida",
    progress: 58,
    features: [
      "Oy, hafta va kun ko'rinishlari",
      "Lead va kompaniya integratsiyasi",
      "Avtomatik eslatmalar",
    ],
    theme: THEMES.calendar,
  },
  reports: {
    title: "Hisobotlar",
    description:
      "Biznes ko'rsatkichlari bo'yicha chuqur tahlil va vizual hisobotlar.",
    eta: "5 hafta ichida",
    progress: 35,
    features: [
      "Savdo va konversiya ko'rsatkichlari",
      "Kompaniya va menejer reytingi",
      "CSV eksport va davr tanlash",
    ],
    theme: THEMES.reports,
  },
};

export default function ComingSoon({ page }: { page: PageType }) {
  const { title, description, eta, progress, features, theme } = CONTENT[page];
  const { Icon } = theme;
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <section className="relative mx-auto grid min-h-[calc(100vh-170px)] max-w-[1030px] place-items-center px-4 py-8">
      {/* ==================== BACKGROUND ==================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -left-24 -top-24 h-[320px] w-[320px] rounded-full blur-[90px] opacity-60 ${theme.glow}`}
        />
        <div
          className={`absolute -bottom-24 -right-20 h-[340px] w-[340px] rounded-full blur-[100px] opacity-50 ${theme.glow}`}
        />
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)",
            backgroundSize: "26px 26px",
            maskImage:
              "radial-gradient(ellipse at center, black 35%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 35%, transparent 75%)",
          }}
        />
      </div>

      {/* ==================== CARD ==================== */}
      <div className="relative w-full max-w-[680px] animate-[card-in_.55s_cubic-bezier(.22,1,.36,1)] overflow-hidden rounded-[28px] border border-white/70 bg-white/85 px-6 py-12 text-center shadow-[0_28px_80px_-20px_rgba(65,75,150,.22)] backdrop-blur-xl sm:px-12 sm:py-14">
        <div className="relative">
          {/* ==================== ICON ==================== */}
          <div className="relative mx-auto grid h-24 w-24 place-items-center">
            <span
              className={`absolute inset-0 animate-[pulse-ring_2.5s_ease-out_infinite] rounded-[28px] ${theme.soft}`}
            />
            <span
              className={`absolute inset-0 animate-[pulse-ring_2.5s_ease-out_infinite_.8s] rounded-[28px] ${theme.soft}`}
            />
            <span
              className={`absolute -inset-3 rounded-full blur-2xl ${theme.glow}`}
            />

            <div
              className="relative grid h-20 w-20 animate-[float_3s_ease-in-out_infinite] place-items-center rounded-[24px] text-white shadow-[0_18px_40px_-10px_rgba(75,73,223,.55)]"
              style={{ background: theme.gradient }}
            >
              <Icon className="h-10 w-10 drop-shadow-[0_2px_6px_rgba(0,0,0,.15)]" />
              <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow-md">
                <HiSparkles className="h-3.5 w-3.5 text-amber-500" />
              </span>
            </div>
          </div>

          {/* ==================== BADGE ==================== */}
          <div
            className={`mt-7 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] ${theme.soft} ${theme.text}`}
          >
            <HiSparkles className="h-3.5 w-3.5" />
            Tez kunda
          </div>

          {/* ==================== TITLE ==================== */}
          <h1 className="mt-4 text-[32px] font-bold leading-tight tracking-tight text-[#1a2540] sm:text-[38px]">
            {title}
          </h1>

          {/* ==================== DESCRIPTION ==================== */}
          <p className="mx-auto mt-3 max-w-[480px] text-[14px] leading-7 text-slate-500">
            {description}
          </p>

          {/* ==================== PROGRESS ==================== */}
          <div className="mx-auto mt-8 max-w-[380px]">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-slate-400">Ishlab chiqilmoqda</span>
              <span style={{ color: theme.accent }}>{progress}%</span>
            </div>
            <div className={`h-2 overflow-hidden rounded-full ring-1 ring-inset ${theme.soft} ${theme.ring}`}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: theme.gradient,
                  boxShadow: `0 0 12px ${theme.accent}66`,
                  animation: "progress-fill 1.4s cubic-bezier(.22,1,.36,1)",
                }}
              />
            </div>
          </div>

          {/* ==================== FEATURES ==================== */}
          <div className="mx-auto mt-8 max-w-[520px] rounded-2xl border border-slate-100 bg-slate-50/60 p-5 text-left">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-white text-slate-500 shadow-sm">
                <HiCheck className="h-3.5 w-3.5" />
              </span>
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Nima bo'ladi
              </span>
            </div>
            <ul className="space-y-2.5">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-[13px] text-slate-600"
                >
                  <span
                    className="mt-1.5 grid h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: theme.accent }}
                  />
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ==================== NOTIFY FORM ==================== */}
          <div className="mx-auto mt-7 max-w-[520px]">
            {!subscribed ? (
              <form
                onSubmit={subscribe}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <div className="relative flex-1">
                  <HiBell className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email manzilingiz"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[13px] font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:shadow-[0_0_0_4px_rgba(99,102,241,.08)] placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-5 text-[13px] font-bold text-white shadow-md transition hover:-translate-y-0.5"
                  style={{
                    background: theme.gradient,
                    boxShadow: `0 8px 20px -8px ${theme.accent}80`,
                  }}
                >
                  Xabar berish
                  <HiArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              <div
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold ${theme.soft} ${theme.text}`}
              >
                <HiCheck className="h-4 w-4" />
                Rahmat! Tayyor bo'lganda xabar beramiz.
              </div>
            )}
          </div>

          {/* ==================== ETA ==================== */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11.5px] font-semibold text-slate-400">
            <HiClock className="h-3.5 w-3.5" />
            Taxminiy tugash: <span className="text-slate-500">{eta}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes card-in {
          from { opacity: 0; transform: translateY(16px) scale(.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: .55; }
          100% { transform: scale(1.5); opacity: 0;   }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes progress-fill {
          from { width: 0; }
        }
      `}</style>
    </section>
  );
}