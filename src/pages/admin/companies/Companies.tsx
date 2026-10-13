import {
  Avatar,
  Button,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  HiBuildingOffice2,
  HiChevronLeft,
  HiChevronRight,
  HiEye,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiPlus,
  HiTrash,
  HiXMark,
  HiSquares2X2,
  HiTableCells,
  HiEnvelope,
  HiPhone,
  HiGlobeAlt,
  HiUserCircle,
  HiCheckBadge,
  HiSparkles,
  HiArchiveBox,
  HiArrowsUpDown,
} from "react-icons/hi2";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import Skeleton from "../../../components/ui/Skeleton";
import { notify } from "../../../components/ui/notify";
import { getErrorMessage } from "../../../services/apiClient";
import { useCompanies, useDeleteCompany } from "../../../hooks/useCompanies";
import type { Company, CompanyStatus } from "../../../types/crm";
import CompanyModal from "./CompanyModal";

/* ==================== META ==================== */

const STATUS: Record<
  CompanyStatus,
  { label: string; classes: string; dot: string; icon: React.ReactNode }
> = {
  active: {
    label: "Hamkor",
    classes: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    dot: "bg-emerald-500",
    icon: <HiCheckBadge className="h-3.5 w-3.5" />,
  },
  prospect: {
    label: "Potensial",
    classes: "bg-amber-50 text-amber-700 ring-amber-100",
    dot: "bg-amber-500",
    icon: <HiSparkles className="h-3.5 w-3.5" />,
  },
  inactive: {
    label: "Nofaol",
    classes: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
    icon: <HiArchiveBox className="h-3.5 w-3.5" />,
  },
};

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-orange-100 text-orange-700",
  "bg-rose-100 text-rose-700",
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const colorFor = (name: string) =>
  AVATAR_COLORS[
    name.split("").reduce((sum, letter) => sum + letter.charCodeAt(0), 0) %
      AVATAR_COLORS.length
  ];

type ViewMode = "table" | "grid";
type SortKey = "name" | "recent" | "status";

/* ==================== MAIN ==================== */

export default function Companies() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CompanyStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("companies:view");
    return saved === "grid" || saved === "table" ? saved : "table";
  });
  const [editing, setEditing] = useState<Company | null | "new">(null);
  const [viewing, setViewing] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState<Company | null>(null);

  const companies = useCompanies(page, search, status);
  const remove = useDeleteCompany();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    localStorage.setItem("companies:view", view);
  }, [view]);

  const pagination = companies.data?.pagination;
  const list = companies.data?.companies;

  const sorted = useMemo(() => {
    const arr = [...(list ?? [])];
    if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "status") arr.sort((a, b) => a.status.localeCompare(b.status));
    return arr;
  }, [list, sort]);

  const counts = useMemo(() => {
    const c = { all: list?.length ?? 0, active: 0, prospect: 0, inactive: 0 };
    list?.forEach((x) => (c[x.status] += 1));
    return c;
  }, [list]);

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setPage(1);
  };

  const deleteCompany = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      notify.success("Kompaniya o'chirildi");
      setDeleting(null);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const hasFilters = search || status !== "all";

  return (
    <section className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 lg:px-8">
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-[25px] font-bold tracking-tight text-[#19233b]">
            Kompaniyalar
            {pagination && (
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600">
                {pagination.total}
              </span>
            )}
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            Hamkor kompaniyalar va kontaktlarini boshqaring.
          </p>
        </div>
        <Button
          onClick={() => setEditing("new")}
          variant="contained"
          startIcon={<HiPlus />}
          sx={{
            borderRadius: "10px",
            bgcolor: "#5657e9",
            textTransform: "none",
            fontWeight: 700,
            px: 2.25,
            py: 1,
            boxShadow: "0 4px 14px rgba(86,87,233,.28)",
            "&:hover": { bgcolor: "#4849cf", boxShadow: "0 6px 20px rgba(86,87,233,.35)" },
          }}
        >
          Yangi kompaniya
        </Button>
      </div>

      {/* ==================== STAT CARDS ==================== */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Jami"
          value={counts.all}
          accent="#5657e9"
          icon={<HiBuildingOffice2 />}
          active={status === "all"}
          onClick={() => setStatus("all")}
        />
        <StatCard
          label="Hamkor"
          value={counts.active}
          accent="#10b981"
          icon={<HiCheckBadge />}
          active={status === "active"}
          onClick={() => setStatus("active")}
        />
        <StatCard
          label="Potensial"
          value={counts.prospect}
          accent="#f59e0b"
          icon={<HiSparkles />}
          active={status === "prospect"}
          onClick={() => setStatus("prospect")}
        />
        <StatCard
          label="Nofaol"
          value={counts.inactive}
          accent="#94a3b8"
          icon={<HiArchiveBox />}
          active={status === "inactive"}
          onClick={() => setStatus("inactive")}
        />
      </div>

      {/* ==================== TOOLBAR ==================== */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <label className="group flex h-10 w-full max-w-[360px] items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm transition focus-within:border-indigo-300 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,.08)]">
          <HiMagnifyingGlass className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Kompaniya qidirish..."
            aria-label="Kompaniya qidirish"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Qidiruvni tozalash"
            >
              <HiXMark className="h-4 w-4" />
            </button>
          )}
        </label>

        {/* Sort */}
        <Select
          size="small"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          startAdornment={
            <HiArrowsUpDown className="ml-2 mr-1 h-3.5 w-3.5 text-slate-400" />
          }
          sx={{
            height: 40,
            minWidth: 160,
            borderRadius: "10px",
            bgcolor: "white",
            fontSize: 13,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
          }}
        >
          <MenuItem value="recent">Eng yangi</MenuItem>
          <MenuItem value="name">Nom (A-Z)</MenuItem>
          <MenuItem value="status">Holat bo'yicha</MenuItem>
        </Select>

        {/* Clear */}
        {hasFilters && (
          <Button
            onClick={clearFilters}
            color="inherit"
            size="small"
            startIcon={<HiXMark />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Tozalash
          </Button>
        )}

        {/* View switcher */}
        <div className="ml-auto flex items-center rounded-xl border border-slate-200 bg-white p-1">
          <ViewBtn
            active={view === "table"}
            onClick={() => setView("table")}
            icon={<HiTableCells className="h-4 w-4" />}
            label="Jadval"
          />
          <ViewBtn
            active={view === "grid"}
            onClick={() => setView("grid")}
            icon={<HiSquares2X2 className="h-4 w-4" />}
            label="Kartochka"
          />
        </div>
      </div>

      {/* ==================== CONTENT ==================== */}
      <div className="mt-5">
        {companies.isLoading ? (
          view === "table" ? (
            <TableSkeleton />
          ) : (
            <GridSkeleton />
          )
        ) : !list?.length ? (
          <EmptyState hasFilters={!!hasFilters} onReset={clearFilters} onCreate={() => setEditing("new")} />
        ) : view === "table" ? (
          <TableView
            companies={sorted}
            onView={setViewing}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        ) : (
          <GridView
            companies={sorted}
            onView={setViewing}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        )}
      </div>

      {/* ==================== PAGINATION ==================== */}
      {!!pagination?.total && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onChange={setPage}
        />
      )}

      {/* ==================== MODALS ==================== */}
      <CompanyModal
        key={editing === "new" ? "new" : editing?.id || "closed"}
        open={editing !== null}
        company={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
      />
      <CompanyDetails
        company={viewing}
        onClose={() => setViewing(null)}
        onEdit={(company) => {
          setViewing(null);
          setEditing(company);
        }}
      />
      <ConfirmDialog
        open={!!deleting}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => void deleteCompany()}
        description={
          deleting
            ? `"${deleting.name}" kompaniyasini o'chirishni tasdiqlaysizmi?`
            : ""
        }
      />
    </section>
  );
}

/* ==================== SUB: STAT CARD ==================== */

function StatCard({
  label,
  value,
  accent,
  icon,
  active,
  onClick,
}: {
  label: string;
  value: number;
  accent: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-all ${
        active
          ? "border-transparent shadow-[0_4px_16px_-4px_rgba(15,23,42,.15)] ring-2 ring-offset-1"
          : "border-slate-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_-4px_rgba(15,23,42,.12)]"
      }`}
      style={
        active
          ? ({ "--tw-ring-color": accent } as React.CSSProperties)
          : undefined
      }
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg transition group-hover:scale-110"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </div>
        <div className="text-[20px] font-bold leading-tight text-[#19233b]">
          {value}
        </div>
      </div>
    </button>
  );
}

/* ==================== SUB: VIEW SWITCHER ==================== */

function ViewBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Tooltip title={label}>
      <button
        onClick={onClick}
        className={`flex h-8 w-9 items-center justify-center rounded-lg transition ${
          active
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        }`}
        aria-label={label}
      >
        {icon}
      </button>
    </Tooltip>
  );
}

/* ==================== SUB: TABLE VIEW ==================== */

function TableView({
  companies,
  onView,
  onEdit,
  onDelete,
}: {
  companies: Company[];
  onView: (c: Company) => void;
  onEdit: (c: Company) => void;
  onDelete: (c: Company) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_-6px_rgba(15,23,42,.1)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] text-left">
          <thead className="bg-slate-50/90 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Kompaniya</th>
              <th className="px-4 py-3.5">Sanoat sohasi</th>
              <th className="px-4 py-3.5">Kontakt shaxs</th>
              <th className="px-4 py-3.5">Telefon</th>
              <th className="px-4 py-3.5">Holat</th>
              <th className="px-5 py-3.5 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <CompanyRow
                key={company.id}
                company={company}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompanyRow({
  company,
  onView,
  onEdit,
  onDelete,
}: {
  company: Company;
  onView: (c: Company) => void;
  onEdit: (c: Company) => void;
  onDelete: (c: Company) => void;
}) {
  const meta = STATUS[company.status];
  return (
    <tr className="group border-t border-slate-100 text-sm text-slate-600 transition hover:bg-indigo-50/30">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <Avatar
            className={colorFor(company.name)}
            sx={{ width: 38, height: 38, fontSize: 12, fontWeight: 800 }}
          >
            {initials(company.name)}
          </Avatar>
          <div className="min-w-0">
            <p className="max-w-[190px] truncate font-bold text-[#26334f]">
              {company.name}
            </p>
            <p className="max-w-[190px] truncate text-xs text-slate-400">
              {company.description || "Kompaniya ma'lumoti"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {company.industry || <span className="text-slate-300">—</span>}
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-slate-600">
          {company.contactName || "—"}
        </p>
        {company.contactEmail && (
          <p className="text-xs text-slate-400">{company.contactEmail}</p>
        )}
      </td>
      <td className="px-4 py-3 font-medium">
        {company.contactPhone || <span className="text-slate-300">—</span>}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${meta.classes}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </td>
      <td className="px-5 py-3">
        <div className="flex justify-end gap-0.5 opacity-60 transition group-hover:opacity-100">
          <Action label="Ko'rish" onClick={() => onView(company)}>
            <HiEye />
          </Action>
          <Action label="Tahrirlash" onClick={() => onEdit(company)}>
            <HiPencilSquare />
          </Action>
          <Action label="O'chirish" danger onClick={() => onDelete(company)}>
            <HiTrash />
          </Action>
        </div>
      </td>
    </tr>
  );
}

/* ==================== SUB: GRID VIEW ==================== */

function GridView({
  companies,
  onView,
  onEdit,
  onDelete,
}: {
  companies: Company[];
  onView: (c: Company) => void;
  onEdit: (c: Company) => void;
  onDelete: (c: Company) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function CompanyCard({
  company,
  onView,
  onEdit,
  onDelete,
}: {
  company: Company;
  onView: (c: Company) => void;
  onEdit: (c: Company) => void;
  onDelete: (c: Company) => void;
}) {
  const meta = STATUS[company.status];
  return (
    <div
      onClick={() => onView(company)}
      className="group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_12px_28px_-10px_rgba(86,87,233,.25)]"
    >
      {/* Top accent */}
      <span
        className={`absolute inset-x-0 top-0 h-1 ${meta.dot} opacity-0 transition group-hover:opacity-100`}
      />

      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar
          className={colorFor(company.name)}
          sx={{ width: 46, height: 46, fontSize: 14, fontWeight: 800 }}
        >
          {initials(company.name)}
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold text-[#1f2a44]">
            {company.name}
          </h3>
          <p className="truncate text-xs text-slate-400">
            {company.industry || "Sohasi ko'rsatilmagan"}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold ring-1 ring-inset ${meta.classes}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      {/* Body */}
      <div className="space-y-1.5 text-[12.5px] text-slate-500">
        {company.contactName && (
          <div className="flex items-center gap-2">
            <HiUserCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{company.contactName}</span>
          </div>
        )}
        {company.contactPhone && (
          <div className="flex items-center gap-2">
            <HiPhone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate font-medium text-slate-600">
              {company.contactPhone}
            </span>
          </div>
        )}
        {company.contactEmail && (
          <div className="flex items-center gap-2">
            <HiEnvelope className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{company.contactEmail}</span>
          </div>
        )}
        {company.website && (
          <div className="flex items-center gap-2">
            <HiGlobeAlt className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{company.website}</span>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-1 flex items-center justify-end gap-1 border-t border-slate-100 pt-3 opacity-0 transition group-hover:opacity-100">
        <Action
          label="Tahrirlash"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(company);
          }}
        >
          <HiPencilSquare />
        </Action>
        <Action
          label="O'chirish"
          danger
          onClick={(e) => {
            e.stopPropagation();
            onDelete(company);
          }}
        >
          <HiTrash />
        </Action>
      </div>
    </div>
  );
}

/* ==================== SUB: ACTION ==================== */

function Action({
  label,
  children,
  onClick,
  danger = false,
}: {
  label: string;
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <Tooltip title={label}>
      <IconButton
        onClick={onClick}
        size="small"
        sx={{
          color: danger ? "#e9546b" : "#71809a",
          "&:hover": {
            bgcolor: danger ? "#fff1f2" : "#eef2ff",
            color: danger ? "#d63f58" : "#5657e9",
          },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

/* ==================== SUB: EMPTY & SKELETON ==================== */

function EmptyState({
  hasFilters,
  onReset,
  onCreate,
}: {
  hasFilters: boolean;
  onReset: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <HiBuildingOffice2 className="h-7 w-7" />
      </div>
      <p className="mt-4 text-base font-bold text-slate-700">
        {hasFilters ? "Kompaniya topilmadi" : "Hali kompaniya qo'shilmagan"}
      </p>
      <p className="mt-1 text-sm text-slate-400">
        {hasFilters
          ? "Qidiruv yoki filtrni o'zgartirib ko'ring."
          : "Birinchi kompaniyani qo'shish bilan boshlang."}
      </p>
      <div className="mt-5 flex justify-center gap-2">
        {hasFilters && (
          <Button
            onClick={onReset}
            color="inherit"
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Filtrni tozalash
          </Button>
        )}
        <Button
          onClick={onCreate}
          variant="contained"
          startIcon={<HiPlus />}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "#5657e9",
            borderRadius: "10px",
            "&:hover": { bgcolor: "#4849cf" },
          }}
        >
          Yangi kompaniya
        </Button>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[940px] text-left">
        <thead className="bg-slate-50/90">
          <tr>
            {Array.from({ length: 6 }).map((_, i) => (
              <th key={i} className="px-5 py-3.5">
                <Skeleton className="h-2.5 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, index) => (
            <tr key={index} className="border-t border-slate-100">
              <td className="px-5 py-4">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div>
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="mt-2 h-2.5 w-20" />
                  </div>
                </div>
              </td>
              <td colSpan={5}>
                <Skeleton className="h-3 w-24" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="mt-2 h-2.5 w-20" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-2.5 w-36" />
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="h-2.5 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==================== SUB: PAGINATION ==================== */

function Pagination({
  page,
  totalPages,
  total,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1,
  );
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs text-slate-400">
        Jami <b className="text-slate-600">{total}</b> ta kompaniya
      </p>
      <div className="flex items-center gap-1">
        <IconButton
          size="small"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          sx={{ borderRadius: "8px" }}
        >
          <HiChevronLeft />
        </IconButton>
        {pages.map((item, index) => (
          <span key={item} className="flex items-center gap-1">
            {index > 0 && item - pages[index - 1] > 1 && (
              <span className="px-1 text-slate-400">…</span>
            )}
            <button
              onClick={() => onChange(item)}
              className={`grid h-8 min-w-8 place-items-center rounded-lg px-2 text-xs font-bold transition ${
                page === item
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {item}
            </button>
          </span>
        ))}
        <IconButton
          size="small"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          sx={{ borderRadius: "8px" }}
        >
          <HiChevronRight />
        </IconButton>
      </div>
    </div>
  );
}

/* ==================== SUB: DETAILS MODAL ==================== */

function CompanyDetails({
  company,
  onClose,
  onEdit,
}: {
  company: Company | null;
  onClose: () => void;
  onEdit: (company: Company) => void;
}) {
  if (!company) return null;
  const meta = STATUS[company.status];
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Kompaniya ma'lumotlari"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-indigo-50 via-white to-white px-6 pb-5 pt-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Yopish"
          >
            <HiXMark className="h-4.5 w-4.5" />
          </button>
          <div className="flex gap-4">
            <Avatar
              className={colorFor(company.name)}
              sx={{ width: 56, height: 56, fontWeight: 800, fontSize: 18 }}
            >
              {initials(company.name)}
            </Avatar>
            <div className="min-w-0 pt-0.5">
              <h2 className="truncate text-lg font-bold text-[#1f2a44]">
                {company.name}
              </h2>
              <p className="truncate text-sm text-slate-400">
                {company.industry || "Sohasi ko'rsatilmagan"}
              </p>
              <span
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${meta.classes}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Kontakt shaxs" value={company.contactName} icon={<HiUserCircle />} />
            <Field label="Telefon" value={company.contactPhone} icon={<HiPhone />} />
            <Field label="Email" value={company.contactEmail} icon={<HiEnvelope />} />
            <Field label="Veb-sayt" value={company.website} icon={<HiGlobeAlt />} />
          </div>

          {company.description && (
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Izoh
              </p>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">
                {company.description}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              onClick={onClose}
              color="inherit"
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
            >
              Yopish
            </Button>
            <Button
              onClick={() => onEdit(company)}
              variant="contained"
              startIcon={<HiPencilSquare />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#5657e9",
                borderRadius: "10px",
                "&:hover": { bgcolor: "#4849cf" },
              }}
            >
              Tahrirlash
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      {icon && (
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
