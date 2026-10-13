import { Avatar } from "@mui/material";
import {
  HiArrowRightOnRectangle,
  HiClock,
  HiSparkles,
  HiShieldCheck,
  HiRocketLaunch,
  HiBell,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../../services/apiClient";

export default function UserWelcome() {
  const navigate = useNavigate();
  const user = getSession()?.user;
  const firstName = user?.fullName.split(" ")[0] || "Foydalanuvchi";
  const initials = user?.fullName
    .split(" ")
    .map((item) => item[0])
    .slice(0, 2)
    .join("");

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f5f7fc] px-5 py-8">
      {/* ==================== BACKGROUND MESH ==================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-indigo-200/40 blur-[100px]" />
        <div className="absolute -bottom-40 -right-24 h-[460px] w-[460px] rounded-full bg-sky-200/50 blur-[110px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/30 blur-[120px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      {/* ==================== CARD ==================== */}
      <section className="relative w-full max-w-[760px] animate-[card-in_.5s_cubic-bezier(.22,1,.36,1)] overflow-hidden rounded-[28px] border border-white/70 bg-white/85 px-7 py-10 text-center shadow-[0_28px_80px_-20px_rgba(48,63,135,.22)] backdrop-blur-xl sm:px-14 sm:py-14">
        {/* Inner top glow */}
        <span className="pointer-events-none absolute -top-32 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-indigo-300/30 blur-3xl" />

        <div className="relative">
          {/* ==================== HEADER ==================== */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#172c54] to-[#2a4784] text-white shadow-[0_6px_16px_-6px_rgba(23,44,84,.6)]">
                <span className="rotate-45 text-sm font-black leading-none">◆</span>
              </span>
              <div className="text-left">
                <div className="text-[17px] font-bold leading-none text-[#1d3156]">
                  CRM <span className="text-[#6265e9]">Pro</span>
                </div>
                <div className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                  Workspace
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Status pill */}
              <div className="hidden items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/70 px-2.5 py-1 sm:flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10.5px] font-bold text-emerald-700">
                  Faol
                </span>
              </div>

              {/* Avatar */}
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "#e9ebff",
                  color: "#5657e9",
                  fontSize: 13,
                  fontWeight: 800,
                  border: "2px solid #fff",
                  boxShadow: "0 4px 12px -4px rgba(86,87,233,.35)",
                }}
              >
                {initials}
              </Avatar>
            </div>
          </div>

          {/* ==================== HERO ICON ==================== */}
          <div className="relative mx-auto mt-12 grid h-24 w-24 place-items-center">
            {/* Pulse rings */}
            <span className="absolute inset-0 animate-[pulse-ring_2.5s_ease-out_infinite] rounded-[28px] bg-indigo-300/50" />
            <span className="absolute inset-0 animate-[pulse-ring_2.5s_ease-out_infinite_.8s] rounded-[28px] bg-indigo-300/50" />

            {/* Glow */}
            <span className="absolute -inset-4 rounded-full bg-indigo-300/40 blur-2xl" />

            {/* Icon */}
            <div className="relative grid h-20 w-20 animate-[float_3s_ease-in-out_infinite] place-items-center rounded-[24px] bg-gradient-to-br from-[#6968f2] to-[#4b49df] text-white shadow-[0_18px_40px_-10px_rgba(75,73,223,.55)]">
              <HiClock className="h-10 w-10 drop-shadow-[0_2px_6px_rgba(0,0,0,.15)]" />
              <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow-md">
                <HiSparkles className="h-3.5 w-3.5 text-amber-500" />
              </span>
            </div>
          </div>

          {/* ==================== BADGE ==================== */}
          <div className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#5758e9]">
            <HiSparkles className="h-3.5 w-3.5" />
            Xush kelibsiz
          </div>

          {/* ==================== TITLE ==================== */}
          <h1 className="mt-5 text-[34px] font-bold leading-tight tracking-tight text-[#1a2540] sm:text-[42px]">
            Salom,{" "}
            <span className="bg-gradient-to-br from-[#5758e9] via-[#6968f2] to-[#9194ff] bg-clip-text text-transparent">
              {firstName}
            </span>
            !
          </h1>

          {/* ==================== SUBTITLE ==================== */}
          <p className="mx-auto mt-4 max-w-[500px] text-[14px] leading-7 text-slate-500">
            Sizning CRM Pro profilingiz muvaffaqiyatli yaratildi. Siz uchun
            maxsus ish maydoni tayyorlanmoqda.
          </p>

          {/* ==================== INFO PILLS ==================== */}
          <div className="mx-auto mt-7 flex max-w-[480px] flex-wrap items-center justify-center gap-2">
            <Pill icon={<HiShieldCheck />} label="Xavfsiz ulanish" tone="emerald" />
            <Pill icon={<HiRocketLaunch />} label="Tez ishga tushish" tone="indigo" />
            <Pill icon={<HiBell />} label="Xabar yuboriladi" tone="amber" />
          </div>

          {/* ==================== PROGRESS ==================== */}
          <div className="mx-auto mt-9 max-w-[360px]">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-slate-400">Tayyorlanmoqda</span>
              <span className="text-[#5758e9]">62%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-indigo-50 ring-1 ring-indigo-100/60">
              <div className="h-full w-[62%] animate-[progress-fill_1.4s_cubic-bezier(.22,1,.36,1)] rounded-full bg-gradient-to-r from-[#5758e9] via-[#6b6af4] to-[#9194ff] shadow-[0_0_12px_rgba(87,88,233,.4)]" />
            </div>
            <p className="mt-3 text-[11.5px] font-medium text-slate-400">
              Yangiliklar tayyor bo'lganda sizga xabar beramiz
            </p>
          </div>

          {/* ==================== LOGOUT ==================== */}
          <button
            type="button"
            onClick={logout}
            className="group mt-9 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
          >
            <HiArrowRightOnRectangle className="h-4 w-4 text-slate-400 transition group-hover:text-slate-600" />
            Tizimdan chiqish
          </button>
        </div>
      </section>

      {/* ==================== ANIMATIONS ==================== */}
      <style>{`
        @keyframes card-in {
          from { opacity: 0; transform: translateY(16px) scale(.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);    opacity: .55; }
          100% { transform: scale(1.5);  opacity: 0;   }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes progress-fill {
          from { width: 0; }
          to   { width: 62%; }
        }
      `}</style>
    </main>
  );
}

/* ==================== SUB: PILL ==================== */

function Pill({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "emerald" | "indigo" | "amber";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 ring-inset ${tones[tone]}`}
    >
      <span className="text-[13px]">{icon}</span>
      {label}
    </span>
  );
}