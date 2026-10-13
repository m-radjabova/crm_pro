import { Avatar, Menu, MenuItem, Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  HiBell,
  HiChevronDown,
  HiMagnifyingGlass,
  HiArrowRightOnRectangle,
  HiUserCircle,
  HiCog6Tooth,
  HiQuestionMarkCircle,
  HiXMark,
} from "react-icons/hi2";
import AdminSidebar from "../pages/admin/AdminSidebar";
import { clearSession, getSession } from "../services/apiClient";
import { notify } from "../components/ui/notify";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
};

export default function CRMLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getSession());
  const user = session?.user;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    const syncSession = () => setSession(getSession());
    window.addEventListener("crm-session-changed", syncSession);
    return () => window.removeEventListener("crm-session-changed", syncSession);
  }, []);

  const logout = () => {
    setAnchorEl(null);
    clearSession();
    navigate("/login", { replace: true });
    notify.success("Tizimdan muvaffaqiyatli chiqdingiz.");
  };

  const goTo = (path: string) => {
    setAnchorEl(null);
    navigate(path);
  };

  const initials =
    user?.fullName
      ?.split(" ")
      .filter(Boolean)
      .map((x: string) => x[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "M";

  const roleLabel = ROLE_LABELS[String(user?.role ?? "").toLowerCase()] ?? user?.role ?? "Administrator";

  const isMac =
    typeof navigator !== "undefined" && /mac/i.test(navigator.platform);

  /* ⌘K / Ctrl+K — qidiruvga o'tish */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth >= 1024) {
          desktopSearchRef.current?.focus();
        } else {
          setSearchOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-[#18233c] lg:flex">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        {/* ============ HEADER ============ */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200/60 bg-[#f4f6fb]/80 px-5 backdrop-blur-xl sm:px-8 lg:pl-3 lg:pr-8">
          <div className="flex min-w-0 flex-1 items-center">
            {searchOpen ? (
              <div className="ml-11 flex w-full items-center gap-2 lg:hidden">
                <SearchInput autoFocus isMac={isMac} />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                  aria-label="Qidiruvni yopish"
                >
                  <HiXMark className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="ml-11 grid h-10 w-10 place-items-center rounded-xl text-slate-500 outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-indigo-400/60 lg:hidden"
                  aria-label="Qidiruvni ochish"
                >
                  <HiMagnifyingGlass className="h-5 w-5" />
                </button>

                <div className="hidden w-full max-w-[380px] lg:block">
                  <SearchInput inputRef={desktopSearchRef} isMac={isMac} />
                </div>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Bildirishnomalar */}
            <Tooltip title="Bildirishnomalar" arrow>
              <button
                type="button"
                aria-label="Bildirishnomalar"
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm shadow-slate-900/[0.03] outline-none transition hover:border-indigo-200 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400/60"
              >
                <HiBell className="h-5 w-5" />
                <span
                  aria-hidden="true"
                  className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"
                />
              </button>
            </Tooltip>

            {/* Profil tugmasi */}
            <button
              type="button"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              className={`group flex h-10 items-center gap-2.5 rounded-xl border bg-white py-1 pl-1 pr-2 shadow-sm shadow-slate-900/[0.03] outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-400/60 sm:pr-3 ${
                menuOpen
                  ? "border-indigo-200"
                  : "border-slate-200/80 hover:border-indigo-200"
              }`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <Avatar
                variant="rounded"
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "9px",
                  bgcolor: "#eef0ff",
                  color: "#4f52d9",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {initials}
              </Avatar>
              <div className="hidden flex-col items-start leading-tight sm:flex">
                <span className="max-w-[140px] truncate text-[13px] font-semibold text-slate-800">
                  {user?.fullName || "Manager"}
                </span>
                <span className="text-xs text-slate-400">{roleLabel}</span>
              </div>
              <HiChevronDown
                className={`hidden h-4 w-4 text-slate-400 transition-transform duration-200 motion-reduce:transition-none sm:block ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profil menyusi */}
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    mt: 1,
                    minWidth: 248,
                    borderRadius: "16px",
                    border: "1px solid #e8ebf3",
                    boxShadow:
                      "0 20px 40px -12px rgba(24,35,60,0.18), 0 4px 12px -4px rgba(24,35,60,0.06)",
                    overflow: "hidden",
                  },
                },
                list: { sx: { p: 0.75 } },
              }}
            >
              <div className="mb-1 flex items-center gap-3 rounded-xl bg-[#f4f6fb] px-3 py-3">
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "11px",
                    bgcolor: "#eef0ff",
                    color: "#4f52d9",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {user?.fullName || "Manager"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user?.email || "manager@crm.uz"}
                  </p>
                </div>
              </div>

              <ProfileMenuItem
                icon={<HiUserCircle className="h-[18px] w-[18px]" />}
                onClick={() => goTo("/settings")}
              >
                Profil
              </ProfileMenuItem>
              <ProfileMenuItem
                icon={<HiCog6Tooth className="h-[18px] w-[18px]" />}
                onClick={() => goTo("/settings")}
              >
                Sozlamalar
              </ProfileMenuItem>
              <ProfileMenuItem
                icon={<HiQuestionMarkCircle className="h-[18px] w-[18px]" />}
                onClick={() => setAnchorEl(null)}
              >
                Yordam
              </ProfileMenuItem>

              <div className="mx-2 my-1.5 h-px bg-slate-100" />

              <ProfileMenuItem
                danger
                icon={<HiArrowRightOnRectangle className="h-[18px] w-[18px]" />}
                onClick={logout}
              >
                Chiqish
              </ProfileMenuItem>
            </Menu>
          </div>
        </header>

        {/* ============ KONTENT ============ */}
        <main className="px-5 py-7 sm:px-8 lg:pl-3 lg:pr-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ProfileMenuItem({
  children,
  icon,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <MenuItem
      onClick={onClick}
      sx={{
        gap: 1.5,
        minHeight: 40,
        px: 1.5,
        borderRadius: "10px",
        fontSize: 14,
        fontWeight: 500,
        color: danger ? "#dc2626" : "#334155",
        "& svg": { color: danger ? "#dc2626" : "#64748b" },
        "&:hover": {
          bgcolor: danger ? "#fef2f2" : "#f4f6fb",
          color: danger ? "#dc2626" : "#18233c",
          "& svg": { color: danger ? "#dc2626" : "#4f52d9" },
        },
      }}
    >
      {icon}
      {children}
    </MenuItem>
  );
}

function SearchInput({
  autoFocus,
  inputRef,
  isMac,
}: {
  autoFocus?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  isMac?: boolean;
}) {
  return (
    <label className="group flex h-10 w-full items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3.5 text-sm shadow-sm shadow-slate-900/[0.03] transition duration-200 hover:border-slate-300 focus-within:border-indigo-300 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.10)]">
      <HiMagnifyingGlass className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        type="search"
        className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden"
        placeholder="Mijoz, sotuv yoki vazifani qidiring"
        aria-label="Qidirish"
      />
      <kbd className="hidden shrink-0 items-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-[11px] font-medium text-slate-400 sm:flex">
        {isMac ? "⌘ K" : "Ctrl K"}
      </kbd>
    </label>
  );
}
