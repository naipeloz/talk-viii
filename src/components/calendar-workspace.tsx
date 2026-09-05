"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { MonthCalendar } from "./month-calendar";
import { SidePanel } from "./side-panel";
import { CalendarEvent, addMonths, groupEventsByDate, startOfMonth, toISODate } from "@/lib/calendar";

const noopSubscribe = () => () => {};

/** `false` on the server and during hydration, `true` once mounted. */
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function monthKeyOf(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
}

type Loaded =
  | { month: string; events: CalendarEvent[]; timeZone: string }
  | { month: string; error: string };

export function CalendarWorkspace() {
  // "Now" is resolved on the client only, so the server render never depends on
  // the visitor's clock or timezone.
  const isClient = useIsClient();
  const [monthOverride, setMonthOverride] = useState<Date | null>(null);
  const [selectedOverride, setSelectedOverride] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  const today = isClient ? toISODate(new Date()) : null;
  const month = monthOverride ?? (isClient ? startOfMonth(new Date()) : null);
  const selected = selectedOverride ?? today;
  const monthKey = month ? monthKeyOf(month) : null;

  useEffect(() => {
    if (!monthKey) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`/api/events?month=${monthKey}`, {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (controller.signal.aborted) return;

        if (!response.ok) {
          setLoaded({ month: monthKey, error: payload.error ?? "Error al cargar los eventos." });
          return;
        }

        setLoaded({ month: monthKey, events: payload.events, timeZone: payload.timeZone });
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoaded({
          month: monthKey,
          error: error instanceof Error ? error.message : "Error al cargar los eventos.",
        });
      }
    };

    void load();
    return () => controller.abort();
  }, [monthKey]);

  const isCurrent = loaded !== null && loaded.month === monthKey;
  const events = useMemo(
    () => (isCurrent && "events" in loaded ? loaded.events : []),
    [isCurrent, loaded],
  );
  const error = isCurrent && "error" in loaded ? loaded.error : null;
  const loading = !isCurrent;

  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);

  const goToToday = () => {
    const now = new Date();
    setMonthOverride(startOfMonth(now));
    setSelectedOverride(toISODate(now));
  };

  return (
    <main className="flex h-dvh w-full overflow-hidden">
      <div className="min-w-0 flex-1">
        {month && today && selected ? (
          <MonthCalendar
            month={month}
            today={today}
            selected={selected}
            eventsByDate={eventsByDate}
            loading={loading}
            error={error}
            onSelect={setSelectedOverride}
            onMonthChange={(amount) => setMonthOverride(addMonths(month, amount))}
            onToday={goToToday}
          />
        ) : (
          <div className="h-full animate-pulse bg-black/5 dark:bg-white/5" />
        )}
      </div>

      <SidePanel
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        selected={selected}
        events={selected ? (eventsByDate.get(selected) ?? []) : []}
        loading={loading}
        error={error}
      />
    </main>
  );
}
