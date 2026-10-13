import {
  Avatar,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  HiMagnifyingGlass,
  HiPencilSquare,
  HiPlus,
  HiUsers,
  HiXMark,
  HiEnvelope,
  HiPhone,
  HiBuildingOffice2,
  HiCheckCircle,
  HiExclamationCircle,
  HiFunnel,
} from "react-icons/hi2";
import api, { getErrorMessage } from "../../../services/apiClient";
import { notify } from "../../../components/ui/notify";
import Skeleton from "../../../components/ui/Skeleton";
import type { Lead } from "../../../types/crm";

type ContactValues = {
  contactName: string;
  company: string;
  contactEmail: string;
  contactPhone: string;
};

const blank: ContactValues = {
  contactName: "",
  company: "",
  contactEmail: "",
  contactPhone: "",
};

const makeContactValues = (lead: Lead | null): ContactValues =>
  lead
    ? {
        contactName: lead.contactName || lead.name,
        company: lead.company || "",
        contactEmail: lead.contactEmail || "",
        contactPhone: lead.contactPhone || "",
      }
    : blank;

const AVATAR_COLORS = [
  { bg: "#eef2ff", fg: "#4f46e5" },
  { bg: "#fdf2f8", fg: "#db2777" },
  { bg: "#ecfdf5", fg: "#059669" },
  { bg: "#fff7ed", fg: "#ea580c" },
  { bg: "#eff6ff", fg: "#2563eb" },
  { bg: "#fef2f2", fg: "#dc2626" },
  { bg: "#f5f3ff", fg: "#7c3aed" },
];
const colorOf = (name: string) =>
  AVATAR_COLORS[
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
      AVATAR_COLORS.length
  ];

export default function Contacts() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<Lead | "new" | null>(null);

  useEffect(() => {
    api
      .get("/leads", { params: { limit: 100 } })
      .then(({ data }) => setLeads(data.leads))
      .catch((e) => notify.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const companies = useMemo(
    () => [...new Set(leads.map((l) => l.company).filter(Boolean))] as string[],
    [leads],
  );

  const contacts = useMemo(
    () =>
      leads.filter(
        (lead) =>
          (filter === "all" || lead.company === filter) &&
          `${lead.contactName || lead.name} ${lead.company || ""} ${
            lead.contactEmail || ""
          } ${lead.contactPhone || ""}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [leads, filter, search],
  );

  const saved = (lead: Lead) => {
    setLeads((old) =>
      old.some((item) => item.id === lead.id)
        ? old.map((item) => (item.id === lead.id ? lead : item))
        : [lead, ...old],
    );
    setEditing(null);
  };

  const isFiltering = search.trim() !== "" || filter !== "all";
  const resetFilters = () => {
    setSearch("");
    setFilter("all");
  };

  if (loading) return <ContactsPageSkeleton />;

  return (
    <section className="mx-auto max-w-[1030px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-[25px] font-bold tracking-tight text-[#19233b]">
            Kontaktlar
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600">
              {leads.length}
            </span>
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            Mijozlar bilan aloqa ma&apos;lumotlarini boshqaring.
          </p>
        </div>

        <Button
          onClick={() => setEditing("new")}
          variant="contained"
          startIcon={<HiPlus />}
          sx={{
            mt: 0.4,
            borderRadius: "10px",
            bgcolor: "#5657e9",
            textTransform: "none",
            fontWeight: 700,
            px: 2.5,
            py: 1,
            boxShadow: "0 4px 14px rgba(86,87,233,0.28)",
            "&:hover": {
              bgcolor: "#4a4bd6",
              boxShadow: "0 6px 18px rgba(86,87,233,0.36)",
              transform: "translateY(-1px)",
            },
            transition: "all .18s ease",
          }}
        >
          Kontakt qo&apos;shish
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <label className="group flex h-10 w-full max-w-[300px] items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm transition-all focus-within:border-indigo-300 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
          <HiMagnifyingGlass className="h-4 w-4 shrink-0 text-slate-400 transition group-focus-within:text-indigo-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Ism, kompaniya, email..."
            aria-label="Kontakt qidirish"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="shrink-0 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Qidiruvni tozalash"
            >
              <HiXMark className="h-4 w-4" />
            </button>
          )}
        </label>

        <Select
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          startAdornment={
            <InputAdornment position="start" sx={{ ml: 0.5, mr: 0 }}>
              <HiFunnel className="h-3.5 w-3.5 text-slate-400" />
            </InputAdornment>
          }
          sx={{
            height: 40,
            minWidth: 190,
            borderRadius: "10px",
            fontSize: 13,
            bgcolor: "white",
            fontWeight: 500,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#cbd5e1",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#a5b4fc",
              borderWidth: 1,
              boxShadow: "0 0 0 4px rgba(99,102,241,0.08)",
            },
          }}
        >
          <MenuItem value="all" sx={{ fontSize: 13 }}>
            Barcha kompaniyalar
          </MenuItem>
          {companies.map((company) => (
            <MenuItem key={company} value={company} sx={{ fontSize: 13 }}>
              {company}
            </MenuItem>
          ))}
        </Select>

        {isFiltering && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              {contacts.length} ta natija
            </span>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              <HiXMark className="h-3.5 w-3.5" />
              Tozalash
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-4px_rgba(28,42,70,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="border-b border-slate-100 bg-slate-50/70">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Kontakt</th>
                <th className="px-5 py-3.5">Kompaniya</th>
                <th className="px-5 py-3.5">Aloqa</th>
                <th className="px-5 py-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((lead) => {
                const name = lead.contactName || lead.name || "—";
                const color = colorOf(name);
                const initials = name
                  .split(" ")
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <tr
                    key={lead.id}
                    className="group border-b border-slate-50 text-sm text-slate-600 transition-colors last:border-0 hover:bg-indigo-50/40"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            bgcolor: color.bg,
                            color: color.fg,
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#1f2a44]">
                            {name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {lead.contactEmail || "email yo'q"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      {lead.company ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          <HiBuildingOffice2 className="h-3.5 w-3.5 text-slate-400" />
                          {lead.company}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1 text-xs">
                        {lead.contactEmail ? (
                          <a
                            href={`mailto:${lead.contactEmail}`}
                            className="inline-flex items-center gap-1.5 text-slate-600 transition hover:text-indigo-600"
                          >
                            <HiEnvelope className="h-3.5 w-3.5 text-slate-400" />
                            {lead.contactEmail}
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-300">
                            <HiEnvelope className="h-3.5 w-3.5" />—
                          </span>
                        )}
                        {lead.contactPhone ? (
                          <a
                            href={`tel:${lead.contactPhone}`}
                            className="inline-flex items-center gap-1.5 text-slate-600 transition hover:text-indigo-600"
                          >
                            <HiPhone className="h-3.5 w-3.5 text-slate-400" />
                            {lead.contactPhone}
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-300">
                            <HiPhone className="h-3.5 w-3.5" />—
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex justify-end opacity-60 transition-opacity group-hover:opacity-100">
                        <Tooltip title="Tahrirlash" arrow>
                          <IconButton
                            size="small"
                            onClick={() => setEditing(lead)}
                            aria-label="Tahrirlash"
                            sx={{
                              color: "#5657e9",
                              bgcolor: "transparent",
                              "&:hover": { bgcolor: "#eef2ff" },
                            }}
                          >
                            <HiPencilSquare className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!contacts.length && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <HiUsers className="h-8 w-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-700">
                {isFiltering ? "Kontakt topilmadi" : "Hali kontaktlar yo'q"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {isFiltering
                  ? "Filtrlarni o'zgartirib qayta urinib ko'ring."
                  : "Birinchi kontaktni qo'shishdan boshlang."}
              </p>
            </div>
            {isFiltering ? (
              <button
                onClick={resetFilters}
                className="mt-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Filtrlarni tozalash
              </button>
            ) : (
              <Button
                onClick={() => setEditing("new")}
                variant="contained"
                startIcon={<HiPlus />}
                sx={{
                  mt: 1,
                  borderRadius: "10px",
                  bgcolor: "#5657e9",
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(86,87,233,0.28)",
                }}
              >
                Kontakt qo&apos;shish
              </Button>
            )}
          </div>
        )}
      </div>

      {editing !== null && (
        <ContactModal
          key={editing === "new" ? "new" : editing.id}
          lead={editing === "new" ? null : editing}
          open
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}
    </section>
  );
}

function ContactsPageSkeleton() {
  return (
    <section className="mx-auto max-w-[1030px]" aria-label="Kontaktlar yuklanmoqda" aria-busy="true">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-44 rounded-lg" />
          <Skeleton className="mt-2 h-4 w-64 max-w-full rounded" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      <div className="mt-6 flex gap-3">
        <Skeleton className="h-10 w-full max-w-[300px] rounded-xl" />
        <Skeleton className="h-10 w-56 rounded-xl" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-4px_rgba(28,42,70,.06)]">
        <div className="flex gap-8 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="ml-auto h-3 w-24 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-slate-50 px-5 py-4 last:border-0">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="mt-2 h-3 w-52 max-w-full rounded" />
            </div>
            <div className="hidden w-48 space-y-2 md:block">
              <Skeleton className="h-3.5 w-40 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactModal({
  lead,
  open,
  onClose,
  onSaved,
}: {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onSaved: (lead: Lead) => void;
}) {
  const [form, setForm] = useState<ContactValues>(() =>
    makeContactValues(lead),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const update =
    (key: keyof ContactValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((old) => ({ ...old, [key]: e.target.value }));
      if (error) setError("");
    };

  const nameError = touched && !form.contactName.trim();
  const emailError =
    touched &&
    form.contactEmail.trim() !== "" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail);

  const field = {
    fullWidth: true,
    size: "small" as const,
    sx: {
      "& .MuiOutlinedInput-root": {
        borderRadius: 2.5,
        fontSize: 13.5,
        bgcolor: "#fbfcfe",
        transition: "all .15s",
        "&:hover fieldset": { borderColor: "#c7d2fe" },
        "&.Mui-focused fieldset": {
          borderColor: "#5657e9",
          borderWidth: 1.5,
        },
        "&.Mui-focused": {
          bgcolor: "white",
          boxShadow: "0 0 0 4px rgba(86,87,233,0.08)",
        },
      },
      "& .MuiInputLabel-root.Mui-focused": { color: "#5657e9" },
    },
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!form.contactName.trim()) {
      setError("Kontaktning ism-familiyasini kiriting.");
      return;
    }
    if (emailError) {
      setError("Elektron pochta manzilini to'g'ri formatda kiriting.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const body = lead
        ? form
        : {
            ...form,
            name: form.company || form.contactName,
            status: "new",
            value: 0,
          };
      const { data } = lead
        ? await api.patch(`/leads/${lead.id}`, body)
        : await api.post("/leads", body);
      notify.success(lead ? "Kontakt yangilandi" : "Kontakt qo'shildi");
      onSaved(data.lead);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      notify.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={saving ? undefined : onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(15, 23, 42, 0.48)",
            backdropFilter: "blur(3px)",
          },
        },
        paper: {
          sx: {
            width: { xs: "100%", sm: 520 },
            maxWidth: "100vw",
            height: "100dvh",
            border: 0,
            borderRadius: { xs: 0, sm: "24px 0 0 24px" },
            overflow: "hidden",
            boxShadow:
              "-24px 0 60px -20px rgba(15,23,42,0.28), -8px 0 24px -12px rgba(15,23,42,0.14)",
          },
        },
      }}
    >
      <form onSubmit={submit} className="flex h-full min-h-0 flex-col bg-white">
        <header className="shrink-0 border-b border-slate-100 bg-gradient-to-br from-indigo-50/80 via-white to-white px-5 pb-5 pt-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5657e9] to-[#7c3aed] text-white shadow-md shadow-indigo-500/25">
                {lead ? (
                  <HiPencilSquare className="h-5 w-5" />
                ) : (
                  <HiPlus className="h-5 w-5" />
                )}
              </span>
              <div>
                <DialogTitle sx={{ p: 0, fontSize: 19, fontWeight: 750, lineHeight: 1.25, color: "#1f2a44" }}>
                  {lead ? "Kontaktni tahrirlash" : "Yangi kontakt qo'shish"}
                </DialogTitle>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {lead
                    ? "Kontaktning aloqa ma'lumotlarini yangilang."
                    : "Yangi kontakt haqida asosiy ma'lumotlarni kiriting."}
                </p>
              </div>
            </div>

            <Tooltip title="Yopish" arrow>
              <IconButton
                onClick={onClose}
                disabled={saving}
                aria-label="Kontakt oynasini yopish"
                sx={{ color: "#94a3b8", "&:hover": { bgcolor: "#f1f5f9", color: "#475569" } }}
              >
                <HiXMark className="h-5 w-5" />
              </IconButton>
            </Tooltip>
          </div>
        </header>

        <DialogContent
          sx={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            overscrollBehavior: "contain",
            px: { xs: 2.5, sm: 3.5 },
            py: 3.5,
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 transparent",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 999 },
          }}
        >
          <section>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <HiUsers className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Kontakt ma'lumotlari</h3>
                <p className="text-xs text-slate-400">Mijoz bilan bog'lanish uchun</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <ContactFieldLabel required>Ism familiya</ContactFieldLabel>
                <TextField
                  {...field}
                  value={form.contactName}
                  onChange={update("contactName")}
                  onBlur={() => setTouched(true)}
                  error={nameError}
                  helperText={nameError ? "Bu maydon to'ldirilishi shart" : " "}
                  placeholder="Masalan: Alisher Navoiy"
                  autoFocus
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><HiUsers className="h-4 w-4 text-slate-400" /></InputAdornment> } }}
                />
              </div>

              <div>
                <ContactFieldLabel>Kompaniya</ContactFieldLabel>
                <TextField
                  {...field}
                  value={form.company}
                  onChange={update("company")}
                  placeholder="Masalan: Express24"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><HiBuildingOffice2 className="h-4 w-4 text-slate-400" /></InputAdornment> } }}
                />
              </div>

              <div>
                <ContactFieldLabel>Elektron pochta</ContactFieldLabel>
                <TextField
                  {...field}
                  type="email"
                  value={form.contactEmail}
                  onChange={update("contactEmail")}
                  onBlur={() => setTouched(true)}
                  error={emailError}
                  helperText={emailError ? "Email noto'g'ri formatda" : " "}
                  placeholder="contact@example.uz"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><HiEnvelope className="h-4 w-4 text-slate-400" /></InputAdornment> } }}
                />
              </div>

              <div>
                <ContactFieldLabel>Telefon raqami</ContactFieldLabel>
                <TextField
                  {...field}
                  value={form.contactPhone}
                  onChange={update("contactPhone")}
                  placeholder="+998 90 123 45 67"
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><HiPhone className="h-4 w-4 text-slate-400" /></InputAdornment> } }}
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3" role="alert">
              <HiExclamationCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              <div>
                <p className="text-sm font-semibold text-rose-700">Ma'lumotlarni tekshiring</p>
                <p className="mt-0.5 text-xs text-rose-600">{error}</p>
              </div>
            </div>
          )}
        </DialogContent>

        <DialogActions sx={{ flex: "0 0 auto", px: { xs: 2.5, sm: 3.5 }, py: 2, gap: 1, borderTop: "1px solid #f1f5f9", bgcolor: "rgba(255,255,255,.96)", boxShadow: "0 -8px 24px -20px rgba(15,23,42,.35)" }}>
          <p className="mr-auto hidden text-xs text-slate-400 sm:block"><span className="text-rose-500">*</span> majburiy maydon</p>
          <Button
            onClick={onClose}
            disabled={saving}
            color="inherit"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              color: "#64748b",
              px: 2,
            }}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} sx={{ color: "white" }} /> : <HiCheckCircle className="h-4 w-4" />}
            sx={{
              bgcolor: "#5657e9",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              boxShadow: "0 4px 14px rgba(86,87,233,0.28)",
              "&:hover": {
                bgcolor: "#4a4bd6",
                boxShadow: "0 6px 18px rgba(86,87,233,0.36)",
              },
              "&.Mui-disabled": { bgcolor: "#c7d2fe", color: "white" },
            }}
          >
            {saving ? "Saqlanmoqda..." : lead ? "O'zgarishlarni saqlash" : "Kontakt qo'shish"}
          </Button>
        </DialogActions>
      </form>
    </Drawer>
  );
}

function ContactFieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}
