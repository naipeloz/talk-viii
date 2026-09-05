import { CalendarConfigError, fetchCalendarEvents } from "@/lib/google-calendar";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function GET(request: Request) {
  const month = new URL(request.url).searchParams.get("month");

  if (!month || !MONTH_PATTERN.test(month)) {
    return Response.json({ error: "Parámetro `month` inválido, se espera YYYY-MM." }, { status: 400 });
  }

  const [year, monthIndex] = month.split("-").map(Number);
  // Pad the range so the leading/trailing days of the 6-week grid are covered.
  const timeMin = new Date(Date.UTC(year, monthIndex - 1, 1 - 10)).toISOString();
  const timeMax = new Date(Date.UTC(year, monthIndex, 10)).toISOString();

  try {
    const { events, timeZone } = await fetchCalendarEvents(timeMin, timeMax);
    return Response.json({ events, timeZone });
  } catch (error) {
    if (error instanceof CalendarConfigError) {
      return Response.json({ error: error.message, configured: false }, { status: 503 });
    }

    console.error("[calendar] fetch failed", error);
    return Response.json(
      { error: "No se pudieron cargar los eventos de Google Calendar." },
      { status: 502 },
    );
  }
}
