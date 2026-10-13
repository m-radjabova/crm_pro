import { Drawer, Tooltip } from "@mui/material";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HiBars3,
  HiBellAlert,
  HiBuildingOffice2,
  HiCalendarDays,
  HiChartBarSquare,
  HiClipboardDocumentCheck,
  HiCog6Tooth,
  HiDocumentChartBar,
  HiLockClosed,
  HiMiniXMark,
  HiUserGroup,
  HiUserPlus,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { getSession } from "../../services/apiClient";

type Item = {
  label: string;
  to: string;
  icon: IconType;
  adminOnly?: boolean;
  managerOnly?: boolean;
};
type Section = { title?: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    items: [
      { label: "Dashboard", to: "/dashboard", icon: HiChartBarSquare, managerOnly: true },
    ],
  },
  {
    title: "Savdo",
    items: [
      { label: "Leads", to: "/leads", icon: HiUserPlus, managerOnly: true },
      { label: "Contacts", to: "/contacts", icon: HiUserGroup, managerOnly: true },
      { label: "Companies", to: "/companies", icon: HiBuildingOffice2, managerOnly: true },
    ],
  },
  {
    title: "Ish jarayoni",
    items: [
      { label: "Tasks", to: "/tasks", icon: HiClipboardDocumentCheck, managerOnly: true },
      { label: "Calendar", to: "/calendar", icon: HiCalendarDays, managerOnly: true },
      { label: "Reports", to: "/reports", icon: HiDocumentChartBar, managerOnly: true },
    ],
  },
  {
    title: "Boshqaruv",
    items: [
      { label: "Admin", to: "/admin", icon: HiBellAlert, adminOnly: true },
      { label: "Settings", to: "/settings", icon: HiCog6Tooth },
    ],
  },
];

const STORAGE_KEY = "crm-sidebar-collapsed";

/* Tooltip uchun umumiy stil */
const tooltipSlotProps = {
  tooltip: {
    sx: {
      bgcolor: "#1b2547",
      border: "1px solid rgba(255,255,255,0.08)",
      fontSize: 12,
      fontWeight: 500,
      borderRadius: "10px",
      px: 1.5,
      py: 0.75,
      boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    },
  },
  arrow: { sx: { color: "#1b2547" } },
};

function Menu({
  close,
  collapsed,
  onToggleCollapse,
  isMobile,
}: {
  close?: () => void;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
}) {
  const location = useLocation();
  const session = getSession();
  const user = session?.user as unknown as
    | { role?: string; name?: string; full_name?: string; email?: string }
    | undefined;
  const isAdmin = user?.role === "admin";

  // Collapsed rejim faqat desktopda ishlaydi
  const mini = collapsed && !isMobile;

  const displayName = user?.full_name || user?.name || user?.email || "Foydalanuvchi";
  const initials = displayName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden bg-[#0c1329] text-white ${
        isMobile ? "" : "border-r border-white/10"
      } ${mini ? "px-2 py-4" : "px-3 py-4"}`}
    >
      {/* Yuqoridagi yumshoq yorug'lik */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(99,102,241,0.18),transparent)]"
      />

      {/* ============ LOGO ============ */}
      <div
        className={`relative mb-5 flex items-center gap-3 ${
          mini ? "justify-center" : "px-2 pt-1"
        }`}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true">
            <path d="M12 2.5 21.5 12 12 21.5 2.5 12 12 2.5Zm0 5.2L7.7 12l4.3 4.3 4.3-4.3L12 7.7Z" />
          </svg>
        </span>
        {!mini && (
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-tight">
              CRM Pro
            </p>
            <p className="truncate text-xs text-[#7e89a8]">Boshqaruv paneli</p>
          </div>
        )}
      </div>

      {/* ============ NAVIGATSIYA ============ */}
      <nav
        aria-label="Asosiy menyu"
        className="relative -mx-1 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SECTIONS.map((section, si) => {
          const visibleItems = section.items.filter(
            (item) => item.adminOnly !== true || isAdmin,
          );
          if (!visibleItems.length) return null;

          return (
            <div key={si}>
              {/* Seksiya sarlavhasi */}
              {section.title && !mini && (
                <p className="mb-1.5 px-3 text-xs font-medium text-[#6c7794]">
                  {section.title}
                </p>
              )}
              {/* Collapsed holatda ajratgich */}
              {mini && si > 0 && (
                <div className="mx-auto mb-3 h-px w-6 bg-white/10" />
              )}

              <ul className="space-y-1">
                {visibleItems.map(({ label, to, icon: Icon, managerOnly }) => {
                  const active = isActive(to);
                  const disabled = isAdmin && managerOnly;

                  const itemClassName = `group relative flex h-10 items-center rounded-xl text-[13.5px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-indigo-400/70 ${
                    mini ? "justify-center" : "gap-3 px-3"
                  } ${
                    disabled
                      ? "cursor-not-allowed text-[#58637f]"
                      : active
                        ? "bg-white/[0.09] text-white ring-1 ring-inset ring-white/10"
                        : "text-[#a3adc7] hover:bg-white/[0.05] hover:text-white"
                  }`;

                  const link = (
                    <NavLink
                      to={to}
                      onClick={disabled ? (event) => event.preventDefault() : close}
                      aria-disabled={disabled || undefined}
                      aria-current={active ? "page" : undefined}
                      tabIndex={disabled ? -1 : undefined}
                      className={itemClassName}
                    >
                      {/* Aktiv indikator */}
                      {active && !disabled && (
                        <span
                          aria-hidden="true"
                          className={`absolute top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.9)] ${
                            mini ? "-left-2" : "-left-3"
                          }`}
                        />
                      )}

                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                          active && !disabled
                            ? "text-indigo-300"
                            : disabled
                              ? ""
                              : "text-[#7e89a8] group-hover:text-white"
                        }`}
                      />

                      {!mini && <span className="flex-1 truncate">{label}</span>}

                      {!mini && disabled && (
                        <HiLockClosed className="h-3.5 w-3.5 shrink-0 text-[#58637f]" />
                      )}
                    </NavLink>
                  );

                  return (
                    <li key={to}>
                      {mini || disabled ? (
                        <Tooltip
                          title={disabled ? "Bu bo'lim faqat managerlar uchun" : label}
                          placement="right"
                          arrow
                          slotProps={tooltipSlotProps}
                        >
                          {/* span: disabled holatda ham tooltip ishlashi uchun */}
                          <span className="block">{link}</span>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* ============ PASTKI QISM ============ */}
      <div className="relative mt-4 space-y-2 border-t border-white/10 pt-3">
        {/* Foydalanuvchi kartasi */}
        <Tooltip
          title={mini ? displayName : ""}
          placement="right"
          arrow
          slotProps={tooltipSlotProps}
        >
          <div
            className={`flex items-center rounded-xl ${
              mini ? "justify-center py-1" : "gap-3 bg-white/[0.04] p-2.5"
            }`}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-400/15 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-300/20">
              {initials || "U"}
            </span>
            {!mini && (
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-white">
                  {displayName}
                </p>
                <p className="truncate text-xs text-[#7e89a8]">
                  {isAdmin ? "Administrator" : "Manager"}
                </p>
              </div>
            )}
          </div>
        </Tooltip>

        {/* Collapse toggle (faqat desktop) */}
        {onToggleCollapse && (
          <Tooltip
            title={collapsed ? "Menyuni kengaytirish" : "Menyuni yig'ish"}
            placement="right"
            arrow
            slotProps={tooltipSlotProps}
          >
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`flex h-9 w-full items-center rounded-xl text-[#7e89a8] outline-none transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400/70 ${
                collapsed ? "justify-center" : "gap-3 px-3"
              }`}
              aria-label={collapsed ? "Menyuni kengaytirish" : "Menyuni yig'ish"}
            >
              {collapsed ? (
                <HiChevronDoubleRight className="h-4 w-4" />
              ) : (
                <>
                  <HiChevronDoubleLeft className="h-4 w-4" />
                  <span className="text-[13px] font-medium">Yig'ish</span>
                </>
              )}
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  /* Holatni saqlash */
  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* storage mavjud emas — e'tiborsiz qoldiramiz */
      }
      return next;
    });
  };
  const width = collapsed ? 84 : 250;

  return (
    <>
      {/* ============ DESKTOP SIDEBAR ============ */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-300 ease-in-out motion-reduce:transition-none lg:block"
        style={{ width }}
      >
        <Menu collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </aside>

      {/* Bo'sh joy (content uchun) */}
      <div
        aria-hidden="true"
        className="hidden shrink-0 transition-[width] duration-300 ease-in-out motion-reduce:transition-none lg:block"
        style={{ width }}
      />

      {/* ============ MOBIL OCHISH TUGMASI ============ */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#0c1329] text-white shadow-lg shadow-black/25 outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-400/70 lg:hidden"
        aria-label="Menyuni ochish"
      >
        <HiBars3 className="h-5 w-5" />
      </button>

      {/* ============ MOBIL DRAWER ============ */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "rgba(6,10,24,0.6)", backdropFilter: "blur(4px)" },
          },
          paper: {
            sx: {
              width: 288,
              background: "transparent",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            },
          },
        }}
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-3 top-4 z-10 grid h-9 w-9 place-items-center rounded-xl text-white/70 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-400/70"
            aria-label="Menyuni yopish"
          >
            <HiMiniXMark className="h-5 w-5" />
          </button>
          <Menu close={() => setOpen(false)} collapsed={false} isMobile />
        </div>
      </Drawer>
    </>
  );
}
