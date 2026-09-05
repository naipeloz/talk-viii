# Agregar la vista de semana al calendario

**Dueño:** Julián · **Bloquea a:** nada

## Criterio de éxito

El usuario elige entre mes y semana, y al cambiar de vista sigue mirando el mismo día
que tenía seleccionado — la vista es un lente sobre una fecha, no un lugar distinto al
que hay que volver a navegar. **El día no es una vista:** se ve en el panel de la
derecha, que ya existe, al seleccionarlo en cualquiera de las dos grillas.

## Contrato

**Sin endpoint nuevo.** `GET /api/events?month=YYYY-MM` ya alcanza para las dos vistas:
el handler pide a Google desde 10 días antes del 1° hasta 10 días después del último
(`src/app/api/events/route.ts:14-15`), padding que existe para las orillas de la grilla
de 6 semanas. Una semana que cruza dos meses —lunes 2026-09-28 a domingo 2026-10-04—
entra entera en el rango de septiembre. La vista de semana **no agrega una sola llamada**.

Estado en `calendar-workspace.tsx`: `monthOverride: Date | null` se generaliza a un
ancla, y se suma la vista.

```ts
export type Vista = "mes" | "semana";
```

- `vista: Vista` — arranca en `"mes"`.
- `anchorOverride: Date | null` — la primera unidad visible: el 1° del mes o el lunes de
  la semana.
- `selectedOverride: string | null` — se queda como está: el día del panel lateral.
- `monthKey` se deriva del **ancla**, no de `selected`. En semana el ancla es el lunes,
  así que el `?month=` es el del lunes y el padding cubre el domingo aunque caiga en el
  mes siguiente.

**Regla de cambio de vista:** el ancla nuevo se deriva siempre de `selected`. A semana →
el lunes de `selected`. A mes → el 1° del mes de `selected`. Es lo que hace cierto el
criterio de éxito.

**El panel lateral no cambia.** Hoy ya muestra el detalle de `selected`; seguir haciendo
eso desde la grilla de semana es todo lo que hace falta. Un clic en un día de cualquiera
de las dos vistas actualiza `selected` y el panel lo refleja.

**Navegación:** `onMonthChange(amount)` se generaliza a `onStep(amount)`, que mueve ±1 mes
o ±7 días según la vista. `onToday` no cambia de vista: salta al día de hoy en la que esté.

Helpers nuevos en `src/lib/calendar.ts`, al lado de `buildMonthGrid`:

```ts
export function startOfWeek(date: Date): Date;            // lunes, mismo offset (getDay()+6)%7
export function addDays(date: Date, amount: number): Date;
export function buildWeekGrid(anchor: Date): { date: Date; iso: string }[];  // 7, lun→dom
export function formatWeekRange(anchor: Date): string;    // "28 sep – 4 oct 2026"
```

**El contrato de datos se extiende: `CalendarEvent` no tiene hora de fin.** Hoy guarda
`time: "HH:MM"` y nada más (`src/lib/calendar.ts:1-13`), así que una grilla horaria no
puede darle alto a un bloque. Google **ya devuelve el dato** —`end` está en el `fields`
de `google-calendar.ts:185` y `expand()` calcula `endParts` en la línea 143— pero lo
descarta. No hace falta pedir nada nuevo a la API: se agrega el campo y se escribe.

```ts
/** `HH:MM`, o cadena vacía si el evento es all-day. */
endTime: string;
```

Reglas de `endTime` en `expand()`, que es donde se rompen las grillas horarias:

- All-day → `""`, igual que `time`.
- Evento de un solo día → `endParts.time`.
- Sin `end.dateTime` en Google → `endTime === time`; lo dibuja la UI con el mínimo de 30 min.
- Multi-día, que `expand()` ya parte en un `CalendarEvent` por día: el primero va de
  `startParts.time` a `"24:00"`, los del medio de `"00:00"` a `"24:00"`, el último de
  `"00:00"` a `endParts.time`.

**Rango horario de la grilla:** por defecto 07:00–21:00, y se estira hacia atrás o hacia
adelante hasta cubrir el evento más temprano y el más tardío del rango visible, redondeando
a la hora. Ningún evento queda fuera de la vista.

**All-day fuera de la grilla:** franja fija arriba, como Google Calendar. Un evento sin
hora no tiene dónde ir en un eje de horas.

Componente nuevo: `src/components/week-calendar.tsx`, hermano de `month-calendar.tsx`. El
selector de vista va en el header que ya existe, al lado de ‹ Hoy ›. `MonthCalendar`
cambia sólo la firma de `onMonthChange` → `onStep`.

Antes de escribir código, leer la guía correspondiente en `node_modules/next/dist/docs/`
como pide `AGENTS.md`: esta versión de Next no es la de tu memoria.

## Criterios de aceptación

- [ ] Con la vista en semana y 2026-09-30 seleccionado, la grilla muestra lunes 2026-09-28
      a domingo 2026-10-04 —siete columnas, dos meses distintos— y la pestaña Network
      registra **una sola** llamada a `/api/events`
- [ ] Recorrer mes → semana → mes con 2026-09-30 seleccionado deja el 30 seleccionado en
      las tres pantallas, y el panel lateral siempre en ese día
- [ ] Un clic en un día de la grilla de semana actualiza el panel de la derecha al detalle
      de ese día, igual que en la vista de mes
- [ ] ‹ y › mueven un mes en vista de mes y siete días en vista de semana
- [ ] "Hoy" salta al día de hoy sin cambiar la vista activa
- [ ] Un evento de 09:00 a 10:30 ocupa el alto de 90 minutos; uno que Google devuelve sin
      `end.dateTime` ocupa el mínimo de 30
- [ ] Un evento all-day aparece en la franja de arriba, nunca dentro de una hora
- [ ] Un evento a las 06:30, fuera del rango por defecto, hace que la grilla arranque a
      las 06:00
- [ ] Un evento de 2026-09-28 18:00 a 2026-09-30 11:00 se dibuja los tres días: el 28
      desde las 18:00 hasta abajo, el 29 entero, el 30 hasta las 11:00
- [ ] Una columna sin eventos se ve vacía, no como un error ni como un estado distinto
- [ ] `node --test src/lib/calendar.test.ts` pasa: `startOfWeek` sobre los siete días de
      una semana devuelve el mismo lunes; `buildWeekGrid` devuelve 7 ISO consecutivos; y
      la semana que cruza mes devuelve un único `monthKey`
- [ ] `npm run lint` y `npm run build` pasan

## Restricciones de alcance

- ⚠️ **Eventos solapados: sin decidir.** Dos reuniones de 10:00 a 11:00 el mismo día
      pueden ir en columnas lado a lado, apiladas con offset, o colapsadas en "2 eventos".
      Las tres son defendibles y cambian el código de layout entero. **Si se llega a
      implementar la grilla sin esta decisión tomada, el ticket se frena y se le pregunta
      a Julián** — no elegir por defecto
- **Sin vista de día.** El día se lee en el panel de la derecha al seleccionarlo. Una
  tercera vista para lo mismo agrega un modo que mantener sin agregar información
- Sin crear, editar, mover ni borrar eventos: las dos vistas son de lectura
- Sin drag & drop ni resize de bloques
- Sin deep-link ni persistencia: un reload vuelve a vista de mes y al día de hoy
- Sin línea de "ahora" sobre la grilla
- Sin vista de agenda/lista y sin vista de año
- Sin atajos de teclado
- Sin endpoint nuevo y sin tocar el rango que pide `/api/events`
- Sin rediseñar el panel lateral ni tocar la caja de Claude: sólo se sigue alimentando
  `selected` como hoy
- Sin zona horaria del visitante: se sigue usando la del calendario, como hoy

## Cómo se verifica

`node --test src/lib/calendar.test.ts` cubre lo puro: `startOfWeek`, `buildWeekGrid`, el
`monthKey` único de la semana a caballo entre dos meses, y las cuatro reglas de `endTime`
sobre fixtures de `expand()` —all-day, un día, sin `end`, y multi-día— sin pegarle a
Google.

`npm run dev` y a mano, contra el calendario TALK VII: pararse en la semana del
2026-09-28, comprobar las siete columnas y la única llamada en Network; hacer clic en dos
días distintos y verificar que el panel de la derecha los sigue; volver a mes y comprobar
que el día seleccionado no se movió; y mirar que un evento conocido de hora y media mida
hora y media. Lo mira Julián.
