import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-slate-50 text-slate-900 lg:grid-cols-[47%_53%]">
      <section className="relative hidden min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#0f1e5c] via-[#2439a8] to-[#5b4cf5] px-[8%] py-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -right-24 h-[500px] w-[500px] rounded-full bg-indigo-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
            <span className="text-lg">◆</span>
          </span>
          <p className="text-xl font-bold tracking-tight">CRM Pro</p>
        </div>

        <div className="relative z-10 my-auto w-full max-w-[510px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-indigo-100 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Yangi avlod CRM platformasi
          </span>

          <h1 className="mt-6 text-[clamp(2rem,3vw,2.75rem)] font-bold leading-[1.15] tracking-tight">
            Mijozlarni boshqaring.
            <br />
            <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
              Biznesingizni rivojlantiring.
            </span>
          </h1>

          <p className="mt-4 max-w-[480px] text-base leading-7 text-indigo-100/90">
            Mijozlar, sotuvlar, vazifalar va jamoangiz faoliyatini yagona qulay
            platformada boshqaring.
          </p>

          <div
            aria-hidden="true"
            className="mt-12 rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-md transition-transform duration-500 hover:-translate-y-1"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-base">◆</span> CRM Dashboard
              </p>
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400/70" />
                <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
                <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
              </div>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-3">
              {[
                { label: "Mijozlar", value: "1,248" },
                { label: "Sotuvlar", value: "₽4.2M" },
                { label: "Vazifalar", value: "36" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <p className="text-[10px] uppercase tracking-wider text-indigo-200/80">
                    {s.label}
                  </p>
                  <p className="mt-1 text-sm font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-400 to-teal-300" />
                </div>
                <span className="text-[11px] font-medium text-indigo-100">
                  78%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-indigo-300 to-blue-300" />
                </div>
                <span className="text-[11px] font-medium text-indigo-100">
                  62%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[91%] rounded-full bg-gradient-to-r from-pink-300 to-fuchsia-300" />
                </div>
                <span className="text-[11px] font-medium text-indigo-100">
                  91%
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-indigo-200/70">
          © {new Date().getFullYear()} CRM Pro. Barcha huquqlar himoyalangan.
        </p>
      </section>

      <section className="relative flex min-h-screen flex-col px-6 py-8 sm:px-12 lg:px-[14%] lg:py-12">
        <div className="flex items-center gap-2.5 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#243465] to-[#564cf1] text-white">
            <span className="text-lg">◆</span>
          </span>
          <p className="text-xl font-bold tracking-tight text-[#243465]">
            CRM <span className="text-[#8c94f5]">Pro</span>
          </p>
        </div>

        <div className="hidden items-center gap-2.5 lg:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#243465] to-[#564cf1] text-white shadow-lg shadow-indigo-500/20">
            <span className="text-lg">◆</span>
          </span>
          <p className="text-xl font-bold tracking-tight text-[#243465]">
            CRM <span className="text-[#8c94f5]">Pro</span>
          </p>
        </div>

        <div className="my-auto w-full max-w-[490px] self-center py-10">
          {children}
        </div>
      </section>
    </main>
  );
}
