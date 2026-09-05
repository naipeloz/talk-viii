"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { MonthCalendar } from "./month-calendar";
import { SidePanel } from "./side-panel";
import { CalendarEvent, addMonths, startOfMonth, toISODate } from "@/lib/calendar";
import { buildSampleEvents } from "@/lib/sample-events";

const noopSubscribe = () => () => {};

/** `false` on the server and during hydration, `true` once mounted. */
function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function CalendarWorkspace() {
  // "Now" is resolved on the client only, so the server render never depends on
  // the visitor's clock or timezone.
  const isClient = useIsClient();
  const [monthOverride, setMonthOverride] = useState<Date | null>(null);
  const [selectedOverride, setSelectedOverride] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const today = isClient ? toISODate(new Date()) : null;
  const month = monthOverride ?? (isClient ? startOfMonth(new Date()) : null);
  const selected = selectedOverride ?? today;

  const events = useMemo<CalendarEvent[]>(
    () => (isClient ? buildSampleEvents(new Date()) : []),
    [isClient],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const bucket = map.get(event.date);
      if (bucket) bucket.push(event);
      else map.set(event.date, [event]);
    }
    for (const bucket of map.values()) bucket.sort((a, b) => a.time.localeCompare(b.time));
    return map;
  }, [events]);

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
      />
    </main>
  );
}
