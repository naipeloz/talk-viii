import { CalendarEvent, toISODate } from "./calendar";

/** Demo agenda, positioned relative to `reference` so the grid is never empty. */
export function buildSampleEvents(reference: Date): CalendarEvent[] {
  const at = (offset: number) => {
    const date = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate() + offset);
    return toISODate(date);
  };

  return [
    { id: "1", date: at(0), time: "09:30", title: "Daily standup", color: "bg-sky-500" },
    { id: "2", date: at(0), time: "14:00", title: "Revisión de diseño", color: "bg-violet-500" },
    { id: "3", date: at(0), time: "17:30", title: "1:1 con Julián", color: "bg-emerald-500" },
    { id: "4", date: at(1), time: "11:00", title: "Kickoff cliente", color: "bg-amber-500" },
    { id: "5", date: at(2), time: "10:00", title: "Sprint planning", color: "bg-sky-500" },
    { id: "6", date: at(2), time: "16:00", title: "Demo interna", color: "bg-rose-500" },
    { id: "7", date: at(4), time: "12:00", title: "Almuerzo de equipo", color: "bg-emerald-500" },
    { id: "8", date: at(-3), time: "15:00", title: "Retro", color: "bg-violet-500" },
    { id: "9", date: at(7), time: "09:00", title: "Deploy a producción", color: "bg-rose-500" },
    { id: "10", date: at(9), time: "13:30", title: "Workshop de producto", color: "bg-amber-500" },
  ];
}
