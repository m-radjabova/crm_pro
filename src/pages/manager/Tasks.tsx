import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  HiCheckCircle,
  HiClock,
  HiPlus,
  HiQueueList,
  HiViewColumns,
  HiListBullet,
  HiMagnifyingGlass,
  HiFunnel,
  HiCalendarDays,
  HiFlag,
  HiExclamationTriangle,
  HiUser,
  HiBriefcase,
  HiSparkles,
  HiXMark,
  HiChevronRight,
  HiTrash,
  HiPencilSquare,
} from "react-icons/hi2";
import api, { getErrorMessage } from "../../services/apiClient";
import { notify } from "../../components/ui/notify";
import type { Lead, Task, TaskPriority, TaskStatus } from "../../types/crm";
import { formatUzDate } from "../../utils/date";

/* ---------------- Config ---------------- */

const statuses: Record<
  TaskStatus,
  { label: string; className: string; dot: string; gradient: string }
> = {
  todo: {
    label: "Yangi",
    className: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    gradient: "from-violet-500 to-purple-500",
  },
  in_progress: {
    label: "Bajarilmoqda",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    gradient: "from-blue-500 to-cyan-500",
  },
  done: {
    label: "Bajarildi",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    gradient: "from-emerald-500 to-teal-500",
  },
};

const priorities: Record<
  TaskPriority,
  { label: string; className: string; dot: string; bar: string }
> = {
  low: {
    label: "Past",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  medium: {
    label: "O'rta",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  high: {
    label: "Yuqori",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
};

type ViewMode = "list" | "board";

/* ---------------- Main ---------------- */

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | TaskStatus>("all");
  const [priority, setPriority] = useState<"all" | TaskPriority>("all");
  const [modal, setModal] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [editing, setEditing] = useState<Task | null>(null);

  const load = () =>
    api
      .get<{ tasks: Task[] }>("/tasks")
      .then(({ data }) => setTasks(data.tasks))
      .catch((e) => notify.error(getErrorMessage(e)))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load();
    api
      .get<{ leads: Lead[] }>("/leads", { params: { limit: 100 } })
      .then(({ data }) => setLeads(data.leads))
      .catch(() => undefined);
  }, []);

  const shown = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (status === "all" || task.status === status) &&
          (priority === "all" || task.priority === priority) &&
          `${task.title} ${task.lead?.company || ""} ${task.lead?.name || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [tasks, status, priority, search]
  );

  const counts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    active: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter(
      (t) => t.status !== "done" && new Date(t.dueAt) < new Date()
    ).length,
  };

  const changeStatus = async (task: Task, next: TaskStatus) => {
    // Optimistic update
    const prev = tasks;
    setTasks((old) =>
      old.map((item) => (item.id === task.id ? { ...item, status: next } : item))
    );
    try {
      const { data } = await api.patch<{ task: Task }>(`/tasks/${task.id}`, {
        status: next,
      });
      setTasks((old) =>
        old.map((item) => (item.id === task.id ? data.task : item))
      );
      if (next === "done") notify.success("Vazifa bajarildi! 🎉");
      else notify.success("Vazifa holati yangilandi.");
    } catch (e) {
      setTasks(prev);
      notify.error(getErrorMessage(e));
    }
  };

  const removeTask = async (task: Task) => {
    if (!confirm(`"${task.title}" vazifasini o'chirmoqchimisiz?`)) return;
    const prev = tasks;
    setTasks((old) => old.filter((t) => t.id !== task.id));
    try {
      await api.delete(`/tasks/${task.id}`);
      notify.success("Vazifa o'chirildi.");
    } catch (e) {
      setTasks(prev);
      notify.error(getErrorMessage(e));
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPriority("all");
  };

  const hasFilters = search || status !== "all" || priority !== "all";

  return (
    <section className="mx-auto max-w-[1200px] px-1 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 animate-[fadeIn_0.4s_ease-out]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-[28px] font-bold tracking-tight text-transparent">
              Vazifalar
            </h1>
            {counts.overdue > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 ring-1 ring-rose-200">
                <HiExclamationTriangle className="h-3 w-3" />
                {counts.overdue} kechikkan
              </span>
            )}
          </div>
          <p className="mt-1 text-[13.5px] text-slate-500">
            Muddatlarni kuzating va har bir vazifani Lead bilan bog&lsquo;lang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="Ro'yxat ko'rinishi"
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition ${
                view === "list"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <HiListBullet className="h-4 w-4" />
              <span className="hidden sm:inline">Ro&lsquo;yxat</span>
            </button>
            <button
              type="button"
              onClick={() => setView("board")}
              aria-label="Kanban ko'rinishi"
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition ${
                view === "board"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <HiViewColumns className="h-4 w-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>

          <Button
            onClick={() => {
              setEditing(null);
              setModal(true);
            }}
            variant="contained"
            startIcon={<HiPlus />}
            sx={{
              borderRadius: "10px",
              bgcolor: "#4f46e5",
              textTransform: "none",
              fontWeight: 700,
              px: 2,
              py: 1.05,
              boxShadow: "0 10px 22px -10px rgba(79,70,229,.75)",
              "&:hover": {
                bgcolor: "#4338ca",
                boxShadow: "0 12px 26px -10px rgba(79,70,229,.9)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Yangi vazifa
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Jami"
          value={counts.total}
          icon={<HiQueueList />}
          color="indigo"
          delay={0}
        />
        <Stat
          label="Bajarilmoqda"
          value={counts.active}
          icon={<HiClock />}
          color="blue"
          delay={60}
        />
        <Stat
          label="Bajarildi"
          value={counts.done}
          icon={<HiCheckCircle />}
          color="emerald"
          delay={120}
        />
        <Stat
          label="Kechiktirilgan"
          value={counts.overdue}
          icon={<HiExclamationTriangle />}
          color="rose"
          delay={180}
        />
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)]">
        <div className="relative min-w-[240px] flex-1">
          <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Vazifa, lead yoki kompaniya bo'yicha qidirish..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-9 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <HiXMark className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2">
          <HiFunnel className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="border-0 bg-transparent py-2.5 pr-1 text-[12.5px] font-medium text-slate-700 outline-none"
          >
            <option value="all">Barcha holatlar</option>
            {Object.entries(statuses).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2">
          <HiFlag className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
            className="border-0 bg-transparent py-2.5 pr-1 text-[12.5px] font-medium text-slate-700 outline-none"
          >
            <option value="all">Barcha ustuvorliklar</option>
            {Object.entries(priorities).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-[12px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <HiXMark className="h-3.5 w-3.5" />
            Tozalash
          </button>
        )}

        <span className="ml-auto hidden text-[11.5px] font-medium text-slate-400 sm:inline">
          {shown.length} / {tasks.length} ta vazifa
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton view={view} />
      ) : shown.length === 0 ? (
        <EmptyState hasFilters={Boolean(hasFilters)} onCreate={() => setModal(true)} onClear={clearFilters} />
      ) : view === "list" ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)]">
          <div className="divide-y divide-slate-100">
            {shown.map((task, i) => (
              <TaskRow
                key={task.id}
                task={task}
                index={i}
                onStatus={changeStatus}
                onEdit={() => {
                  setEditing(task);
                  setModal(true);
                }}
                onDelete={() => removeTask(task)}
              />
            ))}
          </div>
        </div>
      ) : (
        <Board
          tasks={shown}
          onStatus={changeStatus}
          onEdit={(task) => {
            setEditing(task);
            setModal(true);
          }}
          onDelete={removeTask}
        />
      )}

      {modal && <TaskDialog
        open
        leads={leads}
        initial={editing}
        onClose={() => {
          setModal(false);
          setEditing(null);
        }}
        onSaved={(task, isNew) => {
          setTasks((old) =>
            isNew ? [task, ...old] : old.map((t) => (t.id === task.id ? task : t))
          );
          setModal(false);
          setEditing(null);
        }}
      />}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </section>
  );
}

/* ---------------- Stat Card ---------------- */

function Stat({
  label,
  value,
  icon,
  color,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "indigo" | "blue" | "emerald" | "rose";
  delay?: number;
}) {
  const styles = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      bar: "from-indigo-500 to-violet-500",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      bar: "from-blue-500 to-cyan-500",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      bar: "from-emerald-500 to-teal-500",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      bar: "from-rose-500 to-pink-500",
    },
  }[color];

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06),0_16px_40px_-12px_rgba(15,23,42,0.12)] animate-[slideUp_0.5s_ease-out_backwards]"
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${styles.bar}`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1.5 text-[26px] font-bold leading-none text-slate-900">
            {value}
          </p>
        </div>
        <span
          className={`grid h-11 w-11 place-items-center rounded-xl ${styles.bg} ${styles.text} transition-transform duration-300 group-hover:scale-110 [&>svg]:h-5 [&>svg]:w-5`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

/* ---------------- Task Row (List) ---------------- */

function TaskRow({
  task,
  index,
  onStatus,
  onEdit,
  onDelete,
}: {
  task: Task;
  index: number;
  onStatus: (task: Task, status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isDone = task.status === "done";
  const dueInfo = getDueInfo(task.dueAt, isDone);
  const pr = priorities[task.priority];

  return (
    <div
      style={{ animationDelay: `${index * 30}ms` }}
      className="group relative flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/60 animate-[fadeIn_0.4s_ease-out_backwards] sm:flex-nowrap sm:px-5"
    >
      {/* Priority bar */}
      <span className={`absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r-full ${pr.bar} opacity-0 transition-opacity group-hover:opacity-100`} />

      {/* Complete checkbox */}
      <button
        type="button"
        onClick={() => onStatus(task, isDone ? "todo" : "done")}
        aria-label={isDone ? "Bajarilmagan deb belgilash" : "Bajarildi deb belgilash"}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          isDone
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 hover:border-emerald-500 hover:bg-emerald-50"
        }`}
      >
        {isDone && <HiCheckCircle className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>

      {/* Title + Lead */}
      <div className="min-w-[190px] flex-1">
        <p
          className={`truncate text-[13.5px] font-semibold transition-colors ${
            isDone ? "text-slate-400 line-through" : "text-slate-800"
          }`}
        >
          {task.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[11.5px] text-slate-500">
          {task.lead ? (
            <span className="flex items-center gap-1">
              <HiBriefcase className="h-3 w-3 text-slate-400" />
              <span className="truncate">
                {task.lead.company || task.lead.name}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-400">
              <HiUser className="h-3 w-3" />
              Leadga bog&lsquo;lanmagan
            </span>
          )}
        </div>
      </div>

      {/* Priority badge */}
      <span
        className={`hidden rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold sm:inline-flex ${pr.className}`}
      >
        {pr.label}
      </span>

      {/* Status select */}
      <Select
        value={task.status}
        onChange={(e) => onStatus(task, e.target.value as TaskStatus)}
        size="small"
        sx={{
          minWidth: 140,
          borderRadius: "9px",
          fontSize: 12,
          fontWeight: 600,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#c7d2fe" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#6366f1",
            borderWidth: "1.5px",
          },
        }}
      >
        {Object.entries(statuses).map(([key, item]) => (
          <MenuItem key={key} value={key}>
            <span className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
              <span className="text-[12px]">{item.label}</span>
            </span>
          </MenuItem>
        ))}
      </Select>

      {/* Due date */}
      <div
        className={`flex min-w-[120px] items-center gap-1.5 text-[11.5px] font-semibold ${dueInfo.className}`}
      >
        <HiCalendarDays className="h-3.5 w-3.5" />
        <span className="truncate">{dueInfo.label}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Tooltip title="Tahrirlash" arrow>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
          >
            <HiPencilSquare className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip title="O'chirish" arrow>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <HiTrash className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

/* ---------------- Board (Kanban) ---------------- */

function Board({
  tasks,
  onStatus,
  onEdit,
  onDelete,
}: {
  tasks: Task[];
  onStatus: (task: Task, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-3">
      {(Object.keys(statuses) as TaskStatus[]).map((key, colIndex) => {
        const meta = statuses[key];
        const columnTasks = tasks.filter((t) => t.status === key);
        return (
          <div
            key={key}
            style={{ animationDelay: `${colIndex * 80}ms` }}
            className="animate-[slideUp_0.5s_ease-out_backwards] rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3"
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-1.5 pb-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                <h3 className="text-[13px] font-bold text-slate-700">
                  {meta.label}
                </h3>
                <span className="rounded-full bg-white px-1.5 py-0.5 text-[10.5px] font-bold text-slate-500 ring-1 ring-slate-200">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Column body */}
            <div className="space-y-2.5">
              {columnTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 py-8 text-center">
                  <p className="text-[11.5px] text-slate-400">
                    Bu ustunda vazifa yo&lsquo;q
                  </p>
                </div>
              ) : (
                columnTasks.map((task, i) => (
                  <BoardCard
                    key={task.id}
                    task={task}
                    index={i}
                    onStatus={onStatus}
                    onEdit={() => onEdit(task)}
                    onDelete={() => onDelete(task)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BoardCard({
  task,
  index,
  onStatus,
  onEdit,
  onDelete,
}: {
  task: Task;
  index: number;
  onStatus: (task: Task, status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isDone = task.status === "done";
  const dueInfo = getDueInfo(task.dueAt, isDone);
  const pr = priorities[task.priority];

  const nextStatus: TaskStatus =
    task.status === "todo"
      ? "in_progress"
      : task.status === "in_progress"
        ? "done"
        : "todo";

  const nextLabel =
    task.status === "todo"
      ? "Boshlash"
      : task.status === "in_progress"
        ? "Yakunlash"
        : "Qayta ochish";

  return (
    <div
      style={{ animationDelay: `${index * 40}ms` }}
      className="group relative overflow-hidden rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06),0_12px_28px_-10px_rgba(15,23,42,0.1)] animate-[fadeIn_0.4s_ease-out_backwards]"
    >
      {/* Priority bar */}
      <span className={`absolute inset-y-0 left-0 w-0.5 ${pr.bar}`} />

      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${pr.className}`}
        >
          <span className={`h-1 w-1 rounded-full ${pr.dot}`} />
          {pr.label}
        </span>

        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
          >
            <HiPencilSquare className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <HiTrash className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <p
        className={`mt-2.5 text-[13px] font-semibold leading-snug ${
          isDone ? "text-slate-400 line-through" : "text-slate-800"
        }`}
      >
        {task.title}
      </p>

      {/* Lead */}
      {task.lead && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
          <HiBriefcase className="h-3 w-3 text-slate-400" />
          <span className="truncate">{task.lead.company || task.lead.name}</span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        <span
          className={`flex items-center gap-1 text-[11px] font-semibold ${dueInfo.className}`}
        >
          <HiCalendarDays className="h-3 w-3" />
          {dueInfo.label}
        </span>

        <button
          type="button"
          onClick={() => onStatus(task, nextStatus)}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[10.5px] font-bold text-slate-600 transition-colors hover:bg-indigo-500 hover:text-white"
        >
          {nextLabel}
          <HiChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Empty / Loading ---------------- */

function EmptyState({
  hasFilters,
  onCreate,
  onClear,
}: {
  hasFilters: boolean;
  onCreate: () => void;
  onClear: () => void;
}) {
  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white py-16 text-center animate-[fadeIn_0.4s_ease-out]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-500 ring-1 ring-indigo-100">
        {hasFilters ? (
          <HiMagnifyingGlass className="h-7 w-7" />
        ) : (
          <HiSparkles className="h-7 w-7" />
        )}
      </div>
      <h3 className="mt-4 text-[15px] font-bold text-slate-800">
        {hasFilters ? "Hech narsa topilmadi" : "Hali vazifalar yo'q"}
      </h3>
      <p className="mt-1 max-w-xs text-[12.5px] leading-relaxed text-slate-500">
        {hasFilters
          ? "Filtrlarni o'zgartirib qayta urinib ko'ring."
          : "Birinchi vazifangizni yaratib, ishni tashkillashtirishni boshlang."}
      </p>
      <div className="mt-5 flex items-center gap-2">
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Filtrlarni tozalash
          </button>
        )}
        <Button
          onClick={onCreate}
          variant="contained"
          startIcon={<HiPlus />}
          sx={{
            borderRadius: "10px",
            bgcolor: "#4f46e5",
            textTransform: "none",
            fontWeight: 700,
            px: 2,
            "&:hover": { bgcolor: "#4338ca" },
          }}
        >
          Yangi vazifa
        </Button>
      </div>
    </div>
  );
}

function LoadingSkeleton({ view }: { view: ViewMode }) {
  if (view === "board") {
    return (
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((col) => (
          <div
            key={col}
            className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3"
          >
            <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 space-y-2.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl border border-slate-200/70 bg-white"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0"
        >
          <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

/* ---------------- Helpers ---------------- */

function getDueInfo(dueAt: string, isDone: boolean) {
  if (isDone) {
    return { label: formatUzDate(dueAt, true), className: "text-slate-400" };
  }
  const now = new Date();
  const due = new Date(dueAt);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return {
      label: `${formatUzDate(dueAt, true)} · Kechikkan`,
      className: "text-rose-600",
    };
  }
  if (diffDays === 0) {
    return {
      label: "Bugun",
      className: "text-amber-600",
    };
  }
  if (diffDays === 1) {
    return {
      label: "Ertaga",
      className: "text-amber-600",
    };
  }
  return { label: formatUzDate(dueAt, true), className: "text-slate-500" };
}

/* ---------------- Dialog ---------------- */

function TaskDialog({
  open,
  leads,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  leads: Lead[];
  initial: Task | null;
  onClose: () => void;
  onSaved: (task: Task, isNew: boolean) => void;
}) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          title: initial.title,
          description: initial.description ?? "",
          priority: initial.priority,
          dueAt: toLocalInput(initial.dueAt),
          leadId: initial.lead?.id ?? "",
        }
      : {
          title: "",
          description: "",
          priority: "medium" as TaskPriority,
          dueAt: defaultDueAt(),
          leadId: "",
        }
  );
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueAt: new Date(form.dueAt).toISOString(),
        leadId: form.leadId || null,
      };
      if (initial) {
        const { data } = await api.patch<{ task: Task }>(
          `/tasks/${initial.id}`,
          payload
        );
        onSaved(data.task, false);
        notify.success("Vazifa yangilandi.");
      } else {
        const { data } = await api.post<{ task: Task }>("/tasks", payload);
        onSaved(data.task, true);
        notify.success("Vazifa yaratildi va Calendar'ga qo'shildi.");
      }
    } catch (e) {
      notify.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "20px",
            boxShadow: "0 24px 60px -16px rgba(15,23,42,0.25)",
          },
        },
      }}
    >
      <form onSubmit={submit}>
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            pb: 1,
          }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25">
            <HiPlus className="h-4 w-4" />
          </span>
          {initial ? "Vazifani tahrirlash" : "Yangi vazifa"}
        </DialogTitle>

        <DialogContent
          sx={{
            display: "grid",
            gap: 2,
            pt: "16px !important",
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              "&:hover fieldset": { borderColor: "#c7d2fe" },
              "&.Mui-focused fieldset": {
                borderColor: "#6366f1",
                borderWidth: "1.5px",
              },
            },
          }}
        >
          <TextField
            required
            autoFocus
            label="Vazifa nomi"
            placeholder="Masalan, mijozga qo'ng'iroq qilish"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <TextField
            label="Izoh"
            placeholder="Qo'shimcha tafsilotlar..."
            multiline
            minRows={2}
            maxRows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              required
              type="datetime-local"
              label="Muddat"
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.dueAt}
              onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
            />
            <TextField
              select
              label="Ustuvorlik"
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value as TaskPriority })
              }
            >
              {Object.entries(priorities).map(([key, item]) => (
                <MenuItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                    {item.label}
                  </span>
                </MenuItem>
              ))}
            </TextField>
          </div>

          <TextField
            select
            label="Bog'liq lead (ixtiyoriy)"
            value={form.leadId}
            onChange={(e) => setForm({ ...form, leadId: e.target.value })}
          >
            <MenuItem value="">
              <span className="flex items-center gap-2 text-slate-400">
                <HiUser className="h-3.5 w-3.5" />
                Lead tanlanmagan
              </span>
            </MenuItem>
            {leads.map((lead) => (
              <MenuItem key={lead.id} value={lead.id}>
                {lead.company || lead.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={onClose}
            disabled={saving}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              fontWeight: 600,
              color: "#64748b",
            }}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            disabled={saving}
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <HiCheckCircle />
              )
            }
            sx={{
              bgcolor: "#4f46e5",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              px: 2.25,
              py: 1,
              boxShadow: "0 10px 22px -10px rgba(79,70,229,.75)",
              "&:hover": {
                bgcolor: "#4338ca",
                boxShadow: "0 12px 26px -10px rgba(79,70,229,.9)",
              },
            }}
          >
            {saving
              ? "Saqlanmoqda..."
              : initial
                ? "Saqlash"
                : "Yaratish"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

/* ---------------- Input helpers ---------------- */

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function defaultDueAt() {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return toLocalInput(d.toISOString());
}
