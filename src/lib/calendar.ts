export type CalendarEvent = {
  id: string;
  /** ISO date, `YYYY-MM-DD`, in the calendar's own time zone. */
  date: string;
  /** `HH:MM`, or an empty string for all-day events. */
  time: string;
  title: string;
  /** Tailwind background class used for the event dot. */
  color: string;
  allDay?: boolean;
  location?: string;
  htmlLink?: string;
};

export function groupEventsByDate(events: CalendarEvent[]) {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const bucket = map.get(event.date);
    if (bucket) bucket.push(event);
    else map.set(event.date, [event]);
  }
  for (const bucket of map.values()) {
    bucket.sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return a.time.localeCompare(b.time);
    });
  }
  return map;
}

export const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function toISODate(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

/**
 * The 42 days (6 weeks) covering `month`, padded with the surrounding months so
 * every week starts on Monday.
 */
export function buildMonthGrid(month: Date) {
  const first = startOfMonth(month);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    return {
      date,
      iso: toISODate(date),
      inMonth: date.getMonth() === month.getMonth(),
    };
  });
}

export function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(date);
}

export function formatFullDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
}
