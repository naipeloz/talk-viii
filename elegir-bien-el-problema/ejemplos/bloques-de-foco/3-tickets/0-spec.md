# Spec — Bloques de foco

> Salida de la skill `poc-a-spec`. Entrada: [2-okr.md](../2-okr.md).

## Criterio de éxito

> Reproduce exactamente los 20 días verificados a mano, y devuelve bloques por persona
> por semana con el desglose de qué los rompió, en una visualización interpretable en
> tres segundos.

## Las reglas

Ninguna la adivina un agente solo. Por eso están escritas acá y no en el código.

| Regla | Decisión |
|---|---|
| Evento declinado | No cuenta |
| Evento *tentative* | **Sí corta** — no puedes planificar encima |
| All-day (vacaciones, feriado) | Saca el día entero, no lo corta |
| "Focus time" propio | **No cuenta como interrupción** — es el resultado que se busca |
| Organizador vs. invitado | Igual, ambos cortan |
| Horario laboral | 9:00–18:00, declarado explícitamente |
| Almuerzo | ⚠️ **Pendiente:** ¿parte mañana de tarde, o es tiempo libre? |

**Colchón de recuperación:** un bloque exige **15 minutos de margen** después de la
reunión anterior. Decisión tomada: va con colchón. Es el tipo de regla que solo aparece
si alguien la escribe en el spec.

## Contratos

Se fijan primero — es lo que permite el paralelo.

```ts
type Evento = {
  inicio: string          // ISO
  fin: string
  esDiaCompleto: boolean
  estadoRespuesta: "aceptado" | "tentativo" | "declinado" | "sin_responder"
  esOrganizador: boolean
  esFocusTime: boolean
}

type Dia = {
  fecha: string
  persona: string         // anonimizada
  bloquesLibres: { inicio: string; fin: string; minutos: number }[]
  eventosQueCortaron: number
}
```

El schema **no guarda títulos de eventos**, a propósito. Anonimización en la ingesta.

## El eval

Los 20 días-persona del KR1, resueltos a mano **antes** de escribir código, viven en
`datos/eval-20-dias.json`. Reproducirlos 20/20 es el criterio de aceptación del ticket 4
— y lo que decide si los otros tres sirven. No es testing: es el ticket que contesta la
duda.

## Restricciones de alcance

- **Fecha de corte: 2026-09-11** (la del KR2 ⚠️, ajustar a la fecha real de la charla).
  Lo que no entra antes, no entra
- Sin base de datos, sin ORM, sin migraciones
- Sin dashboard, sin frontend, sin servidor HTTP
- Sin gráfico interactivo — la visualización es ASCII en consola
- Sin integración con Slack, sin notificaciones
- Sin sugerencias de reagendado
- Sin Docker
- **Sin IA en el producto**
- Sin `utils/` ni `helpers/`

Entra un `.ics`, sale una tabla en consola.

## Los tickets

| # | Ticket | Dueño | Bloquea el arranque de | Consume la salida de |
|---|---|---|---|---|
| 1 | [Ingesta del `.ics`](1-ingesta.md) | Julián | nada | — |
| 2 | [Schema + reglas](2-reglas.md) | Julián | nada | — |
| 3 | [Cálculo de bloques](3-bloques.md) | Julián | nada | 2 |
| 4 | [Reporte + eval](4-reporte-y-eval.md) | Julián | nada | 1, 3 |

**Los cuatro arrancan a la vez**, cada uno contra los tipos de arriba: ninguno espera a
otro para empezar. Lo que sí tiene orden es la **integración** — el 3 no corre de punta
a punta sin el clasificador del 2, y el 4 no corre sin los `Dia[]` del 3. Eso es una
cadena de datos, no un bloqueo de arranque, y solo se puede afirmar porque el schema
quedó fijado antes de partir el trabajo. Si el contrato se hubiera definido dentro del
ticket 2, los otros tres lo estarían esperando de verdad.

## La salida

```
Lun  ████░░░░████████  2 bloques
Mar  ██░░██░░██░░████  1 bloque
Mié  ████████████████  3 bloques
```

Un martes visualmente destrozado con las **mismas horas totales** que el miércoles
demuestra sin decir una palabra que la métrica obvia no responde nada.

Esta visualización va en el criterio de éxito, no como un extra.
