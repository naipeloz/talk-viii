# Comparar los bloques de foco del día contra el resto de la semana

**Dueño:** Julián · **Bloquea a:** nada

## Criterio de éxito

Al seleccionar un día, el panel dice cuántos bloques libres de dos horas o más tiene ese
día, cómo se compara con los otros días de su semana, y cuál fue el mejor y el peor —
todo con números calculados, no estimados a ojo sobre la grilla.

## Contrato

Dos funciones puras en `src/lib/focus-blocks.ts`. `SidePanel` las consume; no calcula
nada por su cuenta.

```ts
export type Bloque = {
  inicio: string;    // "HH:MM"
  fin: string;
  minutos: number;
};

export type DiaConBloques = {
  fecha: string;         // ISO "YYYY-MM-DD"
  bloques: Bloque[];
  minutosLibres: number; // suma de los bloques
};

export type ResumenSemana = {
  dias: DiaConBloques[];      // lunes a viernes, siempre 5 entradas
  mejor: string | null;       // fecha ISO, o null si todos empatan
  peor: string | null;
};

export function bloquesDelDia(fecha: string, eventos: CalendarEvent[]): Bloque[];
export function resumenDeLaSemana(
  lunesISO: string,
  eventosPorFecha: Map<string, CalendarEvent[]>,
): ResumenSemana;
```

**Sin endpoint nuevo.** `GET /api/events?month=YYYY-MM` ya trae la semana entera: el
handler pide desde 10 días antes del 1° hasta 10 días después del último
(`src/app/api/events/route.ts:14-15`), así que una semana a caballo de dos meses entra
completa. Es el mismo argumento que hace [#7](https://github.com/naipeloz/talk-viii/issues/7).

**Este ticket extiende el contrato existente.** `CalendarEvent` guarda solo `time`, que
es el inicio: `expand()` en `src/lib/google-calendar.ts` recibe el `end` de Google y lo
descarta. Sin hora de fin no hay huecos que medir. Se agrega `endTime: string`
(`"HH:MM"`, vacío en all-day) y se puebla ahí.

Reglas del cálculo, tomadas del spec en
`elegir-bien-el-problema/ejemplos/bloques-de-foco/3-tickets/0-spec.md`:

| Regla | Decisión |
|---|---|
| Horario laboral | 9:00–18:00 |
| Bloque | Hueco libre continuo de ≥120 min dentro del horario laboral |
| Colchón | 15 min después de cada evento antes de que abra el bloque siguiente |
| All-day | Borra el día entero: cero bloques |
| Eventos superpuestos | Se unen en un solo tramo ocupado |
| Evento fuera del horario laboral | No afecta al día |
| Mejor y peor día | Por `minutosLibres`. Empate en el máximo o el mínimo → `null` |
| La semana | Lunes a viernes. Sábado y domingo no se cuentan |

## Criterios de aceptación

- [ ] Un día sin eventos devuelve un bloque: 09:00–18:00, 540 minutos
- [ ] Una reunión de 12:00 a 13:00 devuelve dos bloques: 09:00–12:00 y 13:15–18:00
- [ ] Una reunión que termina a las 14:00 abre el bloque siguiente a las 14:15, no a las 14:00
- [ ] Un hueco de 1 h 59 min no aparece en la salida
- [ ] Un día con un evento all-day devuelve cero bloques
- [ ] Dos eventos superpuestos (10:00–11:00 y 10:30–12:00) dejan un único bloque
      12:15–18:00, no dos tramos separados
- [ ] Un evento de 08:00 a 08:45 no cambia el resultado del día
- [ ] `resumenDeLaSemana` devuelve siempre 5 entradas, aunque falten eventos de algún día
- [ ] Con lunes 300 min y el resto 200, `mejor` es el lunes; con los cinco días iguales,
      `mejor` y `peor` son `null`
- [ ] Seleccionar cualquier día de una misma semana produce el mismo `ResumenSemana`
- [ ] El panel muestra el conteo del día seleccionado y los cinco días de la semana con
      sus minutos, con el día seleccionado destacado
- [ ] Cuando `mejor` es `null`, el panel dice que no hay diferencia en vez de no mostrar nada
- [ ] Hay un test con dos días de idénticas horas totales de reunión y distinta cantidad
      de bloques

## Restricciones de alcance

- ⚠️ **Almuerzo: pendiente de decidir.** ¿Parte la mañana de la tarde, o es tiempo
      libre? Sigue sin decidir en el spec. No implementar un default en silencio: si
      llega el momento sin decisión, el ticket se frena y se pregunta
- Sin reglas de estado del evento: `/api/events` no pide `attendees` ni `eventType`, así
  que declinado, tentativo y "Focus time" propio no se distinguen — todo evento con hora
  corta. Verificado contra el calendario real: `attendees` viene vacío y todos los
  eventos son `eventType: default`
- Sin agregación mensual: la comparación es dentro de la semana del día seleccionado
- Sin gráfico interactivo: barras de texto o CSS en el panel
- Sin sugerencias de reagendado — eso es el ticket del análisis
- Sin configuración: horario laboral, colchón y umbral de 2 h son constantes declaradas
  en el módulo
- Sin dependencias nuevas

## Cómo se verifica

`node --test src/lib/focus-blocks.test.ts`, con el runner que ya trae Node — sin agregar
framework. Un test por cada criterio de aceptación de las dos funciones.

La parte visual: `npm run dev`, elegir un día con reuniones y otro vacío de la misma
semana, y comprobar que el resumen no cambia al moverse entre días. Lo mira Julián.
