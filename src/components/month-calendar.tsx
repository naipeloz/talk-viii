"use client";

import { CalendarEvent, WEEKDAYS, buildMonthGrid, formatMonth } from "@/lib/calendar";

type Props = {
  month: Date;
  today: string;
  selected: string;
  eventsByDate: Map<string, CalendarEvent[]>;
  loading: boolean;
  error: string | null;
  onSelect: (iso: string) => void;
  onMonthChange: (amount: number) => void;
  onToday: () => void;
};

export function MonthCalendar({
  month,
  today,
  selected,
  eventsByDate,
  loading,
  error,
  onSelect,
  onMonthChange,
  onToday,
}: Props) {
  const days = buildMonthGrid(month);

  return (
    <section className="flex h-full min-w-0 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-black/10 px-6 py-4 dark:border-white/10">
        <h1 className="text-xl font-semibold capitalize">{formatMonth(month)}</h1>
        {loading && (
          <span className="text-xs opacity-60" role="status">
            Cargando…
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMonthChange(-1)}
            aria-label="Mes anterior"
            className="rounded-md px-2.5 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onToday}
            className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(1)}
            aria-label="Mes siguiente"
            className="rounded-md px-2.5 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
          >
            ›
          </button>
        </div>
      </header>

      {error && (
        <p
          role="alert"
          className="shrink-0 border-b border-amber-500/30 bg-amber-500/10 px-6 py-2 text-sm"
        >
          {error}
        </p>
      )}

      <div className="grid shrink-0 grid-cols-7 border-b border-black/10 dark:border-white/10">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wide opacity-60"
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
        {days.map(({ date, iso, inMonth }) => {
          const events = eventsByDate.get(iso) ?? [];
          const isToday = iso === today;
          const isSelected = iso === selected;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              aria-pressed={isSelected}
              className={[
                "flex min-h-0 flex-col items-start gap-1 overflow-hidden border-r border-b border-black/10 p-2 text-left transition-colors dark:border-white/10",
                inMonth ? "" : "opacity-40",
                isSelected ? "bg-sky-500/10 ring-1 ring-inset ring-sky-500" : "hover:bg-black/5 dark:hover:bg-white/5",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm",
                  isToday ? "bg-sky-500 font-semibold text-white" : "",
                ].join(" ")}
              >
                {date.getDate()}
              </span>

              <span className="flex w-full min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                {events.slice(0, 3).map((event) => (
                  <span
                    key={event.id}
                    className="flex items-center gap-1.5 truncate rounded px-1 py-0.5 text-xs"
                    title={event.allDay ? event.title : `${event.time} · ${event.title}`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${event.color}`} />
                    {!event.allDay && <span className="shrink-0 tabular-nums opacity-50">{event.time}</span>}
                    <span className="truncate opacity-80">{event.title}</span>
                  </span>
                ))}
                {events.length > 3 && (
                  <span className="px-1 text-xs opacity-60">+{events.length - 3} más</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
