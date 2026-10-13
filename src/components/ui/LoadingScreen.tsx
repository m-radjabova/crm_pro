type Props = {
  fullscreen?: boolean;
  label?: string;
};

/** Ilovaning hamma asosiy yuklanish holati uchun yagona loader. */
export function LoadingIndicator({ fullscreen = false, label = "Yuklanmoqda..." }: Props) {
  return (
    <div
      className={`grid place-items-center ${fullscreen ? "min-h-screen bg-[#f5f7fc]" : "min-h-72"}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="crm-loader" aria-hidden="true" />
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
    </div>
  );
}

export default function LoadingScreen() {
  return <LoadingIndicator fullscreen />;
}
