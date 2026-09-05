# Sugerir qué reuniones agrupar o cancelar para abrir bloques de dos horas

**Dueño:** Julián · **Bloquea a:** nada

## Criterio de éxito

Para una semana del calendario, la app propone un puñado de movimientos concretos
—agrupar estas dos, cancelar aquella— y dice **cuántos minutos de bloque libera cada
uno**, con el número calculado por el código y no por el modelo.

## Contrato

Nuevo route handler `GET /api/suggestions?week=YYYY-MM-DD` (lunes ISO), server-side por
la misma razón que `/api/events`: la credencial nunca llega al browser. Sale:

```ts
export type Sugerencia = {
  tipo: "agrupar" | "cancelar";
  eventos: string[];         // ids de CalendarEvent, siempre ≥ 1
  motivo: string;            // una frase, del modelo
  minutosLiberados: number;  // lo calcula el código, no el modelo
};
```

La llamada vive en `src/lib/suggestions.ts`, con `import "server-only"`:

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();          // lee ANTHROPIC_API_KEY del entorno

const message = await client.messages.parse({
  model: "claude-opus-5",
  max_tokens: 16000,
  thinking: { type: "adaptive" },
  system: SYSTEM,                        // las reglas de qué se puede tocar
  messages: [{ role: "user", content: semanaSerializada }],
  output_config: { format: SUGERENCIAS_SCHEMA },
});
```

Una sola llamada por semana. Sin streaming: la salida son unas pocas líneas. Sin tool
use y sin agente — el modelo no necesita explorar nada, recibe la semana entera de una.

**El modelo propone, el código verifica.** El modelo devuelve `{tipo, eventos, motivo}`
y nada más. `minutosLiberados` sale de correr `bloquesDelDia` (ticket #5) sobre el día
afectado sin esos eventos y restar contra el original. Es lo que hace que el criterio de
aceptación sea verificable: la aritmética no la puede inventar.

**Este ticket vuelve a extender el contrato.** `CalendarEvent` no guarda `description`, y
`fetchCalendarEvents` ni siquiera la pide: el `fields` de `src/lib/google-calendar.ts:185`
lista `summary,location,htmlLink,colorId,start,end`. Se agrega `description` a las dos
puntas. Ver la restricción de privacidad, porque este cambio la toca de frente.

**Consume la salida del ticket #5** (`bloquesDelDia`), que todavía no está implementado.
Se escribe contra el tipo `Bloque` ya fijado; la verificación de punta a punta espera a
que #5 cierre.

**Fallback de refusal:** `betas: ["server-side-fallback-2026-07-01"]` + `fallbacks:
"default"`. Si resulta incompatible con `messages.parse()`, gana structured outputs: que
la respuesta tenga forma importa más que rescatar una negativa que en este dominio no se
espera.

## Criterios de aceptación

- [ ] Toda sugerencia referencia sólo ids presentes en la semana enviada; una que trae un
      id inexistente se descarta y queda en el log del server
- [ ] `minutosLiberados` sale de `bloquesDelDia`, no del modelo: hay un test que le pasa
      una respuesta fija y compara el número contra el cálculo
- [ ] Una sugerencia que no abre ningún bloque de ≥2 h no se muestra
- [ ] Ninguna sugerencia propone tocar un evento all-day
- [ ] Una semana sin reuniones devuelve lista vacía **sin llamar a la API**
- [ ] Un 429, un 500 o un timeout devuelven 200 con lista vacía y un motivo legible: el
      calendario sigue funcionando
- [ ] El cliente de Anthropic se instancia en un único módulo con `import "server-only"`;
      importarlo desde un componente cliente rompe el build, y eso es el test
- [ ] `npm run build` pasa sin `ANTHROPIC_API_KEY` definida — la falta de credencial es
      un caso de runtime, no de build

## Restricciones de alcance

- ⚠️ **Privacidad: pendiente de decidir.** Este ticket manda títulos y descripciones de
      reuniones reales a una API externa. El spec de bloques de foco decidió lo
      contrario —*el schema no guarda títulos de eventos, a propósito*— y acá anonimizar
      no sirve: el texto **es** el insumo. No implementar hasta que Julián decida si el
      calendario que se demuestra puede salir del repo
- ⚠️ **El insumo puede no existir.** Si el calendario está compartido como free/busy,
      Google no devuelve `summary` ni `description` y todos los eventos llegan como
      "Ocupado" (ver `src/lib/google-calendar.ts:120`). Verificar contra el calendario
      real **antes** de escribir código: sin texto no hay nada que analizar
- Sin escribir en el calendario: la app sugiere, no reagenda ni cancela
- Sin memoria entre semanas ni aprendizaje de sugerencias pasadas
- Sin streaming, sin tool use, sin agente: una llamada, una respuesta
- Sin caché de respuestas
- Sin IA en el conteo de bloques — los minutos los cuenta el código del ticket #5
- Sin fallback a otro proveedor

## Cómo se verifica

`node --test src/lib/suggestions.test.ts` con la respuesta del modelo fijada en un
fixture, sin pegarle a la API: cubre el descarte de ids inexistentes, el recálculo de
minutos, el filtro de <2 h y los tres modos de error.

Una corrida real: `npm run dev`, elegir una semana con reuniones y comprobar a mano que
las tres primeras sugerencias son ejecutables — que los eventos existen, que agrupar esas
dos es posible, y que el bloque prometido efectivamente aparece. Lo mira Julián.
