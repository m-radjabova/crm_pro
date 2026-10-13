import {
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
import { useState } from "react";
import {
  HiXMark,
  HiUser,
  HiBuildingOffice2,
  HiCurrencyDollar,
  HiEnvelope,
  HiPhone,
  HiDocumentText,
  HiFlag,
  HiSparkles,
  HiPencilSquare,
  HiCheckCircle,
  HiExclamationCircle,
  HiCalendarDays,
} from "react-icons/hi2";
import api, { getErrorMessage } from "../../../services/apiClient";
import { notify } from "../../../components/ui/notify";
import type { Lead, LeadStatus } from "../../../types/crm";

type Props = {
  open: boolean;
  lead?: Lead | null;
  onClose: () => void;
  onSaved: (lead: Lead) => void;
};

type Values = {
  name: string;
  company: string;
  description: string;
  value: string;
  status: LeadStatus;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  nextActionAt: string;
  nextActionType: "call" | "meeting" | "follow_up";
};

const blank: Values = {
  name: "",
  company: "",
  description: "",
  value: "0",
  status: "new",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  nextActionAt: "",
  nextActionType: "follow_up",
};

const STATUS_OPTIONS: {
  value: LeadStatus;
  label: string;
  dot: string;
}[] = [
  { value: "new", label: "Yangi", dot: "bg-blue-500" },
  { value: "in_progress", label: "Jarayonda", dot: "bg-amber-500" },
  { value: "proposal", label: "Taklif yuborilgan", dot: "bg-purple-500" },
  { value: "won", label: "Yutildi", dot: "bg-emerald-500" },
  { value: "lost", label: "Yo'qotildi", dot: "bg-rose-500" },
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: 13.5,
    bgcolor: "#fbfcfe",
    transition: "all .15s ease",
    "& fieldset": { borderColor: "#e5e9f0" },
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
  "& .MuiInputLabel-root": { fontSize: 13.5 },
  "& .MuiInputLabel-root.Mui-focused": { color: "#5657e9" },
  "& .MuiInputBase-input::placeholder": {
    color: "#94a3b8",
    opacity: 1,
  },
};

const makeValues = (lead: Lead | null | undefined): Values =>
  lead
    ? {
        name: lead.name,
        company: lead.company || "",
        description: lead.description || "",
        value: String(lead.value),
        status: lead.status,
        contactName: lead.contactName || "",
        contactEmail: lead.contactEmail || "",
        contactPhone: lead.contactPhone || "",
        nextActionAt: lead.nextActionAt ? new Date(lead.nextActionAt).toISOString().slice(0, 16) : "",
        nextActionType: lead.nextActionType || "follow_up",
      }
    : blank;

export default function LeadModal({ open, lead, onClose, onSaved }: Props) {
  const [values, setValues] = useState<Values>(() => makeValues(lead));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const change =
    (key: keyof Values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((old) => ({ ...old, [key]: e.target.value }));
      if (error) setError("");
    };

  const nameError = touched && !values.name.trim();
  const emailError =
    touched &&
    values.contactEmail.trim() !== "" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!values.name.trim()) {
      setError("Mijoz / lead nomini kiriting.");
      return;
    }
    if (emailError) {
      setError("Email manzili noto'g'ri formatda.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const { status, ...rest } = values;
      const body = {
        ...rest,
        name: rest.name.trim(),
        value: Number(rest.value) || 0,
      };
      const { data } = lead
        ? await api.patch(`/leads/${lead.id}`, body)
        : await api.post("/leads", body);

      let saved = data.lead as Lead;
      if (saved.status !== status) {
        ({
          data: { lead: saved },
        } = await api.patch(`/leads/${saved.id}/status`, { status }));
      }

      notify.success(lead ? "Lead yangilandi" : "Yangi lead yaratildi");
      onSaved(saved);
      onClose();
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
            width: { xs: "100%", sm: 620 },
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
        <div className="relative shrink-0 border-b border-slate-100 bg-gradient-to-br from-indigo-50/80 via-white to-white px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#5657e9] to-[#7c3aed] text-white shadow-md shadow-indigo-500/25">
                {lead ? (
                  <HiPencilSquare className="h-5 w-5" />
                ) : (
                  <HiSparkles className="h-5 w-5" />
                )}
              </div>
              <div>
                <DialogTitle
                  sx={{
                    p: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1f2a44",
                    lineHeight: 1.2,
                  }}
                >
                  {lead ? "Leadni tahrirlash" : "Yangi lead yaratish"}
                </DialogTitle>
                <p className="mt-1 text-xs text-slate-500">
                  {lead
                    ? "Ma'lumotlarni yangilab, saqlash tugmasini bosing."
                    : "Yangi mijoz haqida asosiy ma'lumotlarni kiriting."}
                </p>
              </div>
            </div>

            <Tooltip title="Yopish" arrow>
              <IconButton
                onClick={onClose}
                disabled={saving}
                aria-label="Yopish"
                sx={{
                  color: "#94a3b8",
                  "&:hover": { bgcolor: "#f1f5f9", color: "#475569" },
                }}
              >
                <HiXMark className="h-5 w-5" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <DialogContent
          sx={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            overscrollBehavior: "contain",
            px: { xs: 2.5, sm: 3.5 },
            py: 3,
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 transparent",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: "#cbd5e1",
              borderRadius: 999,
            },
            "&::-webkit-scrollbar-thumb:hover": { background: "#94a3b8" },
          }}
        >
          <div className="space-y-6">
            <Section
              icon={HiUser}
              title="Asosiy ma'lumotlar"
              subtitle="Lead nomi va kompaniya haqida"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel required>Mijoz / lead nomi</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    value={values.name}
                    onChange={change("name")}
                    onBlur={() => setTouched(true)}
                    error={nameError}
                    helperText={
                      nameError ? "Bu maydon to'ldirilishi shart" : " "
                    }
                    placeholder="Masalan: Afka Group"
                    sx={fieldSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <HiUser className="h-4 w-4 text-slate-400" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </div>

                <div>
                  <FieldLabel>Kompaniya</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    value={values.company}
                    onChange={change("company")}
                    placeholder="Kompaniya nomi"
                    sx={fieldSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <HiBuildingOffice2 className="h-4 w-4 text-slate-400" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </div>

                <div>
                  <FieldLabel>Qiymat (USD)</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    slotProps={{
                      htmlInput: { min: 0, step: 100 },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <HiCurrencyDollar className="h-4 w-4 text-slate-400" />
                          </InputAdornment>
                        ),
                      },
                    }}
                    value={values.value}
                    onChange={change("value")}
                    placeholder="0"
                    sx={{
                      ...fieldSx,
                      "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
                        { WebkitAppearance: "none", margin: 0 },
                    }}
                  />
                </div>
              </div>
            </Section>

            <Section
              icon={HiCalendarDays}
              title="Keyingi aloqa"
              subtitle="Calendar ushbu lead bo'yicha avtomatik shakllanadi"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Rejalashtirilgan sana va vaqt</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    value={values.nextActionAt}
                    onChange={change("nextActionAt")}
                    sx={fieldSx}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </div>
                <div>
                  <FieldLabel>Aloqa turi</FieldLabel>
                  <Select
                    fullWidth
                    size="small"
                    value={values.nextActionType}
                    onChange={(event) => setValues((old) => ({ ...old, nextActionType: event.target.value as Values["nextActionType"] }))}
                    sx={{ borderRadius: "10px", bgcolor: "#fbfcfe", fontSize: 13.5 }}
                  >
                    <MenuItem value="follow_up">Follow-up</MenuItem>
                    <MenuItem value="call">Qo'ng'iroq</MenuItem>
                    <MenuItem value="meeting">Uchrashuv</MenuItem>
                  </Select>
                </div>
              </div>
            </Section>

            <Section
              icon={HiFlag}
              title="Holat"
              subtitle="Lead qaysi bosqichda turibdi"
            >
              <div>
                <FieldLabel>Joriy holat</FieldLabel>
                <TextField
                  fullWidth
                  select
                  size="small"
                  value={values.status}
                  onChange={change("status")}
                  sx={fieldSx}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
                        {opt.label}
                      </span>
                    </MenuItem>
                  ))}
                </TextField>
              </div>
            </Section>

            <Section
              icon={HiPhone}
              title="Aloqa ma'lumotlari"
              subtitle="Mijoz bilan bog'lanish uchun"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel>Kontakt shaxs</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    value={values.contactName}
                    onChange={change("contactName")}
                    placeholder="Masalan: Alisher Navoiy"
                    sx={fieldSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <HiUser className="h-4 w-4 text-slate-400" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </div>

                <div>
                  <FieldLabel>Email</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    value={values.contactEmail}
                    onChange={change("contactEmail")}
                    onBlur={() => setTouched(true)}
                    error={emailError}
                    helperText={emailError ? "Email noto'g'ri formatda" : " "}
                    placeholder="email@example.com"
                    sx={fieldSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <HiEnvelope className="h-4 w-4 text-slate-400" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </div>

                <div>
                  <FieldLabel>Telefon</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    value={values.contactPhone}
                    onChange={change("contactPhone")}
                    placeholder="+998 90 123 45 67"
                    sx={fieldSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <HiPhone className="h-4 w-4 text-slate-400" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </div>
              </div>
            </Section>

            <Section
              icon={HiDocumentText}
              title="Tavsif"
              subtitle="Qo'shimcha izohlar (ixtiyoriy)"
            >
              <div>
                <FieldLabel>Batafsil ma'lumot</FieldLabel>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={3}
                  maxRows={6}
                  value={values.description}
                  onChange={change("description")}
                  placeholder="Loyiha, ehtiyojlar yoki qo'shimcha izohlar..."
                  sx={{
                    ...fieldSx,
                    "& .MuiOutlinedInput-root": {
                      ...fieldSx["& .MuiOutlinedInput-root"],
                      alignItems: "flex-start",
                    },
                  }}
                />
                <p className="mt-1.5 text-right text-[11px] text-slate-400">
                  {values.description.length} / 500
                </p>
              </div>
            </Section>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <HiExclamationCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              <div>
                <p className="text-sm font-semibold text-rose-700">
                  Xatolik yuz berdi
                </p>
                <p className="mt-0.5 text-xs text-rose-600">{error}</p>
              </div>
            </div>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            flex: "0 0 auto",
            px: { xs: 2.5, sm: 3.5 },
            py: 2,
            gap: 1,
            borderTop: "1px solid #f1f5f9",
            bgcolor: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 -8px 24px -20px rgba(15,23,42,0.35)",
          }}
        >
          <p className="mr-auto hidden text-xs text-slate-400 sm:block">
            <span className="text-rose-500">*</span> belgilangan maydonlar
            majburiy
          </p>

          <Button
            onClick={onClose}
            disabled={saving}
            color="inherit"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              color: "#64748b",
              px: 2.5,
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            Bekor qilish
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={14} sx={{ color: "white" }} />
              ) : (
                <HiCheckCircle className="h-4 w-4" />
              )
            }
            sx={{
              bgcolor: "#5657e9",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              px: 3,
              boxShadow: "0 4px 14px rgba(86,87,233,0.28)",
              transition: "all .18s",
              "&:hover": {
                bgcolor: "#4a4bd6",
                boxShadow: "0 6px 18px rgba(86,87,233,0.36)",
                transform: "translateY(-1px)",
              },
              "&.Mui-disabled": {
                bgcolor: "#c7d2fe",
                color: "white",
                boxShadow: "none",
              },
            }}
          >
            {saving
              ? "Saqlanmoqda..."
              : lead
                ? "O'zgarishlarni saqlash"
                : "Lead yaratish"}
          </Button>
        </DialogActions>
      </form>
    </Drawer>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="pl-0 sm:pl-9.5">{children}</div>
    </section>
  );
}

function FieldLabel({
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
