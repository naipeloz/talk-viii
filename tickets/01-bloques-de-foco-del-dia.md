# Mostrar los bloques de foco del día seleccionado

**Dueño:** Julián · **Bloquea a:** nada

## Criterio de éxito

El panel del día dice cuántos bloques libres de dos horas o más quedan en el día
seleccionado y en qué horarios, sin que nadie tenga que mirar la grilla y contarlos a
ojo.

## Contrato

Entra: la fecha ISO del día seleccionado y sus `CalendarEvent[]`, los que ya trae
`/api/events`. Sale:

```ts
export type Bloque = {
  inicio: string;   // "HH:MM"
  fin: string;      // "HH:MM"
  minutos: number;
};

export function bloquesDelDia(fecha: string, eventos: CalendarEvent[]): Bloque[];
```

Función pura en `src/lib/focus-blocks.ts`. `SidePanel` la consume; no calcula nada por
su cuenta.

**Este ticket extiende el contrato existente.** `CalendarEvent` hoy guarda solo `time`,
que es el inicio: `expand()` en `src/lib/google-calendar.ts` recibe el `end` de Google y
lo descarta. Sin hora de fin no hay huecos que medir. Se agrega `endTime: string`
(`"HH:MM"`, vacío en all-day) y se puebla ahí. Es el único cambio al tipo.

Reglas aplicadas, tomadas del spec en
`elegir-bien-el-problema/ejemplos/bloques-de-foco/3-tickets/0-spec.md`:

| Regla | Decisión |
|---|---|
| Horario laboral | 9:00–18:00 |
| Bloque | Hueco libre continuo de ≥120 min dentro del horario laboral |
| Colchón | 15 min después de cada evento antes de que abra el bloque siguiente |
| All-day | Borra el día entero: cero bloques |
| Eventos superpuestos | Se unen en un solo tramo ocupado |
| Evento fuera del horario laboral | No afecta al día |

## Criterios de aceptación

- [ ] Un día sin eventos devuelve un bloque: 09:00–18:00, 540 minutos
- [ ] Una reunión de 12:00 a 13:00 devuelve dos bloques: 09:00–12:00 y 13:15–18:00
- [ ] Una reunión que termina a las 14:00 abre el bloque siguiente a las 14:15, no a las 14:00
- [ ] Un hueco de 1 h 59 min no aparece en la salida
- [ ] Un día con un evento all-day devuelve cero bloques
- [ ] Dos eventos superpuestos (10:00–11:00 y 10:30–12:00) dejan un único bloque
      12:15–18:00, no dos tramos separados
- [ ] Un evento de 08:00 a 08:45 no cambia el resultado del día
- [ ] Hay un test con dos días de idénticas horas totales de reunión y distinta cantidad
      de bloques
- [ ] El panel muestra el conteo y el rango horario de cada bloque del día seleccionado
- [ ] Un día sin bloques lo dice explícitamente, en vez de no mostrar nada

## Restricciones de alcance

- ⚠️ **Almuerzo: pendiente de decidir.** ¿Parte la mañana de la tarde, o es tiempo
      libre? Sigue sin decidir en el spec. No implementar un default en silencio: si
      llega el momento sin decisión, el ticket se frena y se pregunta
- Sin reglas de estado del evento: `/api/events` no pide `attendees` ni `eventType`, así
  que declinado, tentativo y "Focus time" propio no se distinguen — todo evento con hora
  corta. Cambiar eso es otro ticket
- Sin agregación semanal ni mensual: un día por vez, el que está seleccionado
- Sin gráfico ni barras: texto en el panel
- Sin sugerencias de reagendado
- Sin configuración: horario laboral, colchón y umbral de 2 h son constantes declaradas
  en el módulo
- Sin dependencias nuevas

## Cómo se verifica

`node --test src/lib/focus-blocks.test.ts`, con el runner que ya trae Node — sin agregar
framework. Un test por cada criterio de aceptación de la función.

La parte visual: `npm run dev`, elegir un día con reuniones y otro vacío, y comparar el
conteo contra la grilla. Lo mira Julián.
