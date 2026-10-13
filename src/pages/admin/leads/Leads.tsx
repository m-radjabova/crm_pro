import { Avatar, Menu, MenuItem, Select, Tooltip } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType, DragEvent, ReactNode } from "react";
import {
  HiMagnifyingGlass,
  HiPlus,
  HiRectangleGroup,
  HiTableCells,
  HiTrash,
  HiPencilSquare,
  HiXMark,
  HiBuildingOffice2,
  HiCurrencyDollar,
  HiCalendarDays,
  HiUser,
  HiArrowTrendingUp,
  HiTrophy,
  HiInboxStack,
  HiEllipsisHorizontal,
  HiCheck,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../../../services/apiClient";
import { notify } from "../../../components/ui/notify";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import Skeleton from "../../../components/ui/Skeleton";
import type { Lead, LeadStatus } from "../../../types/crm";
import { formatUzDate } from "../../../utils/date";
import LeadModal from "./LeadModal";

/* ───────────────────────── Konfiguratsiya ───────────────────────── */

const STATUS_ORDER: LeadStatus[] = [
  "new",
  "in_progress",
  "proposal",
  "won",
  "lost",
];

const STATUS_META: Record<
  LeadStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  new: { label: "Yangi", dot: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  in_progress: { label: "Jarayonda", dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  proposal: { label: "Taklif", dot: "bg-violet-500", bg: "bg-violet-50", text: "text-violet-700" },
  won: { label: "Yutildi", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  lost: { label: "Yo'qotildi", dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-700" },
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const moneyCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const AVATAR_COLORS = [
  { bg: "#eef2ff", fg: "#4f46e5" },
  { bg: "#fdf2f8", fg: "#db2777" },
  { bg: "#ecfdf5", fg: "#059669" },
  { bg: "#fff7ed", fg: "#ea580c" },
  { bg: "#eff6ff", fg: "#2563eb" },
];
const colorOf = (name: string) =>
  AVATAR_COLORS[
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
      AVATAR_COLORS.length
  ];
const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/* MUI menyular uchun umumiy stil */
const menuPaperSx = {
  mt: 0.5,
  minWidth: 200,
  borderRadius: "14px",
  border: "1px solid #e8ebf3",
  boxShadow:
    "0 20px 40px -12px rgba(24,35,60,0.18), 0 4px 12px -4px rgba(24,35,60,0.06)",
  "& .MuiList-root": { p: 0.75 },
  "& .MuiMenuItem-root": {
    fontSize: 13.5,
    fontWeight: 500,
    minHeight: 38,
    gap: 1.25,
    borderRadius: "9px",
    color: "#334155",
  },
};

/* ───────────────────────── Asosiy sahifa ───────────────────────── */

export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [view, setView] = useState<"board" | "table">("board");
  const [modal, setModal] = useState<Lead | null | "new">(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .get("/leads", { params: { limit: 100 } })
      .then(({ data }) => {
        if (active) setLeads(data.leads);
      })
      .catch((error) => {
        if (active) notify.error(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  /* Qidiruv natijasi (status filtrisiz) — chip sonlari uchun */
  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) =>
      `${lead.name} ${lead.company || ""}`.toLowerCase().includes(q),
    );
  }, [leads, search]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: searched.length };
    STATUS_ORDER.forEach((s) => (result[s] = 0));
    searched.forEach((l) => {
      result[l.status] = (result[l.status] || 0) + 1;
    });
    return result;
  }, [searched]);

  const shown = useMemo(
    () =>
      filter === "all"
        ? searched
        : searched.filter((lead) => lead.status === filter),
    [searched, filter],
  );

  const stats = useMemo(() => {
    const total = leads.length;
    const won = leads.filter((l) => l.status === "won");
    const active = leads.filter(
      (l) => l.status !== "won" && l.status !== "lost",
    ).length;
    const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
    const wonValue = won.reduce((sum, l) => sum + (l.value || 0), 0);
    const conversion = total > 0 ? Math.round((won.length / total) * 100) : 0;
    return {
      total,
      active,
      wonValue,
      totalValue,
      average: total > 0 ? totalValue / total : 0,
      conversion,
      wonCount: won.length,
    };
  }, [leads]);

  const save = (saved: Lead) =>
    setLeads((old) =>
      old.some((lead) => lead.id === saved.id)
        ? old.map((lead) => (lead.id === saved.id ? saved : lead))
        : [saved, ...old],
    );

  const setStatus = async (lead: Lead, status: LeadStatus) => {
    if (lead.status === status) return;
    const previous = lead.status;
    setLeads((old) =>
      old.map((item) => (item.id === lead.id ? { ...item, status } : item)),
    );
    try {
      await api.patch(`/leads/${lead.id}/status`, { status });
      notify.success("Lead holati yangilandi");
    } catch (e) {
      setLeads((old) =>
        old.map((item) =>
          item.id === lead.id ? { ...item, status: previous } : item,
        ),
      );
      notify.error(getErrorMessage(e));
    }
  };

  const remove = async (lead: Lead) => {
    setDeleting(true);
    try {
      await api.delete(`/leads/${lead.id}`);
      setLeads((old) => old.filter((item) => item.id !== lead.id));
      notify.success("Lead o'chirildi");
      setLeadToDelete(null);
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  const isFiltering = search.trim() !== "" || filter !== "all";
  const resetFilters = () => {
    setSearch("");
    setFilter("all");
  };

  if (loading) return <LeadsPageSkeleton />;

  return (
    <section className="mx-auto max-w-[1400px]">
      {/* ============ SARLAVHA ============ */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[#18233c]">
              Leads
            </h1>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold tabular-nums text-slate-500 ring-1 ring-slate-200">
              {leads.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {view === "board"
              ? "Kartalarni ustunlar orasida sudrab, holatini o'zgartiring."
              : "Mijoz so'rovlarini qidiring, filtrlang va boshqaring."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModal("new")}
          className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 outline-none transition hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f6fb] active:scale-[0.98]"
        >
          <HiPlus className="h-4 w-4" />
          Yangi lead
        </button>
      </div>

      {leads.length === 0 ? (
        <EmptyState onCreate={() => setModal("new")} />
      ) : (
        <>
          {/* ============ STATISTIKA ============ */}
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={HiInboxStack}
              label="Jami leadlar"
              value={String(stats.total)}
              hint={`${stats.active} tasi faol`}
              tint="indigo"
            />
            <StatCard
              icon={HiCurrencyDollar}
              label="Umumiy qiymat"
              value={money.format(stats.totalValue)}
              hint={`O'rtacha ${money.format(stats.average)}`}
              tint="blue"
            />
            <StatCard
              icon={HiTrophy}
              label="Yutilgan summa"
              value={money.format(stats.wonValue)}
              hint={`${stats.wonCount} ta lead yutildi`}
              tint="emerald"
            />
            <StatCard
              icon={HiArrowTrendingUp}
              label="Konversiya"
              value={`${stats.conversion}%`}
              hint={`${stats.wonCount} / ${stats.total} lead`}
              progress={stats.conversion}
              tint="violet"
            />
          </div>

          {/* ============ QIDIRUV + KO'RINISH ============ */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <label className="group flex h-10 w-full items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3.5 text-sm shadow-sm shadow-slate-900/[0.03] transition focus-within:border-indigo-300 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.10)] sm:w-[320px]">
              <HiMagnifyingGlass className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Lead yoki kompaniyani qidiring"
                aria-label="Qidirish"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="shrink-0 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Qidiruvni tozalash"
                >
                  <HiXMark className="h-4 w-4" />
                </button>
              )}
            </label>

            <div
              className="ml-auto flex rounded-xl bg-slate-200/60 p-1"
              role="group"
              aria-label="Ko'rinish"
            >
              <ViewButton
                active={view === "board"}
                onClick={() => setView("board")}
                icon={HiRectangleGroup}
                label="Kanban"
              />
              <ViewButton
                active={view === "table"}
                onClick={() => setView("table")}
                icon={HiTableCells}
                label="Jadval"
              />
            </div>
          </div>

          {/* ============ STATUS CHIPLARI ============ */}
          <div
            className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Status bo'yicha filtr"
          >
            <FilterChip
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label="Barchasi"
              count={counts.all}
            />
            {STATUS_ORDER.map((status) => (
              <FilterChip
                key={status}
                active={filter === status}
                onClick={() => setFilter(status)}
                label={STATUS_META[status].label}
                count={counts[status]}
                dot={STATUS_META[status].dot}
              />
            ))}
          </div>

          {/* ============ KONTENT ============ */}
          {shown.length === 0 && isFiltering ? (
            <NoResults onReset={resetFilters} />
          ) : view === "board" ? (
            <Board
              leads={shown}
              statuses={filter === "all" ? STATUS_ORDER : [filter]}
              onOpen={(lead) => navigate(`/leads/${lead.id}`)}
              onEdit={setModal}
              onDelete={setLeadToDelete}
              onMove={setStatus}
              onAdd={() => setModal("new")}
            />
          ) : (
            <Table
              leads={shown}
              onOpen={(lead) => navigate(`/leads/${lead.id}`)}
              onEdit={setModal}
              onDelete={setLeadToDelete}
              onStatus={setStatus}
            />
          )}
        </>
      )}

      {modal !== null && (
        <LeadModal
          key={modal === "new" ? "new" : modal.id}
          open
          lead={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={save}
        />
      )}
      <ConfirmDialog
        open={leadToDelete !== null}
        loading={deleting}
        description={`"${leadToDelete?.name || ""}" leadini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
        onClose={() => setLeadToDelete(null)}
        onConfirm={() => leadToDelete && void remove(leadToDelete)}
      />
    </section>
  );
}

/* ───────────────────────── Kichik komponentlar ───────────────────────── */

function ViewButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label} ko'rinishi`}
      className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-400/60 ${
        active
          ? "bg-white text-slate-900 shadow-sm shadow-slate-900/10"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-8 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-400/60 ${
        active
          ? "border-[#0c1329] bg-[#0c1329] text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
      }`}
    >
      {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
      {label}
      <span
        className={`text-xs tabular-nums ${
          active ? "text-white/60" : "text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tint,
  progress,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  tint: "indigo" | "blue" | "emerald" | "violet";
  progress?: number;
}) {
  const tints = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", bar: "bg-indigo-500" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", bar: "bg-blue-500" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", bar: "bg-violet-500" },
  };
  const t = tints[tint];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.03]">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-medium text-slate-500">
          {label}
        </p>
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${t.bg} ${t.text}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 truncate text-2xl font-semibold tabular-nums tracking-tight text-[#18233c]">
        {value}
      </p>
      {progress !== undefined && (
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${t.bar} transition-[width] duration-500 motion-reduce:transition-none`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      {hint && <p className="mt-1.5 truncate text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
        <HiInboxStack className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-slate-800">
        Hali leadlar yo'q
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">
        Birinchi leadni qo'shing, so'ng uni savdo bosqichlari bo'ylab
        sudrab boshqaring.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 outline-none transition hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
      >
        <HiPlus className="h-4 w-4" />
        Birinchi leadni qo'shish
      </button>
    </div>
  );
}

function NoResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <HiMagnifyingGlass className="h-6 w-6" />
      </span>
      <p className="mt-4 text-base font-semibold text-slate-800">
        Lead topilmadi
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Qidiruv yoki filtrni o'zgartirib ko'ring.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-400/60"
      >
        Filtrlarni tozalash
      </button>
    </div>
  );
}

/* ───────────────────────── Kanban ───────────────────────── */

function Board({
  leads,
  statuses,
  onOpen,
  onEdit,
  onDelete,
  onMove,
  onAdd,
}: {
  leads: Lead[];
  statuses: LeadStatus[];
  onOpen: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onMove: (lead: Lead, status: LeadStatus) => void;
  onAdd: (status: LeadStatus) => void;
}) {
  const [dragged, setDragged] = useState<Lead | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);

  return (
    <div className="mt-5 overflow-x-auto pb-4">
      <div className="flex gap-4">
        {statuses.map((status) => {
          const meta = STATUS_META[status];
          const stageLeads = leads.filter((lead) => lead.status === status);
          const total = stageLeads.reduce((s, l) => s + (l.value || 0), 0);
          const isOver = dragOver === status;

          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOver !== status) setDragOver(status);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                  setDragOver(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragged) onMove(dragged, status);
                setDragged(null);
                setDragOver(null);
              }}
              className={`flex min-h-[220px] w-full min-w-[270px] max-w-[420px] flex-1 flex-col rounded-2xl p-2.5 ring-1 ring-inset transition-colors ${
                isOver
                  ? "bg-indigo-50 ring-indigo-300"
                  : "bg-slate-900/[0.035] ring-transparent"
              }`}
            >
              {/* Ustun sarlavhasi */}
              <div className="flex items-center justify-between px-1.5 pb-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                  <h2 className="text-sm font-semibold text-slate-800">
                    {meta.label}
                  </h2>
                  <span className="rounded-md bg-white px-1.5 py-0.5 text-xs font-semibold tabular-nums text-slate-500 ring-1 ring-slate-200">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {total > 0 && (
                    <span className="text-xs font-medium tabular-nums text-slate-400">
                      {moneyCompact.format(total)}
                    </span>
                  )}
                  <Tooltip title="Yangi lead qo'shish" arrow>
                    <button
                      type="button"
                      onClick={() => onAdd(status)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 outline-none transition hover:bg-white hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                      aria-label={`${meta.label} ustuniga lead qo'shish`}
                    >
                      <HiPlus className="h-4 w-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Kartalar */}
              <div className="flex flex-1 flex-col gap-2.5">
                {stageLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onOpen={onOpen}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onMove={onMove}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(lead.id));
                      setDragged(lead);
                    }}
                    onDragEnd={() => {
                      setDragged(null);
                      setDragOver(null);
                    }}
                    isDragging={dragged?.id === lead.id}
                  />
                ))}

                {stageLeads.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300/80 px-3 py-8 text-center">
                    <p className="text-xs text-slate-400">
                      Bu yerga kartani sudrab tashlang
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  onOpen,
  onEdit,
  onDelete,
  onMove,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  lead: Lead;
  onOpen: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onMove: (lead: Lead, status: LeadStatus) => void;
  onDragStart: (e: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const color = colorOf(lead.name);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);

  return (
    <article
      draggable
      tabIndex={0}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(lead)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && e.key === "Enter") onOpen(lead);
      }}
      className={`group relative cursor-grab rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm shadow-slate-900/[0.04] outline-none transition hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/[0.06] focus-visible:ring-2 focus-visible:ring-indigo-400/60 active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: color.bg,
              color: color.fg,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {initialsOf(lead.name)}
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-800">
              {lead.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-400">
              <HiBuildingOffice2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{lead.company || "Kompaniya yo'q"}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setAnchor(e.currentTarget);
          }}
          aria-label="Amallar"
          aria-haspopup="menu"
          className={`-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-700 focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${
            anchor ? "bg-slate-100 opacity-100" : "opacity-0"
          }`}
        >
          <HiEllipsisHorizontal className="h-5 w-5" />
        </button>
      </div>

      {lead.description && (
        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-slate-500">
          {lead.description}
        </p>
      )}

      <div className="mt-3.5 flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums text-slate-900">
          {money.format(lead.value || 0)}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <HiCalendarDays className="h-3.5 w-3.5" />
          {formatUzDate(lead.createdAt, true)}
        </span>
      </div>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { elevation: 0, sx: menuPaperSx } }}
      >
        <MenuItem
          onClick={() => {
            close();
            onEdit(lead);
          }}
        >
          <HiPencilSquare className="h-[18px] w-[18px] text-slate-500" />
          Tahrirlash
        </MenuItem>

        <div className="px-3 pb-1 pt-2.5 text-xs font-medium text-slate-400">
          Holatini o'zgartirish
        </div>
        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status];
          const current = status === lead.status;
          return (
            <MenuItem
              key={status}
              disabled={current}
              onClick={() => {
                close();
                onMove(lead, status);
              }}
              sx={{ "&.Mui-disabled": { opacity: 1, color: "#94a3b8" } }}
            >
              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
              <span className="flex-1">{meta.label}</span>
              {current && <HiCheck className="h-4 w-4 text-indigo-500" />}
            </MenuItem>
          );
        })}

        <div className="mx-2 my-1.5 h-px bg-slate-100" />
        <MenuItem
          onClick={() => {
            close();
            onDelete(lead);
          }}
          sx={{ color: "#dc2626", "&:hover": { bgcolor: "#fef2f2" } }}
        >
          <HiTrash className="h-[18px] w-[18px]" />
          O'chirish
        </MenuItem>
      </Menu>
    </article>
  );
}

/* ───────────────────────── Jadval ───────────────────────── */

function Table({
  leads,
  onOpen,
  onEdit,
  onDelete,
  onStatus,
}: {
  leads: Lead[];
  onOpen: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onStatus: (lead: Lead, status: LeadStatus) => void;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-medium text-slate-500">
              <th className="px-5 py-3">Mijoz</th>
              <th className="px-5 py-3">Kompaniya</th>
              <th className="px-5 py-3">Qiymat</th>
              <th className="px-5 py-3">Holat</th>
              <th className="px-5 py-3">Kontakt</th>
              <th className="px-5 py-3">Sana</th>
              <th className="px-5 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const color = colorOf(lead.name);
              return (
                <tr
                  key={lead.id}
                  className="group border-b border-slate-100 text-sm text-slate-600 transition-colors last:border-0 hover:bg-slate-50/70"
                >
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => onOpen(lead)}
                      className="flex max-w-[260px] items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: color.bg,
                          color: color.fg,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {initialsOf(lead.name)}
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800 transition group-hover:text-indigo-600">
                          {lead.name}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {lead.description || "Tavsif yo'q"}
                        </p>
                      </div>
                    </button>
                  </td>

                  <td className="px-5 py-3">
                    {lead.company ? (
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-700">
                        <HiBuildingOffice2 className="h-4 w-4 text-slate-400" />
                        {lead.company}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  <td className="px-5 py-3">
                    <span className="font-semibold tabular-nums text-slate-900">
                      {money.format(lead.value || 0)}
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    <StatusSelect
                      value={lead.status}
                      onChange={(s) => onStatus(lead, s)}
                    />
                  </td>

                  <td className="px-5 py-3">
                    {lead.contactName ? (
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-600">
                        <HiUser className="h-4 w-4 text-slate-400" />
                        {lead.contactName}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-500">
                      <HiCalendarDays className="h-4 w-4 text-slate-400" />
                      {formatUzDate(lead.createdAt)}
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                      <Tooltip title="Tahrirlash" arrow>
                        <button
                          type="button"
                          onClick={() => onEdit(lead)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 outline-none transition hover:bg-indigo-50 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                          aria-label="Tahrirlash"
                        >
                          <HiPencilSquare className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip title="O'chirish" arrow>
                        <button
                          type="button"
                          onClick={() => onDelete(lead)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 outline-none transition hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-400/60"
                          aria-label="O'chirish"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: LeadStatus;
  onChange: (s: LeadStatus) => void;
}) {
  const meta = STATUS_META[value];
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
      size="small"
      variant="outlined"
      sx={{
        height: 30,
        borderRadius: "9px",
        "& .MuiSelect-select": { py: 0, pl: 0.5, pr: "28px !important" },
        "& .MuiSelect-icon": { right: 4, color: "#94a3b8" },
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#a5b4fc",
          borderWidth: 1,
        },
      }}
      renderValue={() => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full ${meta.bg} px-2.5 py-1 text-xs font-semibold ${meta.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      )}
      MenuProps={{
        slotProps: { paper: { elevation: 0, sx: menuPaperSx } },
      }}
    >
      {STATUS_ORDER.map((status) => (
        <MenuItem key={status} value={status}>
          <span className={`h-2 w-2 rounded-full ${STATUS_META[status].dot}`} />
          {STATUS_META[status].label}
        </MenuItem>
      ))}
    </Select>
  );
}

/* ───────────────────────── Yuklanish skeleti ───────────────────────── */

function LeadsPageSkeleton(): ReactNode {
  return (
    <section
      className="mx-auto max-w-[1400px]"
      aria-label="Leadlar yuklanmoqda"
      aria-busy="true"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200/80 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="mt-4 h-7 w-24 rounded-md" />
            <Skeleton className="mt-3 h-3 w-28 rounded" />
          </div>
        ))}
      </div>

      <div className="mt-7 flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-full max-w-[320px] rounded-xl" />
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>
      <div className="mt-3 flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      <div className="mt-5 flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }, (_, column) => (
          <div
            key={column}
            className="w-full min-w-[270px] flex-1 rounded-2xl bg-slate-900/[0.035] p-2.5"
          >
            <div className="flex items-center justify-between px-1.5 pb-3 pt-1">
              <Skeleton className="h-5 w-28 rounded" />
              <Skeleton className="h-6 w-6 rounded-lg" />
            </div>
            <div className="space-y-2.5">
              {Array.from({ length: 3 }, (_, card) => (
                <div
                  key={card}
                  className="rounded-xl border border-slate-200/80 bg-white p-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-3/4 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                  </div>
                  <Skeleton className="mt-4 h-3 w-full rounded" />
                  <div className="mt-4 flex justify-between">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-3.5 w-14 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}