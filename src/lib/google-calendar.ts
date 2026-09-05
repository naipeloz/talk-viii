import "server-only";
import { CalendarEvent } from "./calendar";
import { getServiceAccountToken } from "./google-auth";

const API_BASE = "https://www.googleapis.com/calendar/v3/calendars";

/** Google's `colorId` palette, mapped onto the dot colors the UI already uses. */
const EVENT_COLORS: Record<string, string> = {
  "1": "bg-indigo-400",
  "2": "bg-emerald-500",
  "3": "bg-violet-500",
  "4": "bg-rose-400",
  "5": "bg-amber-400",
  "6": "bg-orange-500",
  "7": "bg-cyan-500",
  "8": "bg-slate-500",
  "9": "bg-blue-600",
  "10": "bg-green-600",
  "11": "bg-red-600",
};
const FALLBACK_COLORS = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

type GoogleDate = { date?: string; dateTime?: string; timeZone?: string };
type GoogleEvent = {
  id: string;
  status?: string;
  summary?: string;
  location?: string;
  htmlLink?: string;
  colorId?: string;
  start?: GoogleDate;
  end?: GoogleDate;
};
type EventsResponse = {
  timeZone?: string;
  items?: GoogleEvent[];
  nextPageToken?: string;
};

export class CalendarConfigError extends Error {}

/** The calendar this app was built for; override with `GOOGLE_CALENDAR_ID`. */
const DEFAULT_CALENDAR_ID =
  "b4e44c98f328c5dff98e4c84e4abb3866e719e3e4e469da7d33feadd8439c743@group.calendar.google.com";

export function getCalendarId() {
  return process.env.GOOGLE_CALENDAR_ID || DEFAULT_CALENDAR_ID;
}

/**
 * Either a service account (private calendar shared with it) or an API key
 * (calendar made public). Returns the query params and headers to use.
 */
type Auth = { headers: Record<string, string>; params: Record<string, string> };

async function getAuth(): Promise<Auth> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    const token = await getServiceAccountToken(clientEmail, privateKey);
    return { headers: { authorization: `Bearer ${token}` }, params: {} };
  }

  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  if (apiKey) return { headers: {}, params: { key: apiKey } };

  throw new CalendarConfigError(
    "Faltan credenciales de Google: definí GOOGLE_SERVICE_ACCOUNT_EMAIL + " +
      "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (calendario privado) o GOOGLE_CALENDAR_API_KEY " +
      "(calendario público).",
  );
}

function hashColor(id: string) {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

/** `YYYY-MM-DD` and `HH:MM` for `instant`, as seen in `timeZone`. */
function zonedParts(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);

  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return {
    date: `${lookup("year")}-${lookup("month")}-${lookup("day")}`,
    time: `${lookup("hour")}:${lookup("minute")}`,
  };
}

function addDays(iso: string, amount: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + amount));
  return next.toISOString().slice(0, 10);
}

/** Guard against a malformed event expanding into thousands of grid entries. */
const MAX_SPAN_DAYS = 60;

function expand(event: GoogleEvent, calendarTimeZone: string): CalendarEvent[] {
  const title = event.summary?.trim() || "(sin título)";
  const color = (event.colorId && EVENT_COLORS[event.colorId]) || hashColor(event.id);
  const shared = {
    title,
    color,
    location: event.location,
    htmlLink: event.htmlLink,
  };

  if (event.start?.date) {
    // All-day: `end.date` is exclusive per the Calendar API.
    const first = event.start.date;
    const last = event.end?.date ? addDays(event.end.date, -1) : first;
    const days: CalendarEvent[] = [];

    for (let day = first, i = 0; day <= last && i < MAX_SPAN_DAYS; day = addDays(day, 1), i += 1) {
      days.push({ ...shared, id: `${event.id}:${day}`, date: day, time: "", allDay: true });
    }
    return days.length > 0 ? days : [{ ...shared, id: event.id, date: first, time: "", allDay: true }];
  }

  if (!event.start?.dateTime) return [];

  const startParts = zonedParts(new Date(event.start.dateTime), calendarTimeZone);
  const endParts = event.end?.dateTime
    ? zonedParts(new Date(event.end.dateTime), calendarTimeZone)
    : startParts;

  const days: CalendarEvent[] = [];
  for (
    let day = startParts.date, i = 0;
    day <= endParts.date && i < MAX_SPAN_DAYS;
    day = addDays(day, 1), i += 1
  ) {
    days.push({
      ...shared,
      id: i === 0 ? event.id : `${event.id}:${day}`,
      date: day,
      time: i === 0 ? startParts.time : "00:00",
    });
  }
  return days;
}

/**
 * Every occurrence between `timeMin` and `timeMax` (RFC3339), with recurring
 * events already expanded by Google and multi-day events split per day.
 */
export async function fetchCalendarEvents(timeMin: string, timeMax: string) {
  const calendarId = getCalendarId();
  const auth = await getAuth();

  const events: CalendarEvent[] = [];
  let calendarTimeZone = "UTC";
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      ...auth.params,
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "2500",
      fields: "timeZone,nextPageToken,items(id,status,summary,location,htmlLink,colorId,start,end)",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const url = `${API_BASE}/${encodeURIComponent(calendarId)}/events?${params}`;
    const response = await fetch(url, {
      headers: auth.headers,
      // Google is the source of truth; a few minutes of staleness is fine and
      // keeps us well inside API quota.
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Google Calendar respondió ${response.status}: ${detail.slice(0, 500)}`);
    }

    const payload: EventsResponse = await response.json();
    calendarTimeZone = payload.timeZone ?? calendarTimeZone;

    for (const item of payload.items ?? []) {
      if (item.status === "cancelled") continue;
      events.push(...expand(item, calendarTimeZone));
    }

    pageToken = payload.nextPageToken;
  } while (pageToken);

  return { events, timeZone: calendarTimeZone };
}
