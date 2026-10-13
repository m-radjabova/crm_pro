import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { useEffect } from "react";
import {
  HiExclamationTriangle,
  HiTrash,
  HiInformationCircle,
  HiXMark,
} from "react-icons/hi2";

type Variant = "danger" | "warning" | "info";

type Props = {
  open: boolean;
  title?: string;
  description: string;
  loading?: boolean;
  variant?: Variant;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
};

const VARIANTS: Record<
  Variant,
  {
    Icon: typeof HiExclamationTriangle;
    tint: string;
    glow: string;
    gradient: string;
    button: string;
    buttonHover: string;
    buttonShadow: string;
    defaultTitle: string;
    defaultConfirm: string;
  }
> = {
  danger: {
    Icon: HiTrash,
    tint: "bg-rose-50 text-rose-500",
    glow: "bg-rose-300/40",
    gradient: "linear-gradient(135deg, #f87171, #e9546b)",
    button: "#e9546b",
    buttonHover: "#d8455d",
    buttonShadow: "0 6px 18px -6px rgba(233,84,107,.55)",
    defaultTitle: "O'chirishni tasdiqlang",
    defaultConfirm: "Ha, o'chirish",
  },
  warning: {
    Icon: HiExclamationTriangle,
    tint: "bg-amber-50 text-amber-500",
    glow: "bg-amber-300/40",
    gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    button: "#f59e0b",
    buttonHover: "#d97706",
    buttonShadow: "0 6px 18px -6px rgba(245,158,11,.55)",
    defaultTitle: "Diqqat",
    defaultConfirm: "Davom etish",
  },
  info: {
    Icon: HiInformationCircle,
    tint: "bg-indigo-50 text-indigo-500",
    glow: "bg-indigo-300/40",
    gradient: "linear-gradient(135deg, #6b6af4, #4c4ae0)",
    button: "#5657e9",
    buttonHover: "#4849cf",
    buttonShadow: "0 6px 18px -6px rgba(86,87,233,.55)",
    defaultTitle: "Tasdiqlang",
    defaultConfirm: "Tasdiqlash",
  },
};

export default function ConfirmDialog({
  open,
  title,
  description,
  loading = false,
  variant = "danger",
  confirmText,
  cancelText = "Bekor qilish",
  onClose,
  onConfirm,
}: Props) {
  const meta = VARIANTS[variant];

  // Klaviatura: Enter = confirm, Esc = close
  useEffect(() => {
    if (!open || loading) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onConfirm, onClose]);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 24px 60px -20px rgba(15,23,42,.35)",
          },
        },
        backdrop: {
          sx: {
            backgroundColor: "rgba(15,23,42,.45)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: "relative" }}>
        {!loading && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 z-10 grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Yopish"
          >
            <HiXMark className="h-4.5 w-4.5" />
          </button>
        )}

        {/* ---- Header ---- */}
        <div className="relative px-6 pb-2 pt-7 text-center">
          {/* Glow */}
          <span
            className={`pointer-events-none absolute left-1/2 top-4 h-24 w-24 -translate-x-1/2 rounded-full blur-3xl ${meta.glow}`}
          />

          {/* Icon badge */}
          <div className="relative mx-auto grid h-16 w-16 place-items-center">
            {/* Pulse ring */}
            <span
              className={`absolute inset-0 animate-[confirm-ring_2s_ease-out_infinite] rounded-2xl ${meta.tint}`}
            />
            <div
              className="relative grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg"
              style={{
                background: meta.gradient,
                boxShadow: meta.buttonShadow,
              }}
            >
              <meta.Icon className="h-8 w-8 drop-shadow-[0_2px_4px_rgba(0,0,0,.15)]" />
            </div>
          </div>

          {/* Title */}
          <h2 className="relative mt-5 text-[17px] font-bold leading-snug tracking-tight text-[#273249]">
            {title ?? meta.defaultTitle}
          </h2>

          {/* Description */}
          <p className="relative mx-auto mt-2 max-w-[320px] text-[13.5px] leading-relaxed text-slate-500">
            {description}
          </p>
        </div>
      </DialogContent>

      {/* ---- Actions ---- */}
      <DialogActions
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1.25,
          px: 3,
          pb: 3,
          pt: 3,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          disableElevation
          sx={{
            height: 42,
            borderRadius: "11px",
            bgcolor: "#f1f5f9",
            color: "#475569",
            textTransform: "none",
            fontWeight: 700,
            fontSize: 13,
            "&:hover": { bgcolor: "#e2e8f0" },
            "&.Mui-disabled": { bgcolor: "#f8fafc", color: "#cbd5e1" },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          disableElevation
          sx={{
            height: 42,
            borderRadius: "11px",
            bgcolor: meta.button,
            textTransform: "none",
            fontWeight: 700,
            fontSize: 13,
            boxShadow: meta.buttonShadow,
            "&:hover": {
              bgcolor: meta.buttonHover,
              boxShadow: meta.buttonShadow,
            },
            "&.Mui-disabled": {
              bgcolor: meta.button,
              color: "#fff",
              opacity: 0.7,
            },
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  opacity="0.3"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Bajarilmoqda...
            </span>
          ) : (
            confirmText ?? meta.defaultConfirm
          )}
        </Button>
      </DialogActions>

      <style>{`
        @keyframes confirm-ring {
          0%   { transform: scale(1);    opacity: .55; }
          100% { transform: scale(1.55); opacity: 0;   }
        }
      `}</style>
    </Dialog>
  );
}