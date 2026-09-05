"use client";

import { CalendarEvent, formatFullDate } from "@/lib/calendar";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  selected: string | null;
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
};

export function SidePanel({ collapsed, onToggle, selected, events, loading, error }: Props) {
  return (
    <aside
      className={[
        "flex shrink-0 flex-col border-l border-black/10 transition-[width] duration-300 ease-out dark:border-white/10",
        collapsed ? "w-12" : "w-1/3 min-w-[280px]",
      ].join(" ")}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-black/10 px-2 py-4 dark:border-white/10">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expandir panel" : "Colapsar panel"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10"
        >
          {collapsed ? "«" : "»"}
        </button>
        {!collapsed && <h2 className="truncate text-sm font-semibold">Detalle del día</h2>}
      </div>

      {collapsed ? (
        <div className="flex flex-1 justify-center pt-4">
          <span className="text-xs uppercase tracking-widest opacity-60 [writing-mode:vertical-rl]">
            Detalle
          </span>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <p className="text-lg font-medium capitalize">
            {selected ? formatFullDate(selected) : "—"}
          </p>
          <p className="mt-1 text-sm opacity-60">
            {loading
              ? "Cargando…"
              : error
                ? "No disponible"
                : events.length === 0
                  ? "Sin eventos"
                  : `${events.length} ${events.length === 1 ? "evento" : "eventos"}`}
          </p>

          <ul className="mt-5 flex flex-col gap-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-start gap-3 rounded-lg border border-black/10 p-3 dark:border-white/10"
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${event.color}`} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">
                    {event.htmlLink ? (
                      <a
                        href={event.htmlLink}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-2 hover:underline"
                      >
                        {event.title}
                      </a>
                    ) : (
                      event.title
                    )}
                  </span>
                  <span className="block text-sm opacity-60">
                    {event.allDay ? "Todo el día" : event.time}
                  </span>
                  {event.location && (
                    <span className="mt-0.5 block truncate text-sm opacity-60" title={event.location}>
                      {event.location}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {!loading && !error && events.length === 0 && (
            <p className="mt-5 rounded-lg border border-dashed border-black/15 p-6 text-center text-sm opacity-60 dark:border-white/15">
              Elegí otro día en el calendario para ver su agenda.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
