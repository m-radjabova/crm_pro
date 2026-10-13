import { Avatar, MenuItem, Select, Tooltip } from "@mui/material";
import { useMemo, useState } from "react";
import {
  HiMagnifyingGlass,
  HiUserGroup,
  HiXMark,
  HiShieldCheck,
  HiUserCircle,
  HiUsers,
  HiCheckCircle,
  HiXCircle,
  HiChevronLeft,
  HiChevronRight,
  HiEnvelope,
} from "react-icons/hi2";
import { useQuery } from "@tanstack/react-query";
import api, { getErrorMessage, getSession } from "../../services/apiClient";
import { notify } from "../../components/ui/notify";
import Skeleton from "../../components/ui/Skeleton";
import { useAdminUsers, useChangeUserRole } from "../../hooks/useAdminUsers";
import type { Role, User } from "../../types/crm";

type Stats = {
  total: number;
  administrators: number;
  managers: number;
  active: number;
};

const ROLE_META: Record<
  Role,
  {
    label: string;
    bg: string;
    text: string;
    dot: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  admin: {
    label: "Administrator",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
    icon: HiShieldCheck,
  },
  manager: {
    label: "Manager",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    icon: HiUserCircle,
  },
  user: {
    label: "User",
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-400",
    icon: HiUsers,
  },
};

const isRole = (role: unknown): role is Role =>
  typeof role === "string" && Object.hasOwn(ROLE_META, role);
const getRoleMeta = (role: unknown) => ROLE_META[isRole(role) ? role : "user"];

const AVATAR_COLORS = [
  { bg: "#eef2ff", fg: "#4f46e5" },
  { bg: "#fdf2f8", fg: "#db2777" },
  { bg: "#ecfdf5", fg: "#059669" },
  { bg: "#fff7ed", fg: "#ea580c" },
  { bg: "#eff6ff", fg: "#2563eb" },
  { bg: "#f5f3ff", fg: "#7c3aed" },
];
const colorOf = (name: string) =>
  AVATAR_COLORS[
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
      AVATAR_COLORS.length
  ];
const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function Admin() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminUsers(page, search);
  const stats = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
  });
  const changeRole = useChangeUserRole();
  const currentUser = getSession()?.user;

  const updateRole = async (user: User, role: Role) => {
    if (user.role === role) return;
    try {
      await changeRole.mutateAsync({ id: user.id, role });
      notify.success(
        `${user.fullName} roli ${ROLE_META[role].label} etib yangilandi`,
      );
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const cards = useMemo(
    () => [
      {
        label: "Jami foydalanuvchi",
        value: stats.data?.total ?? 0,
        icon: HiUsers,
        tint: "indigo" as const,
      },
      {
        label: "Administratorlar",
        value: stats.data?.administrators ?? 0,
        icon: HiShieldCheck,
        tint: "purple" as const,
      },
      {
        label: "Managerlar",
        value: stats.data?.managers ?? 0,
        icon: HiUserCircle,
        tint: "blue" as const,
      },
      {
        label: "Faol foydalanuvchilar",
        value: stats.data?.active ?? 0,
        icon: HiCheckCircle,
        tint: "emerald" as const,
      },
    ],
    [stats.data],
  );

  const isFiltering = search.trim() !== "";
  const resetFilters = () => {
    setSearch("");
    setPage(1);
  };
  const totalPages = data?.pagination.totalPages || 0;

  return (
    <section className="mx-auto max-w-[1200px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-[26px] font-bold tracking-tight text-[#19233b]">
            Admin Panel
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600">
              {stats.data?.total ?? 0}
            </span>
          </h1>
          <p className="mt-1 text-[13px] text-slate-400">
            Foydalanuvchilar, rollar va ruxsatlarni boshqaring.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={stats.isLoading ? "—" : card.value}
            tint={card.tint}
            loading={stats.isLoading}
          />
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#263149]">
            Foydalanuvchilar ro'yxati
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {isFiltering
              ? `"${search}" bo'yicha ${data?.users.length ?? 0} ta natija`
              : `Jami ${data?.pagination.total ?? 0} ta foydalanuvchi`}
          </p>
        </div>

        <label className="group flex h-10 w-full max-w-[300px] items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm transition-all focus-within:border-indigo-300 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
          <HiMagnifyingGlass className="h-4 w-4 shrink-0 text-slate-400 transition group-focus-within:text-indigo-500" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Ism yoki email qidirish..."
            aria-label="Foydalanuvchi qidirish"
          />
          {search && (
            <button
              onClick={resetFilters}
              className="shrink-0 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Qidiruvni tozalash"
            >
              <HiXMark className="h-4 w-4" />
            </button>
          )}
        </label>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_-4px_rgba(28,42,70,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="border-b border-slate-100 bg-slate-50/70">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">Foydalanuvchi</th>
                <th className="px-5 py-3.5">Rol</th>
                <th className="px-5 py-3.5">Holati</th>
                <th className="px-5 py-3.5">Ro'yxatdan o'tgan</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-32 animate-pulse rounded bg-slate-200" />
                            <div className="h-3 w-44 animate-pulse rounded bg-slate-100" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="h-7 w-32 animate-pulse rounded-lg bg-slate-100" />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                      </td>
                    </tr>
                  ))
                : data?.users.map((user) => {
                    const color = colorOf(user.fullName);
                    const roleMeta = getRoleMeta(user.role);
                    const isSelf = user.id === currentUser?.id;

                    return (
                      <tr
                        key={user.id}
                        className="group border-b border-slate-50 text-sm text-slate-600 transition-colors last:border-0 hover:bg-indigo-50/40"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: color.bg,
                                color: color.fg,
                                fontSize: 13,
                                fontWeight: 700,
                              }}
                            >
                              {initialsOf(user.fullName)}
                            </Avatar>
                            <div className="min-w-0">
                              <p className="flex items-center gap-1.5 truncate font-semibold text-[#1f2a44]">
                                {user.fullName}
                                {isSelf && (
                                  <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">
                                    Siz
                                  </span>
                                )}
                              </p>
                              <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                                <HiEnvelope className="h-3 w-3 shrink-0" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          {isSelf ? (
                            <Tooltip
                              title="O'z rolingizni o'zgartira olmaysiz"
                              arrow
                            >
                              <span
                                className={`inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg ${roleMeta.bg} px-2.5 py-1.5 text-xs font-semibold ${roleMeta.text} opacity-80`}
                              >
                                {roleMeta.label}
                              </span>
                            </Tooltip>
                          ) : (
                            <RoleSelect
                              value={user.role}
                              loading={changeRole.isPending}
                              onChange={(role) => void updateRole(user, role)}
                            />
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          {user.isActive === false ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                              <HiXCircle className="h-3.5 w-3.5" />
                              Nofaol
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                              Faol
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="text-xs text-slate-400">—</span>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {!isLoading && !data?.users.length && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <HiUserGroup className="h-8 w-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-700">
                {isFiltering
                  ? "Foydalanuvchi topilmadi"
                  : "Hali foydalanuvchilar yo'q"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {isFiltering
                  ? "Boshqa kalit so'z bilan qayta urinib ko'ring."
                  : "Yangi foydalanuvchi qo'shishdan boshlang."}
              </p>
            </div>
            {isFiltering && (
              <button
                onClick={resetFilters}
                className="mt-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Qidiruvni tozalash
              </button>
            )}
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5">
            <p className="text-xs font-medium text-slate-500">
              Sahifa <span className="font-bold text-slate-700">{page}</span> /{" "}
              {totalPages}
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-500"
                aria-label="Oldingi sahifa"
              >
                <HiChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`dots-${i}`}
                      className="px-1.5 text-xs text-slate-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold transition ${
                        p === page
                          ? "bg-[#5657e9] text-white shadow-md shadow-indigo-500/25"
                          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                      aria-label={`Sahifa ${p}`}
                      aria-current={p === page ? "page" : undefined}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-500"
                aria-label="Keyingi sahifa"
              >
                <HiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
  loading = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tint: "indigo" | "blue" | "emerald" | "purple";
  loading?: boolean;
}) {
  const tints = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
  };
  const t = tints[tint];

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_16px_-4px_rgba(28,42,70,0.06)] transition-all hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-[0_8px_24px_-8px_rgba(86,87,233,0.18)]">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.bg} ${t.text} transition-transform group-hover:scale-105`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-1.5 h-6 w-16 rounded-md" />
          ) : (
            <p className="mt-0.5 truncate text-xl font-bold text-[#1f2a44]">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleSelect({
  value,
  loading,
  onChange,
}: {
  value: Role;
  loading: boolean;
  onChange: (role: Role) => void;
}) {
  const role = isRole(value) ? value : "user";
  const meta = getRoleMeta(role);
  const Icon = meta.icon;

  return (
    <Select
      value={role}
      onChange={(e) => {
        if (isRole(e.target.value)) onChange(e.target.value);
      }}
      size="small"
      disabled={loading}
      renderValue={() => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg ${meta.bg} px-2.5 py-1 text-xs font-semibold ${meta.text}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </span>
      )}
      sx={{
        height: 34,
        minWidth: 165,
        borderRadius: "10px",
        fontSize: 12,
        bgcolor: "transparent",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "transparent",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#c7d2fe",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#a5b4fc",
          borderWidth: 1,
        },
        "& .MuiSelect-select": { py: 0.75 },
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
      {Object.entries(ROLE_META).map(([key, m]) => {
        const ItemIcon = m.icon;
        return (
          <MenuItem key={key} value={key}>
            <span className="flex items-center gap-2.5">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-md ${m.bg} ${m.text}`}
              >
                <ItemIcon className="h-3.5 w-3.5" />
              </span>
              {m.label}
            </span>
          </MenuItem>
        );
      })}
    </Select>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];
  if (current <= 3) {
    pages.push(1, 2, 3, 4, "...", total);
  } else if (current >= total - 2) {
    pages.push(1, "...", total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }
  return pages;
}
