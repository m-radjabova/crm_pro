import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiXCircle,
  HiXMark,
} from "react-icons/hi2";

type Variant = "success" | "error" | "warning" | "info" | "loading";

const variants = {
  success: {
    Icon: HiCheckCircle,
    accent: "#10b981",
    gradient: "linear-gradient(135deg, #34d399, #10b981)",
  },
  error: {
    Icon: HiXCircle,
    accent: "#e9546b",
    gradient: "linear-gradient(135deg, #f87171, #e9546b)",
  },
  warning: {
    Icon: HiExclamationTriangle,
    accent: "#f59e0b",
    gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
  },
  info: {
    Icon: HiInformationCircle,
    accent: "#5657e9",
    gradient: "linear-gradient(135deg, #6b6af4, #4c4ae0)",
  },
  loading: {
    Icon: HiInformationCircle,
    accent: "#5657e9",
    gradient: "linear-gradient(135deg, #6b6af4, #4c4ae0)",
  },
} as const;

type Props = {
  variant: Variant;
  message: string;
  closeToast?: () => void;
};

export default function PremiumToast({ variant, message, closeToast }: Props) {
  const { Icon, accent, gradient } = variants[variant];

  return (
    <div className="flex w-full items-start gap-3">
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white shadow-sm"
        style={{ background: gradient, boxShadow: `0 5px 12px -7px ${accent}` }}
      >
        {variant === "loading" ? (
          <span className="premium-toast__spinner" aria-label="Yuklanmoqda" />
        ) : (
          <Icon className="h-[18px] w-[18px]" />
        )}
      </span>
      <p className="min-w-0 flex-1 pt-0.5 text-[13px] font-medium leading-snug text-slate-700">
        {message}
      </p>
      {closeToast && variant !== "loading" ? (
        <button
          type="button"
          onClick={closeToast}
          className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Yopish"
        >
          <HiXMark className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
