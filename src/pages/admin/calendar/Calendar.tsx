import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import uzLocale from "@fullcalendar/core/locales/uz";
import type {
  DatesSetArg,
  DayHeaderContentArg,
  EventClickArg,
  EventContentArg,
  EventInput,
} from "@fullcalendar/core";
import { Popover } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiArrowTopRightOnSquare,
  HiCheckCircle,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlineUserGroup,
  HiPlus,
  HiXMark,
} from "react-icons/hi2";
import api, { getErrorMessage } from "../../../services/apiClient";
import { notify } from "../../../components/ui/notify";
import Skeleton from "../../../components/ui/Skeleton";
import "./calendar.css";

type LeadEvent = {
  id: string;
  leadId?: string;
  taskId?: string;
  title: string;
  description: string | null;
  start: string;
  end: string;
  color: "blue" | "purple" | "emerald" | "amber" | "rose";
  actionType: string;
  status: string;
};

type Selected = {
  anchor: HTMLElement;
  title: string;
  start: Date | null;
  end: Date | null;
  description: string | null;
  actionType: string;
  status: string;
  leadId?: string;
  taskId?: string;
  color: string;
};

const COLORS = {
  blue: "#4f6ff2",
  purple: "#8b5cf6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#ec5d7a",
} as const;

const ACTION_META: Record<
  string,
  {
    label: string;
    color: keyof typeof COLORS;
    Icon: ComponentType<{ className?: string }>;
  }
> = {
  call: { label: "Qo'ng'iroq", color: "blue", Icon: HiOutlinePhone },
  meeting: { label: "Uchrashuv", color: "purple", Icon: HiOutlineUserGroup },
  followup: { label: "Follow-up", color: "amber", Icon: HiOutlineClock },
  reminder: { label: "Eslatma", color: "emerald", Icon: HiOutlineCalendarDays },
  other: { label: "Boshqa", color: "rose", Icon: HiOutlineCalendarDays },
  task: { label: "Vazifa", color: "purple", Icon: HiCheckCircle },
};

const VIEWS = [
  { key: "dayGridMonth", label: "Oy" },
  { key: "timeGridWeek", label: "Hafta" },
  { key: "timeGridDay", label: "Kun" },
  { key: "listWeek", label: "Ro'yxat" },
] as const;

const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];
const WEEKDAYS = [
  "Yakshanba", "Dushanba", "Seshanba", "Chorshanba",
  "Payshanba", "Juma", "Shanba",
];
const WEEKDAYS_SHORT = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Juma", "Shan"];

const DONE_STATUSES = ["done", "completed", "complete", "finished"];

const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, "0");
const timeOf = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const typeOf = (t: string) => (ACTION_META[t] ? t : "other");
const isDone = (status?: string) =>
  DONE_STATUSES.includes(String(status || "").toLowerCase());

function formatTitle(type: string, start: Date, end: Date) {
  if (type === "dayGridMonth") {
    return `${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
  }
  if (type === "timeGridDay") {
    return `${start.getDate()} ${MONTHS[start.getMonth()]}, ${WEEKDAYS[start.getDay()]}`;
  }
  const last = new Date(end.getTime() - 1);
  if (start.getMonth() === last.getMonth()) {
    return `${start.getDate()} – ${last.getDate()} ${MONTHS[last.getMonth()]} ${last.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTHS[start.getMonth()].slice(0, 3)} – ${last.getDate()} ${MONTHS[last.getMonth()].slice(0, 3)} ${last.getFullYear()}`;
}

function dayLabel(d: Date, todayStart: Date) {
  const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((startOfThat.getTime() - todayStart.getTime()) / DAY_MS);
  if (diff === 0) return "Bugun";
  if (diff === 1) return "Ertaga";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${WEEKDAYS[d.getDay()]}`;
}

async function fetchEvents(from: string, to: string) {
  const { data } = await api.get<{ events: LeadEvent[] }>("/calendar/events", {
    params: { from, to },
  });
  return data.events;
}

/* ───────────────────────── Asosiy sahifa ───────────────────────── */

export default function Calendar() {
  const navigate = useNavigate();
  const calRef = useRef<FullCalendar>(null);

  const [initialView] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 640
      ? "listWeek"
      : "dayGridMonth",
  );
  const [viewType, setViewType] = useState<string>(initialView);
  const [title, setTitle] = useState("");
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Selected | null>(null);

  /* Yaqin rejalar + statistika (ko'rinadigan oraliqdan mustaqil) */
  const [agenda, setAgenda] = useState<LeadEvent[]>([]);
  const [agendaLoading, setAgendaLoading] = useState(true);

  const getCal = () => calRef.current?.getApi();

  /* Ko'rinayotgan oraliq uchun eventlar */
  useEffect(() => {
    if (!range) return;
    let active = true;
    fetchEvents(range.from, range.to)
      .then((list) => {
        if (active) setEvents(list);
      })
      .catch((error) => {
        if (active) notify.error(`Kalendar yuklanmadi: ${getErrorMessage(error)}`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [range]);

  /* Bugundan oy oxirigacha (yoki 7 kungacha) — yon panel va statistika */
  useEffect(() => {
    let active = true;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(startOfDay.getTime() + 7 * DAY_MS);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const to = endOfMonth > endOfWeek ? endOfMonth : endOfWeek;

    fetchEvents(startOfDay.toISOString(), to.toISOString())
      .then((list) => {
        if (active) setAgenda(list);
      })
      .catch((error) => {
        if (active) notify.error(`Rejalar yuklanmadi: ${getErrorMessage(error)}`);
      })
      .finally(() => {
        if (active) setAgendaLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + DAY_MS);
    const endOfWeek = new Date(startOfDay.getTime() + 7 * DAY_MS);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    let today = 0;
    let week = 0;
    let month = 0;
    agenda.forEach((e) => {
      const d = new Date(e.start);
      if (d >= startOfDay && d < endOfDay) today++;
      if (d >= startOfDay && d < endOfWeek) week++;
      if (d >= startOfDay && d <= endOfMonth) month++;
    });
    return { today, week, month };
  }, [agenda]);

  const upcoming = useMemo(
    () =>
      [...agenda]
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 8),
    [agenda],
  );

  /* FullCalendar uchun eventlar (tur filtri bilan) */
  const calendarEvents: EventInput[] = useMemo(
    () =>
      events
        .filter((e) => !hidden.has(typeOf(e.actionType)))
        .map((event) => ({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          backgroundColor: COLORS[event.color],
          borderColor: COLORS[event.color],
          extendedProps: {
            leadId: event.leadId,
            taskId: event.taskId,
            description: event.description,
            actionType: event.actionType,
            status: event.status,
            color: COLORS[event.color],
          },
        })),
    [events, hidden],
  );

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setViewType(arg.view.type);
    setTitle(formatTitle(arg.view.type, arg.view.currentStart, arg.view.currentEnd));
    const from = arg.start.toISOString();
    const to = arg.end.toISOString();
    setRange((prev) => (prev && prev.from === from && prev.to === to ? prev : { from, to }));
  }, []);

  const handleEventClick = (click: EventClickArg) => {
    const ev = click.event;
    const props = ev.extendedProps;
    setSelected({
      anchor: click.el,
      title: ev.title,
      start: ev.start,
      end: ev.end,
      description: props.description ?? null,
      actionType: props.actionType || "other",
      status: props.status || "",
      leadId: props.leadId,
      taskId: props.taskId,
      color: props.color || COLORS.blue,
    });
  };

  const openTarget = (target: { leadId?: string; taskId?: string }) => {
    if (target.taskId) navigate("/tasks");
    else if (target.leadId) navigate(`/leads/${target.leadId}`);
  };

  const toggleType = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const todayStart = useMemo(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);

  return (
    <section className="lead-calendar mx-auto max-w-[1400px]">
      {/* ============ SARLAVHA ============ */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#18233c]">
            Kalendar
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Rejalashtirilgan qo'ng'iroqlar, uchrashuvlar va vazifa muddatlari. Batafsil
            ko'rish uchun eventni bosing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/tasks")}
          className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 outline-none transition hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f6fb] active:scale-[0.98]"
        >
          <HiPlus className="h-4 w-4" />
          Vazifa qo'shish
        </button>
      </div>

      {/* ============ STATISTIKA ============ */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatCard
          label="Bugun"
          value={stats.today}
          loading={agendaLoading}
          tint="indigo"
          icon={<HiOutlineCalendarDays className="h-4 w-4" />}
        />
        <StatCard
          label="Shu hafta"
          value={stats.week}
          loading={agendaLoading}
          tint="violet"
          icon={<HiOutlineClock className="h-4 w-4" />}
        />
        <StatCard
          label="Shu oy"
          value={stats.month}
          loading={agendaLoading}
          tint="emerald"
          icon={<HiOutlineUserGroup className="h-4 w-4" />}
        />
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* ============ KALENDAR KARTASI ============ */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03]">
          {loading && <div className="cal-progress" aria-hidden="true" />}

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-4 sm:px-5">
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5">
                <ToolbarIconButton
                  label="Oldingi"
                  onClick={() => getCal()?.prev()}
                  icon={<HiChevronLeft className="h-4 w-4" />}
                />
                <ToolbarIconButton
                  label="Keyingi"
                  onClick={() => getCal()?.next()}
                  icon={<HiChevronRight className="h-4 w-4" />}
                />
              </div>
              <button
                type="button"
                onClick={() => getCal()?.today()}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-700 outline-none transition hover:border-slate-300 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-400/60"
              >
                Bugun
              </button>
              <h2 className="ml-1 text-lg font-semibold tracking-tight text-[#18233c] sm:text-xl">
                {title}
              </h2>
            </div>

            <div
              className="flex rounded-xl bg-slate-100 p-1"
              role="group"
              aria-label="Ko'rinish"
            >
              {VIEWS.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => getCal()?.changeView(v.key)}
                  aria-pressed={viewType === v.key}
                  className={`h-7 rounded-lg px-3 text-[13px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-400/60 ${
                    viewType === v.key
                      ? "bg-white text-slate-900 shadow-sm shadow-slate-900/10"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tur filtri */}
          <div
            className="flex items-center gap-2 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Event turlari"
          >
            {Object.entries(ACTION_META).map(([key, meta]) => {
              const visible = !hidden.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleType(key)}
                  aria-pressed={visible}
                  className={`flex h-8 shrink-0 items-center gap-2 rounded-full border px-3 text-[13px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-400/60 ${
                    visible
                      ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      : "border-transparent bg-slate-100 text-slate-400 line-through"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: visible ? COLORS[meta.color] : "#cbd5e1",
                    }}
                  />
                  {meta.label}
                </button>
              );
            })}
            {hidden.size > 0 && (
              <button
                type="button"
                onClick={() => setHidden(new Set())}
                className="shrink-0 rounded-lg px-2 py-1 text-[13px] font-medium text-indigo-600 outline-none transition hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-400/60"
              >
                Hammasini ko'rsatish
              </button>
            )}
          </div>

          <div className="border-t border-slate-100 p-2 sm:p-4">
            <FullCalendar
              ref={calRef}
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              locale={uzLocale}
              firstDay={1}
              initialView={initialView}
              headerToolbar={false}
              datesSet={handleDatesSet}
              dayHeaderContent={dayHeader}
              height="auto"
              fixedWeekCount={false}
              dayMaxEvents={3}
              eventDisplay="block"
              navLinks
              nowIndicator
              weekNumbers={false}
              scrollTime="08:00:00"
              slotDuration="00:30:00"
              slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              events={calendarEvents}
              eventClick={handleEventClick}
              eventContent={EventContent}
              eventDidMount={(arg) => {
                const color = arg.event.extendedProps.color as string | undefined;
                if (color) arg.el.style.setProperty("--ev", color);
              }}
              eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              eventClassNames={(arg) => [
                `crm-calendar-event--${typeOf(arg.event.extendedProps.actionType)}`,
                ...(isDone(arg.event.extendedProps.status) ? ["is-done"] : []),
              ]}
              moreLinkContent={(arg) => `+${arg.num} ta`}
              noEventsContent="Bu davrda rejalashtirilgan aloqa yo'q"
            />
          </div>
        </div>

        {/* ============ YAQIN REJALAR ============ */}
        <aside className="rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03]">
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <div>
              <h2 className="text-[15px] font-semibold text-slate-800">
                Yaqin rejalar
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">Bugundan boshlab</p>
            </div>
            {!agendaLoading && upcoming.length > 0 && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-500">
                {upcoming.length}
              </span>
            )}
          </div>

          <div className="px-2 pb-3">
            {agendaLoading ? (
              <div className="space-y-3 px-3 py-2" aria-busy="true">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-9 w-1 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-3/4 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                  <HiOutlineCalendarDays className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-medium text-slate-700">
                  Yaqin rejalar yo'q
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Yangi vazifa qo'shsangiz, bu yerda ko'rinadi.
                </p>
              </div>
            ) : (
              <ul>
                {upcoming.map((ev, i) => {
                  const start = new Date(ev.start);
                  const end = new Date(ev.end);
                  const meta = ACTION_META[typeOf(ev.actionType)];
                  const label = dayLabel(start, todayStart);
                  const prevLabel =
                    i > 0 ? dayLabel(new Date(upcoming[i - 1].start), todayStart) : null;
                  const past = end.getTime() < todayStart.getTime();

                  return (
                    <li key={ev.id}>
                      {label !== prevLabel && (
                        <p className="px-3 pb-1 pt-3 text-xs font-medium text-slate-400">
                          {label}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => openTarget(ev)}
                        className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-400/60 ${
                          past || isDone(ev.status) ? "opacity-55" : ""
                        }`}
                      >
                        <span
                          className="mt-0.5 h-9 w-1 shrink-0 rounded-full"
                          style={{ backgroundColor: COLORS[ev.color] }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-800">
                            {ev.title}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <meta.Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {meta.label} · {timeOf(start)}
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* ============ EVENT TAFSILOTI ============ */}
      <Popover
        open={Boolean(selected)}
        anchorEl={selected?.anchor}
        onClose={() => setSelected(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 0.75,
              borderRadius: "16px",
              border: "1px solid #e8ebf3",
              boxShadow:
                "0 20px 40px -12px rgba(24,35,60,0.20), 0 4px 12px -4px rgba(24,35,60,0.08)",
            },
          },
        }}
      >
        {selected && (
          <EventPreview
            event={selected}
            onClose={() => setSelected(null)}
            onOpen={() => {
              openTarget(selected);
              setSelected(null);
            }}
          />
        )}
      </Popover>
    </section>
  );
}

/* ───────────────────────── Yordamchi komponentlar ───────────────────────── */

function dayHeader(arg: DayHeaderContentArg) {
  const dow = arg.date.getDay();
  if (arg.view.type === "dayGridMonth") return WEEKDAYS_SHORT[dow];
  if (arg.view.type === "timeGridDay") return WEEKDAYS[dow];
  return {
    html: `<span class="fc-dow">${WEEKDAYS_SHORT[dow]}</span><span class="fc-dom${
      arg.isToday ? " is-today" : ""
    }">${arg.date.getDate()}</span>`,
  };
}

function EventContent({ event, timeText }: EventContentArg) {
  const type = typeOf(event.extendedProps?.actionType);
  const Icon = ACTION_META[type].Icon;
  return (
    <div className="fc-lead-event" title={event.title}>
      <Icon className="fc-lead-icon" />
      {timeText && <span className="fc-lead-time">{timeText}</span>}
      <span className="fc-lead-title">{event.title}</span>
    </div>
  );
}

function ToolbarIconButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 outline-none transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-indigo-400/60"
    >
      {icon}
    </button>
  );
}

function StatCard({
  label,
  value,
  loading,
  tint,
  icon,
}: {
  label: string;
  value: number;
  loading: boolean;
  tint: "indigo" | "violet" | "emerald";
  icon: ReactNode;
}) {
  const tints = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm shadow-slate-900/[0.03] sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[13px] font-medium text-slate-500">{label}</p>
        <span
          className={`hidden h-8 w-8 shrink-0 place-items-center rounded-lg sm:grid ${tints[tint]}`}
        >
          {icon}
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-10 rounded-md" />
      ) : (
        <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[#18233c] sm:mt-3">
          {value}
          <span className="ml-1.5 text-xs font-medium text-slate-400">ta</span>
        </p>
      )}
    </div>
  );
}

function EventPreview({
  event,
  onClose,
  onOpen,
}: {
  event: Selected;
  onClose: () => void;
  onOpen: () => void;
}) {
  const meta = ACTION_META[typeOf(event.actionType)];
  const canOpen = Boolean(event.taskId || event.leadId);
  const done = isDone(event.status);

  const dateText = event.start
    ? `${WEEKDAYS[event.start.getDay()]}, ${event.start.getDate()} ${MONTHS[event.start.getMonth()]}`
    : "";
  const timeText = event.start
    ? event.end &&
      event.end.toDateString() === event.start.toDateString()
      ? `${timeOf(event.start)} – ${timeOf(event.end)}`
      : timeOf(event.start)
    : "";

  return (
    <div className="w-[320px] max-w-[calc(100vw-32px)] p-4">
      <div className="flex items-start justify-between gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            backgroundColor: `${event.color}1f`,
            color: event.color,
          }}
        >
          <meta.Icon className="h-3.5 w-3.5" />
          {meta.label}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="-mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-lg text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-400/60"
        >
          <HiXMark className="h-4 w-4" />
        </button>
      </div>

      <h3
        className={`mt-3 text-base font-semibold leading-snug text-slate-900 ${
          done ? "line-through opacity-60" : ""
        }`}
      >
        {event.title}
      </h3>

      <div className="mt-3 space-y-1.5 text-[13px] text-slate-600">
        {dateText && (
          <p className="flex items-center gap-2">
            <HiOutlineCalendarDays className="h-4 w-4 text-slate-400" />
            {dateText}
          </p>
        )}
        {timeText && (
          <p className="flex items-center gap-2 tabular-nums">
            <HiOutlineClock className="h-4 w-4 text-slate-400" />
            {timeText}
          </p>
        )}
        {done && (
          <p className="flex items-center gap-2 text-emerald-600">
            <HiCheckCircle className="h-4 w-4" />
            Bajarilgan
          </p>
        )}
      </div>

      {event.description && (
        <p className="mt-3 line-clamp-4 rounded-xl bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-600">
          {event.description}
        </p>
      )}

      {canOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white outline-none transition hover:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
        >
          {event.taskId ? "Vazifani ochish" : "Leadni ochish"}
          <HiArrowTopRightOnSquare className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
