import {
  Button,
  CircularProgress,
  Switch,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  HiBellAlert,
  HiCheckCircle,
  HiCog6Tooth,
  HiKey,
  HiUserCircle,
  HiShieldCheck,
  HiEye,
  HiEyeSlash,
  HiGlobeAlt,
  HiSparkles,
  HiExclamationTriangle,
} from "react-icons/hi2";
import api, {
  getErrorMessage,
  getSession,
  saveSession,
} from "../../services/apiClient";
import { notify } from "../../components/ui/notify";
import { LoadingIndicator } from "../../components/ui/LoadingScreen";
import type { User } from "../../types/crm";

type Tab = "profile" | "password" | "notifications" | "system";

type Profile = {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  company: string;
};

type Preferences = {
  leadUpdates: boolean;
  dailySummary: boolean;
  browserNotifications: boolean;
  compactView: boolean;
  language: "uz" | "ru" | "en";
};

const preferenceKey = "crm_preferences";

const tabs: {
  key: Tab;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    key: "profile",
    label: "Profil",
    description: "Shaxsiy ma'lumotlar",
    icon: HiUserCircle,
    color: "indigo",
  },
  {
    key: "password",
    label: "Parol",
    description: "Xavfsizlik",
    icon: HiKey,
    color: "rose",
  },
  {
    key: "notifications",
    label: "Bildirishnomalar",
    description: "Xabarlar sozlamalari",
    icon: HiBellAlert,
    color: "amber",
  },
  {
    key: "system",
    label: "Tizim",
    description: "Til va ko'rinish",
    icon: HiCog6Tooth,
    color: "violet",
  },
];

const blankPreferences: Preferences = {
  leadUpdates: true,
  dailySummary: false,
  browserNotifications: false,
  compactView: false,
  language: "uz",
};

const profileOf = (user: User): Profile => ({
  fullName: user.fullName ?? "",
  jobTitle: user.jobTitle ?? "",
  email: user.email ?? "",
  phone: user.phone ?? "",
  company: user.company ?? "",
});

const storedPreferences = (): Preferences => {
  try {
    return {
      ...blankPreferences,
      ...JSON.parse(localStorage.getItem(preferenceKey) || "{}"),
    };
  } catch {
    return blankPreferences;
  }
};

export default function Settings() {
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<Profile>(() => {
    const user = getSession()?.user;
    return user
      ? profileOf(user)
      : {
          fullName: "",
          jobTitle: "",
          email: "",
          phone: "",
          company: "",
        };
  });
  const [preferences, setPreferences] =
    useState<Preferences>(storedPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<{ user: User }>("/users/me")
      .then(({ data }) => {
        setProfile(profileOf(data.user));
        setPreferences((old) => ({
          ...old,
          language: data.user.language ?? old.language,
        }));
        const session = getSession();
        if (session)
          saveSession({ ...session, user: data.user });
      })
      .catch((e) => notify.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const initials = useMemo(
    () =>
      profile.fullName
        .split(" ")
        .filter(Boolean)
        .map((name) => name[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "?",
    [profile.fullName]
  );

  const update =
    (key: keyof Profile) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setProfile((old) => ({ ...old, [key]: event.target.value }));

  const syncUser = (user: User) => {
    const session = getSession();
    if (session)
      saveSession({ ...session, user });
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (profile.fullName.trim().length < 2)
      return notify.warning("Ism familiya kamida 2 belgidan iborat bo'lsin.");
    setSaving(true);
    try {
      const { data } = await api.patch<{ user: User }>("/users/me", {
        fullName: profile.fullName.trim(),
        jobTitle: profile.jobTitle.trim(),
        phone: profile.phone.replace(/\s/g, "") || undefined,
        company: profile.company.trim(),
      });
      setProfile(profileOf(data.user));
      syncUser(data.user);
      notify.success("Profil ma'lumotlari saqlandi.");
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async (next: Preferences, saveLanguage = false) => {
    setPreferences(next);
    localStorage.setItem(preferenceKey, JSON.stringify(next));
    if (!saveLanguage) return notify.success("Sozlamalar saqlandi.");
    setSaving(true);
    try {
      const { data } = await api.patch<{ user: User }>("/users/me", {
        language: next.language,
      });
      syncUser(data.user);
      notify.success("Tizim sozlamalari saqlandi.");
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-[1180px] px-1 pb-8">
      {/* Header */}
      <div className="mb-6 animate-[fadeIn_0.4s_ease-out]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white shadow-sm">
            <HiSparkles className="h-3 w-3" />
            Hisob boshqaruvi
          </span>
        </div>
        <h1 className="mt-3 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-[30px] font-bold tracking-tight text-transparent">
          Sozlamalar
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-slate-500">
          Profilingiz, xavfsizlik va ish muhiti parametrlarini qulay boshqaring.
          Barcha o&lsquo;zgarishlar avtomatik saqlanadi.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar Navigation */}
        <nav
          className="animate-[slideUp_0.5s_ease-out_0.1s_backwards] h-fit rounded-2xl border border-slate-200/70 bg-white p-2 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)]"
          aria-label="Sozlamalar bo'limlari"
        >
          {/* Mobile: horizontal scroll */}
          <div className="flex gap-1 overflow-x-auto lg:hidden">
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all ${
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Desktop: vertical */}
          <div className="hidden flex-col gap-1 lg:flex">
            {tabs.map((item, i) => {
              const Icon = item.icon;
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  style={{ animationDelay: `${100 + i * 50}ms` }}
                  className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-200 animate-[fadeIn_0.4s_ease-out_backwards] ${
                    active
                      ? "bg-gradient-to-r from-indigo-50 to-violet-50/50 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {/* Active indicator */}
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-500 to-violet-500" />
                  )}
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[13.5px] font-semibold ${
                        active ? "text-indigo-700" : "text-slate-700"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content Panel */}
        <div className="animate-[slideUp_0.5s_ease-out_0.2s_backwards] overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent px-6 py-5 sm:px-8">
            {tabs.map((item) => {
              if (item.key !== tab) return null;
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="flex items-center gap-3.5 animate-[fadeIn_0.3s_ease-out]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-[17px] font-bold text-slate-800">
                      {item.label}
                    </h2>
                    <p className="text-[12.5px] text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 sm:p-8">
            {loading ? <LoadingState /> : null}
            {!loading && tab === "profile" ? (
              <ProfileTab
                profile={profile}
                initials={initials}
                saving={saving}
                update={update}
                submit={saveProfile}
              />
            ) : null}
            {!loading && tab === "password" ? <PasswordTab /> : null}
            {!loading && tab === "notifications" ? (
              <Notifications preferences={preferences} save={savePreferences} />
            ) : null}
            {!loading && tab === "system" ? (
              <System
                preferences={preferences}
                saving={saving}
                save={savePreferences}
              />
            ) : null}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

/* ---------------- Profile ---------------- */

function ProfileTab({
  profile,
  initials,
  saving,
  update,
  submit,
}: {
  profile: Profile;
  initials: string;
  saving: boolean;
  update: (
    key: keyof Profile
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  submit: (event: React.FormEvent) => void;
}) {
  return (
    <form
      onSubmit={submit}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]"
    >
      <div className="space-y-6">
        <SectionTitle
          icon={<HiUserCircle />}
          title="Shaxsiy ma'lumotlar"
          text="Bu ma'lumotlar CRM ichidagi profilingizda va hujjatlarda ko'rinadi."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Ism familiya"
            value={profile.fullName}
            onChange={update("fullName")}
            required
            placeholder="Ism va familiyangiz"
          />
          <Field
            label="Lavozim"
            value={profile.jobTitle}
            onChange={update("jobTitle")}
            placeholder="Masalan, Sotuv menejeri"
          />
          <Field
            label="Email manzil"
            value={profile.email}
            disabled
            helper="Email xavfsizlik uchun bu yerda o'zgarmaydi."
          />
          <Field
            label="Telefon raqami"
            value={profile.phone}
            onChange={update("phone")}
            placeholder="+998 90 111 22 33"
          />
          <div className="sm:col-span-2">
            <Field
              label="Kompaniya nomi"
              value={profile.company}
              onChange={update("company")}
              placeholder="Kompaniya nomini kiriting"
            />
          </div>
        </div>

        <Save saving={saving}>O&lsquo;zgarishlarni saqlash</Save>
      </div>

      {/* Avatar Card */}
      <aside className="flex h-fit flex-col items-center rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 via-white to-white p-6 text-center">
        <div className="relative">
          <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 text-[28px] font-bold text-white shadow-xl shadow-indigo-500/30">
            {initials}
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-md">
            <HiShieldCheck className="h-4 w-4" />
          </span>
        </div>

        <p className="mt-4 text-[14px] font-bold text-slate-800">
          {profile.fullName || "Profilingiz"}
        </p>
        {profile.jobTitle && (
          <p className="mt-0.5 text-[12px] text-slate-500">
            {profile.jobTitle}
          </p>
        )}

        <div className="mt-4 w-full border-t border-slate-100 pt-4">
          <p className="text-[11px] leading-relaxed text-slate-400">
            Avatar ismingizning bosh harflaridan avtomatik yaratiladi.
          </p>
        </div>
      </aside>
    </form>
  );
}

/* ---------------- Password ---------------- */

function PasswordTab() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const update =
    (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((old) => ({ ...old, [key]: event.target.value }));

  // Password strength
  const strength = useMemo(() => {
    const p = form.newPassword;
    if (!p) return { score: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 2)
      return { score, label: "Zaif", color: "bg-rose-500", text: "text-rose-600" };
    if (score === 3)
      return {
        score,
        label: "O'rtacha",
        color: "bg-amber-500",
        text: "text-amber-600",
      };
    if (score === 4)
      return {
        score,
        label: "Yaxshi",
        color: "bg-blue-500",
        text: "text-blue-600",
      };
    return {
      score,
      label: "Kuchli",
      color: "bg-emerald-500",
      text: "text-emerald-600",
    };
  }, [form.newPassword]);

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.newPassword === form.confirmPassword;
  const passwordsMismatch =
    form.confirmPassword.length > 0 &&
    form.newPassword !== form.confirmPassword;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword)
      return notify.warning("Yangi parollar bir xil emas.");
    setSaving(true);
    try {
      await api.patch("/users/me/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      notify.success(
        "Parol yangilandi. Boshqa qurilmalarda qayta kirish talab qilinadi."
      );
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-[640px] space-y-6">
      <SectionTitle
        icon={<HiKey />}
        title="Parolni yangilash"
        text="Kuchli parol hisobingizni himoya qiladi. Parolni hech kim bilan bo'lishmang."
      />

      {/* Security tip */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50/70 to-transparent p-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
          <HiExclamationTriangle className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[12.5px] font-semibold text-amber-800">
            Xavfsizlik tavsiyasi
          </p>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-amber-700/80">
            Kamida 8 belgi, katta-kichik harflar, raqam va maxsus belgi
            ishlating. Har 3 oyda parolni yangilang.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <PasswordField
          label="Joriy parol"
          value={form.currentPassword}
          onChange={update("currentPassword")}
          autoComplete="current-password"
          required
          show={showCurrent}
          onToggle={() => setShowCurrent((v) => !v)}
        />
        <PasswordField
          label="Yangi parol"
          value={form.newPassword}
          onChange={update("newPassword")}
          autoComplete="new-password"
          required
          show={showNew}
          onToggle={() => setShowNew((v) => !v)}
        />

        {/* Strength meter */}
        {form.newPassword && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">
                Parol kuchi
              </span>
              <span
                className={`text-[11px] font-bold ${strength.text}`}
              >
                {strength.label}
              </span>
            </div>
            <div className="mt-1.5 flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength.score ? strength.color : "bg-slate-100"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <PasswordField
          label="Yangi parolni tasdiqlang"
          value={form.confirmPassword}
          onChange={update("confirmPassword")}
          autoComplete="new-password"
          required
          show={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
          error={passwordsMismatch}
          success={passwordsMatch}
        />
      </div>

      <Save saving={saving}>Parolni yangilash</Save>
    </form>
  );
}

/* ---------------- Notifications ---------------- */

function Notifications({
  preferences,
  save,
}: {
  preferences: Preferences;
  save: (value: Preferences) => void;
}) {
  const rows: {
    key: keyof Pick<
      Preferences,
      "leadUpdates" | "dailySummary" | "browserNotifications"
    >;
    title: string;
    text: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      key: "leadUpdates",
      title: "Lead yangilanishlari",
      text: "Lead holati yoki ma'lumotlari o'zgarganda darhol xabar bering.",
      icon: HiBellAlert,
    },
    {
      key: "dailySummary",
      title: "Kunlik qisqa hisobot",
      text: "Har kuni sotuv faolligi bo'yicha umumiy eslatma oling.",
      icon: HiSparkles,
    },
    {
      key: "browserNotifications",
      title: "Brauzer bildirishnomalari",
      text: "Yoqilganda brauzerdan ruxsat so'raladi va desktopda ko'rsatiladi.",
      icon: HiGlobeAlt,
    },
  ];

  const browserSupported = "Notification" in window;
  const browserPermission = browserSupported
    ? Notification.permission
    : "denied";

  const toggle = async (
    key: typeof rows[number]["key"],
    checked: boolean
  ) => {
    if (key === "browserNotifications" && checked) {
      if (!browserSupported) {
        notify.warning("Brauzeringiz bildirishnomalarni qo'llab-quvvatlamaydi.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        notify.warning("Brauzer bildirishnomalariga ruxsat berilmadi.");
        return save({ ...preferences, browserNotifications: false });
      }
    }
    save({ ...preferences, [key]: checked });
  };

  return (
    <div className="max-w-[760px] space-y-6">
      <SectionTitle
        icon={<HiBellAlert />}
        title="Bildirishnomalar"
        text="Qaysi voqealar haqida va qanday usulda xabar olishni tanlang."
      />

      {/* Browser permission banner */}
      {browserSupported && browserPermission === "denied" && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50/70 to-transparent p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
            <HiExclamationTriangle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[12.5px] font-semibold text-rose-800">
              Brauzer bildirishnomalari bloklangan
            </p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-rose-700/80">
              Brauzer sozlamalaridan ruxsat bering, aks holda bildirishnomalar
              ko'rinmaydi.
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {rows.map(({ key, title, text, icon: Icon }, i) => (
          <div
            key={key}
            className={`flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-slate-50/50 sm:px-5 ${
              i !== rows.length - 1 ? "border-b border-slate-100" : ""
            }`}
          >
            <div className="flex items-start gap-3.5">
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  preferences[key]
                    ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13.5px] font-semibold text-slate-700">
                  {title}
                </p>
                <p className="mt-0.5 max-w-md text-[11.5px] leading-relaxed text-slate-500">
                  {text}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences[key]}
              onChange={(_, value) => void toggle(key, value)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "#4f46e5" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  bgcolor: "#6366f1",
                },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- System ---------------- */

function System({
  preferences,
  saving,
  save,
}: {
  preferences: Preferences;
  saving: boolean;
  save: (value: Preferences, language?: boolean) => void;
}) {
  const languages: {
    value: Preferences["language"];
    label: string;
    flag: string;
    native: string;
  }[] = [
    { value: "uz", label: "O'zbekcha", flag: "🇺🇿", native: "UZ" },
    { value: "ru", label: "Русский", flag: "🇷🇺", native: "RU" },
    { value: "en", label: "English", flag: "🇬🇧", native: "EN" },
  ];

  return (
    <div className="max-w-[760px] space-y-6">
      <SectionTitle
        icon={<HiCog6Tooth />}
        title="Tizim sozlamalari"
        text="Ish joyingiz ko'rinishi, tili va shaxsiy imtiyozlarini moslang."
      />

      {/* Language selector */}
      <div className="rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
            <HiGlobeAlt className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[13.5px] font-semibold text-slate-700">
              Interfeys tili
            </p>
            <p className="mt-0.5 text-[11.5px] text-slate-500">
              Tanlov profilingizga saqlanadi.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {languages.map((lang) => {
            const active = preferences.language === lang.value;
            return (
              <button
                key={lang.value}
                type="button"
                disabled={saving}
                onClick={() =>
                  save({ ...preferences, language: lang.value }, true)
                }
                className={`group relative flex items-center gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition-all duration-200 disabled:opacity-50 ${
                  active
                    ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-violet-50/50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[13px] font-bold ${
                      active ? "text-indigo-700" : "text-slate-700"
                    }`}
                  >
                    {lang.label}
                  </p>
                  <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-400">
                    {lang.native}
                  </p>
                </div>
                {active && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white">
                    <HiCheckCircle className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact view toggle */}
      <div className="rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                preferences.compactView
                  ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <HiSparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-slate-700">
                Ixcham ko&lsquo;rinish
              </p>
              <p className="mt-0.5 max-w-md text-[11.5px] leading-relaxed text-slate-500">
                Jadvallar va kartalardagi bo&lsquo;sh joyni qisqartiradi — bir
                ekranda ko&lsquo;proq ma&lsquo;lumot ko&lsquo;rinadi.
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.compactView}
            onChange={(_, checked) =>
              save({ ...preferences, compactView: checked })
            }
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: "#4f46e5" },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                bgcolor: "#6366f1",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Shared Components ---------------- */

function SectionTitle({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25 [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </span>
      <div>
        <h3 className="text-[15px] font-bold text-slate-800">{title}</h3>
        <p className="mt-0.5 max-w-xl text-[12.5px] leading-relaxed text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  helper,
  ...props
}: React.ComponentProps<typeof TextField> & { label: string; helper?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-bold text-slate-700">
        {label}
      </label>
      <TextField
        {...props}
        size="small"
        fullWidth
        helperText={helper}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            bgcolor: props.disabled ? "#f8fafc" : "#fff",
            transition: "all 0.2s",
            "&:hover fieldset": { borderColor: "#c7d2fe" },
            "&.Mui-focused fieldset": {
              borderColor: "#6366f1",
              borderWidth: "1.5px",
            },
          },
          "& .MuiInputBase-input": { fontSize: 13.5 },
          "& .MuiFormHelperText-root": { fontSize: 11, mt: 0.5 },
        }}
      />
    </div>
  );
}

function PasswordField({
  label,
  show,
  onToggle,
  error,
  success,
  ...props
}: React.ComponentProps<typeof TextField> & {
  label: string;
  show: boolean;
  onToggle: () => void;
  error?: boolean;
  success?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-bold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <TextField
          {...props}
          type={show ? "text" : "password"}
          size="small"
          fullWidth
          error={error}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              bgcolor: "#fff",
              pr: 5,
              "&:hover fieldset": { borderColor: "#c7d2fe" },
              "&.Mui-focused fieldset": {
                borderColor: success ? "#10b981" : "#6366f1",
                borderWidth: "1.5px",
              },
              "&.Mui-error fieldset": { borderColor: "#f43f5e" },
            },
            "& .MuiInputBase-input": { fontSize: 13.5 },
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Parolni yashirish" : "Parolni ko'rsatish"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          {show ? (
            <HiEyeSlash className="h-4 w-4" />
          ) : (
            <HiEye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-[11px] font-medium text-rose-500">
          Parollar bir xil emas
        </p>
      )}
      {success && (
        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
          <HiCheckCircle className="h-3 w-3" />
          Parollar mos keladi
        </p>
      )}
    </div>
  );
}

function Save({
  saving,
  children,
}: {
  saving: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="submit"
      variant="contained"
      disabled={saving}
      startIcon={
        saving ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <HiCheckCircle />
        )
      }
      sx={{
        mt: 6,
        borderRadius: "10px",
        px: 2.5,
        py: 1.15,
        bgcolor: "#4f46e5",
        textTransform: "none",
        fontSize: 13.5,
        fontWeight: 700,
        boxShadow: "0 10px 22px -10px rgba(79,70,229,.75)",
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: "#4338ca",
          boxShadow: "0 12px 26px -10px rgba(79,70,229,.9)",
          transform: "translateY(-1px)",
        },
      }}
    >
      {children}
    </Button>
  );
}

function LoadingState() {
  return <LoadingIndicator />;
}
