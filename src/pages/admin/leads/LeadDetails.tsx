import {
  Button,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiCheck,
  HiPencilSquare,
  HiTrash,
  HiCurrencyDollar,
  HiBuildingOffice2,
  HiUser,
  HiEnvelope,
  HiPhone,
  HiCalendarDays,
  HiChatBubbleLeftEllipsis,
  HiPaperClip,
  HiClipboardDocumentList,
  HiBolt,
  HiChevronDown,
} from "react-icons/hi2";
import { useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../../services/apiClient";
import { notify } from "../../../components/ui/notify";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import Skeleton from "../../../components/ui/Skeleton";
import type { Lead, LeadStatus } from "../../../types/crm";
import { formatUzDate } from "../../../utils/date";
import LeadModal from "./LeadModal";

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  new: {
    label: "Yangi",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  in_progress: {
    label: "Jarayonda",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  proposal: {
    label: "Taklif yuborilgan",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  won: {
    label: "Yutildi",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  lost: {
    label: "Yo'qotildi",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
};

const names: Record<LeadStatus, string> = {
  new: "Yangi",
  in_progress: "Jarayonda",
  proposal: "Taklif yuborilgan",
  won: "Yutildi",
  lost: "Yo'qotildi",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const TABS = [
  { key: "activity", label: "Faoliyatlar", icon: HiBolt },
  { key: "comments", label: "Izohlar", icon: HiChatBubbleLeftEllipsis },
  { key: "tasks", label: "Vazifalar", icon: HiClipboardDocumentList },
  { key: "files", label: "Fayllar", icon: HiPaperClip },
] as const;

export default function LeadDetails() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["key"]>("activity");
  const [comment, setComment] = useState("");

  useEffect(() => {
    api
      .get(`/leads/${leadId}`)
      .then(({ data }) => setLead(data.lead))
      .catch((e) => {
        notify.error(getErrorMessage(e));
        navigate("/leads");
      })
      .finally(() => setLoading(false));
  }, [leadId, navigate]);

  const status = async (next: LeadStatus) => {
    if (!lead || lead.status === next) return;
    try {
      const { data } = await api.patch(`/leads/${lead.id}/status`, {
        status: next,
      });
      setLead(data.lead);
      notify.success("Lead holati yangilandi");
    } catch (e) {
      notify.error(getErrorMessage(e));
    }
  };

  const remove = async () => {
    if (!lead) return;
    setDeleting(true);
    try {
      await api.delete(`/leads/${lead.id}`);
      notify.success("Lead o'chirildi");
      navigate("/leads");
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !lead) return <LeadDetailsSkeleton />;

  const cfg = STATUS_CONFIG[lead.status];

  const infoRows = [
    {
      label: "Qiymat",
      value: money.format(lead.value),
      icon: HiCurrencyDollar,
      highlight: true,
    },
    {
      label: "Kompaniya",
      value: lead.company || "—",
      icon: HiBuildingOffice2,
    },
    { label: "Kontakt", value: lead.contactName || "—", icon: HiUser },
    {
      label: "Email",
      value: lead.contactEmail || "—",
      icon: HiEnvelope,
      href: lead.contactEmail ? `mailto:${lead.contactEmail}` : undefined,
    },
    {
      label: "Telefon",
      value: lead.contactPhone || "—",
      icon: HiPhone,
      href: lead.contactPhone ? `tel:${lead.contactPhone}` : undefined,
    },
    {
      label: "Yaratilgan",
      value: formatUzDate(lead.createdAt),
      icon: HiCalendarDays,
    },
  ];

  const timeline = [
    {
      title: `Holat: ${names[lead.status]}`,
      date: lead.updatedAt,
      color: "bg-indigo-500",
    },
    {
      title: "Lead yaratildi",
      date: lead.createdAt,
      color: "bg-slate-300",
    },
  ];

  return (
    <section className="mx-auto max-w-[1030px]">
      <button
        onClick={() => navigate("/leads")}
        className="group mb-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
      >
        <HiArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Leadsga qaytish
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-[26px] font-bold tracking-tight text-[#19233b]">
              {lead.name}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full ${cfg.bg} px-2.5 py-1 text-[11px] font-bold ${cfg.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-400">
            <span className="font-medium text-slate-500">Lead</span>
            <span>·</span>
            <span>{lead.company || "Kompaniya yo'q"}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setEdit(true)}
            startIcon={<HiPencilSquare />}
            variant="outlined"
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#e2e8f0",
              color: "#475569",
              borderRadius: "10px",
              px: 2,
              "&:hover": {
                borderColor: "#c7d2fe",
                bgcolor: "#f8faff",
                color: "#4f46e5",
              },
            }}
          >
            Tahrirlash
          </Button>

          <Tooltip title="O'chirish" arrow>
            <Button
              onClick={() => setConfirmDelete(true)}
              startIcon={<HiTrash />}
              variant="outlined"
              size="small"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#fecaca",
                color: "#dc2626",
                borderRadius: "10px",
                px: 2,
                minWidth: "auto",
                "& .MuiButton-startIcon": { mr: { xs: 0, sm: 1 } },
                "&:hover": {
                  borderColor: "#fca5a5",
                  bgcolor: "#fef2f2",
                },
              }}
            >
              <span className="hidden sm:inline">O'chirish</span>
            </Button>
          </Tooltip>

          <Select
            value={lead.status}
            onChange={(e) => status(e.target.value as LeadStatus)}
            size="small"
            IconComponent={HiChevronDown}
            sx={{
              bgcolor: "#5657e9",
              color: "white",
              borderRadius: "10px",
              fontSize: 12.5,
              fontWeight: 700,
              height: 36,
              px: 0.5,
              boxShadow: "0 4px 14px rgba(86,87,233,0.28)",
              transition: "all .18s",
              "& .MuiOutlinedInput-notchedOutline": { border: 0 },
              "& .MuiSelect-icon": { color: "white", fontSize: 16 },
              "&:hover": {
                bgcolor: "#4a4bd6",
                boxShadow: "0 6px 18px rgba(86,87,233,0.36)",
              },
              "&.Mui-focused": { bgcolor: "#4a4bd6" },
            }}
            MenuProps={{
              slotProps: {
                paper: {
                  sx: {
                    mt: 1,
                    borderRadius: "12px",
                    border: "1px solid #eef0f5",
                    boxShadow: "0 12px 32px -8px rgba(24,35,60,0.14)",
                    "& .MuiMenuItem-root": {
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: "8px",
                      mx: 0.5,
                      my: 0.25,
                    },
                  },
                },
              },
            }}
          >
            {Object.entries(names).map(([key, label]) => {
              const c = STATUS_CONFIG[key as LeadStatus];
              return (
                <MenuItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                    {label}
                  </span>
                </MenuItem>
              );
            })}
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-4px_rgba(28,42,70,0.06)]">
          <div className="relative border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-white px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#5657e9] to-[#7c3aed] text-base font-bold text-white shadow-md shadow-indigo-500/25">
                {lead.name
                  .split(" ")
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-[#1f2a44]">
                  {lead.name}
                </h2>
                <p className="truncate text-xs text-slate-500">
                  {lead.company || "Kompaniya yo'q"}
                </p>
              </div>
            </div>
          </div>

          <dl className="px-5 py-4">
            {infoRows.map((row) => {
              const Icon = row.icon;
              const content = row.href ? (
                <a
                  href={row.href}
                  className="truncate font-semibold text-indigo-600 transition hover:text-indigo-700 hover:underline"
                >
                  {row.value}
                </a>
              ) : (
                <span
                  className={`truncate ${
                    row.highlight
                      ? "text-base font-bold text-emerald-600"
                      : "font-semibold text-[#334155]"
                  }`}
                >
                  {row.value}
                </span>
              );

              return (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 border-b border-slate-50 py-3 last:border-0"
                >
                  <dt className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Icon className="h-3.5 w-3.5" />
                    {row.label}
                  </dt>
                  <dd className="min-w-0 max-w-[60%] text-right text-xs">
                    {content}
                  </dd>
                </div>
              );
            })}
          </dl>

          {(lead.description || lead.company) && (
            <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tavsif
              </p>
              <p className="text-xs leading-relaxed text-slate-600">
                {lead.description || `${lead.company} bilan loyiha hamkorligi`}
              </p>
            </div>
          )}
        </aside>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-4px_rgba(28,42,70,0.06)]">
          <div className="flex overflow-x-auto border-b border-slate-100 px-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex shrink-0 items-center gap-1.5 px-4 py-3.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-indigo-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {isActive && (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-5">
            {activeTab === "activity" && <ActivityTab timeline={timeline} />}
            {activeTab === "comments" && (
              <CommentsTab
                comment={comment}
                setComment={setComment}
                onAdd={() => {
                  if (!comment.trim()) return;
                  notify.success("Izoh qo'shildi");
                  setComment("");
                }}
              />
            )}
            {activeTab === "tasks" && <EmptyTab label="Vazifalar" />}
            {activeTab === "files" && <EmptyTab label="Fayllar" />}
          </div>
        </div>
      </div>

      <LeadModal
        open={edit}
        lead={lead}
        onClose={() => setEdit(false)}
        onSaved={setLead}
      />
      <ConfirmDialog
        open={confirmDelete}
        loading={deleting}
        description={`"${lead.name}" leadini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void remove()}
      />
    </section>
  );
}

function LeadDetailsSkeleton() {
  return (
    <section className="mx-auto max-w-[1030px]" aria-label="Lead yuklanmoqda" aria-busy="true">
      <Skeleton className="mb-4 h-4 w-32 rounded" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-60 rounded-lg" />
          <Skeleton className="mt-2 h-4 w-44 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
            <div className="flex-1">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="mt-2 h-3.5 w-32 rounded" />
            </div>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="rounded-xl border border-slate-100 p-4">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="mt-3 h-4 w-32 rounded" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-6 h-24 w-full rounded-xl" />
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <Skeleton className="h-5 w-32 rounded" />
            <div className="mt-5 space-y-5">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
                  <Skeleton className="h-10 flex-1 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton className="mt-4 h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ActivityTab({
  timeline,
}: {
  timeline: { title: string; date: string; color: string }[];
}) {
  return (
    <div className="relative">
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-slate-200" />

      <ul className="space-y-5">
        {timeline.map((item, i) => (
          <li key={i} className="relative flex gap-3.5 pl-0">
            <span className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
              <span
                className={`h-2.5 w-2.5 rounded-full ring-4 ring-white ${item.color}`}
              />
            </span>

            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 transition hover:border-indigo-100 hover:bg-indigo-50/40">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <HiCheck className="h-4 w-4 text-indigo-500" />
                {item.title}
              </span>
              <span className="shrink-0 text-xs font-medium text-slate-400">
                {formatUzDate(item.date)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CommentsTab({
  comment,
  setComment,
  onAdd,
}: {
  comment: string;
  setComment: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.06)]">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Izoh yozing..."
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {comment.length} / 500
          </span>
          <Button
            onClick={onAdd}
            disabled={!comment.trim()}
            startIcon={<HiCheck />}
            variant="contained"
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#5657e9",
              borderRadius: "9px",
              boxShadow: "0 4px 12px rgba(86,87,233,0.24)",
              "&:hover": { bgcolor: "#4a4bd6" },
              "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
            }}
          >
            Izoh qo'shish
          </Button>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center justify-center gap-2 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <HiChatBubbleLeftEllipsis className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-600">
          Hali izohlar yo'q
        </p>
        <p className="text-xs text-slate-400">
          Birinchi izohni qoldirib, jamoangiz bilan bo'lishing.
        </p>
      </div>
    </div>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <HiClipboardDocumentList className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-slate-600">
        {label} mavjud emas
      </p>
      <p className="text-xs text-slate-400">
        Tez orada bu yerda {label.toLowerCase()} paydo bo'ladi.
      </p>
    </div>
  );
}
