import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import {
  HiBuildingOffice2,
  HiXMark,
  HiUserCircle,
  HiEnvelope,
  HiPhone,
  HiGlobeAlt,
  HiBriefcase,
  HiDocumentText,
  HiCheckBadge,
  HiSparkles,
  HiArchiveBox,
} from "react-icons/hi2";
import { getErrorMessage } from "../../../services/apiClient";
import { notify } from "../../../components/ui/notify";
import {
  useCreateCompany,
  useUpdateCompany,
  type CompanyPayload,
} from "../../../hooks/useCompanies";
import type { Company, CompanyStatus } from "../../../types/crm";

type Props = { open: boolean; company: Company | null; onClose: () => void };

const initial: CompanyPayload = {
  name: "",
  industry: "",
  description: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  status: "prospect",
};

const valuesFor = (company: Company | null): CompanyPayload =>
  company
    ? {
        name: company.name,
        industry: company.industry || "",
        description: company.description || "",
        contactName: company.contactName || "",
        contactEmail: company.contactEmail || "",
        contactPhone: company.contactPhone || "",
        website: company.website || "",
        status: company.status,
      }
    : initial;

const STATUS_OPTIONS: {
  value: CompanyStatus;
  label: string;
  desc: string;
  color: string;
  bg: string;
  ring: string;
  Icon: typeof HiCheckBadge;
}[] = [
  {
    value: "active",
    label: "Hamkor",
    desc: "Faol hamkorlik",
    color: "#059669",
    bg: "#ecfdf5",
    ring: "#a7f3d0",
    Icon: HiCheckBadge,
  },
  {
    value: "prospect",
    label: "Potensial",
    desc: "Muzokarada",
    color: "#d97706",
    bg: "#fffbeb",
    ring: "#fde68a",
    Icon: HiSparkles,
  },
  {
    value: "inactive",
    label: "Nofaol",
    desc: "Aloqa yo'q",
    color: "#64748b",
    bg: "#f1f5f9",
    ring: "#cbd5e1",
    Icon: HiArchiveBox,
  },
];

export default function CompanyModal({ open, company, onClose }: Props) {
  const create = useCreateCompany();
  const update = useUpdateCompany();
  const [form, setForm] = useState<CompanyPayload>(() => valuesFor(company));

  const change =
    (key: keyof CompanyPayload) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const saving = create.isPending || update.isPending;
  const isValid = form.name.trim().length > 0;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return notify.error("Kompaniya nomini kiriting");
    try {
      if (company) await update.mutateAsync({ id: company.id, payload: form });
      else await create.mutateAsync(form);
      notify.success(
        company ? "Kompaniya yangilandi" : "Yangi kompaniya qo'shildi",
      );
      onClose();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 24px 60px -20px rgba(15,23,42,.35)",
          },
        },
      }}
    >
      <form onSubmit={submit}>
        {/* ============ HEADER ============ */}
        <DialogTitle
          sx={{
            p: 0,
            background:
              "linear-gradient(135deg, #eef2ff 0%, #ffffff 55%, #ffffff 100%)",
            borderBottom: "1px solid #eef2f7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 3,
            py: 2.25,
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="grid h-11 w-11 place-items-center rounded-xl text-white shadow-[0_6px_18px_-6px_rgba(86,87,233,.6)]"
              style={{
                background: "linear-gradient(135deg, #6366f1, #5657e9)",
              }}
            >
              <HiBuildingOffice2 className="h-5.5 w-5.5" />
            </span>
            <div>
              <h2 className="text-[17px] font-bold leading-tight text-[#1f2a44]">
                {company ? "Kompaniyani tahrirlash" : "Yangi kompaniya"}
              </h2>
              <p className="mt-0.5 text-[12px] text-slate-400">
                {company
                  ? "Ma'lumotlarni yangilang va saqlang"
                  : "Yangi hamkor kompaniyani ro'yxatga oling"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label="Yopish"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </DialogTitle>

        {/* ============ BODY ============ */}
        <DialogContent sx={{ px: 3, py: 3 }}>
          <div className="space-y-6">
            {/* ---- Section 1: Asosiy ---- */}
            <Section
              title="Asosiy ma'lumotlar"
              subtitle="Kompaniyaning nomi va faoliyat sohasi"
              icon={<HiBriefcase className="h-4 w-4" />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Kompaniya nomi"
                  value={form.name}
                  onChange={change("name")}
                  required
                  autoFocus
                  fullWidth
                  placeholder="Masalan, TechnoSoft MChJ"
                  sx={inputSx}
                />
                <TextField
                  label="Sanoat sohasi"
                  value={form.industry}
                  onChange={change("industry")}
                  fullWidth
                  placeholder="Masalan, IT xizmatlari"
                  sx={inputSx}
                />
              </div>
            </Section>

            {/* ---- Section 2: Kontakt ---- */}
            <Section
              title="Kontakt ma'lumotlari"
              subtitle="Aloqa uchun shaxs va kanallar"
              icon={<HiUserCircle className="h-4 w-4" />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Kontakt shaxs"
                  value={form.contactName}
                  onChange={change("contactName")}
                  fullWidth
                  placeholder="Ism familiya"
                  slotProps={{ input: {
                    startAdornment: <FieldIcon icon={<HiUserCircle />} />,
                  } }}
                  sx={inputSx}
                />
                <TextField
                  label="Telefon"
                  value={form.contactPhone}
                  onChange={change("contactPhone")}
                  fullWidth
                  placeholder="+998 90 123 45 67"
                  slotProps={{ input: {
                    startAdornment: <FieldIcon icon={<HiPhone />} />,
                  } }}
                  sx={inputSx}
                />
                <TextField
                  label="Email"
                  type="email"
                  value={form.contactEmail}
                  onChange={change("contactEmail")}
                  fullWidth
                  placeholder="info@example.uz"
                  slotProps={{ input: {
                    startAdornment: <FieldIcon icon={<HiEnvelope />} />,
                  } }}
                  sx={inputSx}
                />
                <TextField
                  label="Veb-sayt"
                  value={form.website}
                  onChange={change("website")}
                  fullWidth
                  placeholder="https://example.uz"
                  slotProps={{ input: {
                    startAdornment: <FieldIcon icon={<HiGlobeAlt />} />,
                  } }}
                  sx={inputSx}
                />
              </div>
            </Section>

            {/* ---- Section 3: Status ---- */}
            <Section
              title="Holat"
              subtitle="Kompaniya bilan munosabatlar darajasi"
              icon={<HiCheckBadge className="h-4 w-4" />}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {STATUS_OPTIONS.map((opt) => {
                  const active = form.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setForm((c) => ({ ...c, status: opt.value }))
                      }
                      className={`group relative flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
                        active
                          ? "shadow-[0_6px_18px_-8px_rgba(15,23,42,.25)]"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                      style={
                        active
                          ? {
                              borderColor: opt.color,
                              backgroundColor: opt.bg,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg transition group-hover:scale-105"
                        style={{
                          backgroundColor: active
                            ? "#ffffff"
                            : opt.bg,
                          color: opt.color,
                          boxShadow: active
                            ? `0 2px 6px ${opt.ring}`
                            : "none",
                        }}
                      >
                        <opt.Icon className="h-4.5 w-4.5" />
                      </span>
                      <div className="min-w-0">
                        <div
                          className="text-[13px] font-bold leading-tight"
                          style={{ color: active ? opt.color : "#334155" }}
                        >
                          {opt.label}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-400">
                          {opt.desc}
                        </div>
                      </div>
                      {active && (
                        <span
                          className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full text-white"
                          style={{ backgroundColor: opt.color }}
                        >
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* ---- Section 4: Izoh ---- */}
            <Section
              title="Qo'shimcha izoh"
              subtitle="Kompaniya haqida foydali ma'lumotlar"
              icon={<HiDocumentText className="h-4 w-4" />}
            >
              <TextField
                value={form.description || ""}
                onChange={change("description")}
                multiline
                minRows={3}
                maxRows={6}
                fullWidth
                placeholder="Masalan, hamkorlik shartlari, kelishuvlar..."
                slotProps={{ htmlInput: { maxLength: 500 } }}
                sx={inputSx}
              />
              <div className="mt-1.5 flex justify-end">
                <span className="text-[11px] font-medium text-slate-400">
                  {(form.description || "").length} / 500
                </span>
              </div>
            </Section>
          </div>
        </DialogContent>

        {/* ============ FOOTER ============ */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            gap: 1,
            borderTop: "1px solid #eef2f7",
            backgroundColor: "#fafbfd",
          }}
        >
          <Button
            disabled={saving}
            onClick={onClose}
            color="inherit"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              px: 2,
            }}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            disabled={saving || !isValid}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              px: 2.5,
              bgcolor: "#5657e9",
              boxShadow: "0 4px 14px rgba(86,87,233,.32)",
              "&:hover": {
                bgcolor: "#4546cb",
                boxShadow: "0 6px 20px rgba(86,87,233,.4)",
              },
              "&.Mui-disabled": {
                bgcolor: "#c7c8f4",
                color: "#fff",
                boxShadow: "none",
              },
            }}
          >
            {saving ? (
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
                    opacity="0.25"
                  />
                  <path
                    d="M22 12a10 10 0 0 1-10 10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                Saqlanmoqda...
              </span>
            ) : (
              "Saqlash"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

/* ==================== SUB-COMPONENTS ==================== */

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "11px",
    fontSize: 14,
    backgroundColor: "#fff",
    transition: "all .15s ease",
    "& fieldset": { borderColor: "#e2e8f0" },
    "&:hover fieldset": { borderColor: "#cbd5e1" },
    "&.Mui-focused fieldset": {
      borderColor: "#6366f1",
      borderWidth: "1.5px",
    },
    "&.Mui-focused": {
      boxShadow: "0 0 0 4px rgba(99,102,241,.08)",
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: 13,
    fontWeight: 600,
    color: "#64748b",
    "&.Mui-focused": { color: "#5657e9" },
  },
} as const;

function Section({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </span>
        <div>
          <h3 className="text-[13px] font-bold leading-tight text-[#1f2a44]">
            {title}
          </h3>
          <p className="text-[11.5px] text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function FieldIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="mr-1 grid h-5 w-5 place-items-center text-slate-400">
      {icon}
    </span>
  );
}
