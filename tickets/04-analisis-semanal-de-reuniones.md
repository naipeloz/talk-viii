# Analizar la semana y sugerir qué reuniones agrupar o cancelar

**Dueño:** Julián · **Bloquea a:** nada

## Criterio de éxito

Desde cualquier día de la semana, un botón devuelve un puñado de movimientos concretos
—agrupar estas dos, cancelar aquella— cada uno con el motivo sacado de la descripción de
los eventos y con **cuántos minutos de bloque libera**, calculado por el código.

## Contrato

Nuevo route handler `GET /api/semana/analisis?week=YYYY-MM-DD` (lunes ISO). Server-side
por la misma razón que `/api/events`: la credencial nunca llega al browser. Sale:

```ts
export type Sugerencia = {
  tipo: "agrupar" | "cancelar";
  eventos: string[];         // ids de CalendarEvent: ≥2 si agrupar, exactamente 1 si cancelar
  motivo: string;            // una frase, del modelo, apoyada en las descripciones
  minutosLiberados: number;  // lo calcula el código, no el modelo
};
```

La llamada usa `askForJson()` de `src/lib/claude-agent.ts`, que ya existe y ya está
probado: va por la suscripción de claude.ai, sin herramientas y con un solo turno. El
modelo recibe la semana entera en un prompt —título, horario y **descripción** de cada
evento— y devuelve solo `{tipo, eventos, motivo}`.

**El modelo propone, el código verifica.** `minutosLiberados` sale de correr
`resumenDeLaSemana` (ticket 03) sobre la semana sin esos eventos y restar contra el
original. Es lo que hace verificable el criterio de aceptación: la aritmética no se
puede inventar.

**Este ticket extiende el contrato existente.** `description` no llega hoy: el `fields`
de `src/lib/google-calendar.ts:185` pide `summary,location,htmlLink,colorId,start,end` y
`CalendarEvent` no la guarda. Se agrega a las dos puntas. Verificado contra el calendario
real: `accessRole: reader` y **125 de 125 eventos traen `description`**, así que el
insumo existe.

**Consume la salida del ticket 03** (`resumenDeLaSemana`). Se escribe contra el tipo
`ResumenSemana` ya fijado aquí arriba; la verificación de punta a punta espera a que 03
cierre.

**Disparo desde cualquier día.** El botón vive en el panel del día. Toma el `selected`,
deriva el lunes de esa semana y pide ese `?week=`. Lunes y viernes de la misma semana
tienen que producir el mismo resultado.

## Criterios de aceptación

- [ ] Toda sugerencia referencia sólo ids presentes en la semana enviada; una que trae un
      id inexistente se descarta y queda registrada en el log del server
- [ ] Una sugerencia `agrupar` referencia 2 o más eventos; una `cancelar`, exactamente 1
- [ ] `minutosLiberados` sale de `resumenDeLaSemana`, no del modelo: hay un test que le
      pasa una respuesta fija y compara el número contra el cálculo
- [ ] Una sugerencia que no abre ningún bloque de ≥2 h no se muestra
- [ ] Ninguna sugerencia propone tocar un evento all-day
- [ ] Seleccionar el lunes o el viernes de la misma semana devuelve el mismo resultado
- [ ] Una semana sin reuniones devuelve lista vacía **sin llamar al modelo**
- [ ] Un error del modelo devuelve 200 con lista vacía y un motivo legible: el calendario
      sigue funcionando
- [ ] El cliente de Claude se usa sólo desde `src/lib/claude-agent.ts`, que importa
      `server-only`; importarlo desde un componente cliente rompe el build, y eso es el test
- [ ] Mientras la consulta corre, el botón queda deshabilitado y dice que está analizando
      — la llamada tarda unos 5 segundos

## Restricciones de alcance

- **Sólo local.** El Agent SDK necesita el binario de Claude Code y el login de la
  máquina. En Vercel esta ruta devuelve error, igual que `/api/claude`
- **Las descripciones de las reuniones salen hacia el modelo.** Es deliberado: son el
  insumo del análisis y anonimizar las vaciaría de sentido. Va por la suscripción
  personal y en local
- Sin escribir en el calendario: la app sugiere, no reagenda ni cancela
- Sin memoria entre semanas ni aprendizaje de sugerencias pasadas
- Sin streaming, sin tool use, sin agente: una llamada, una respuesta
- Sin caché de respuestas
- Sin IA en el conteo de bloques — los minutos los cuenta el código del ticket 03
- Sin fallback a otro proveedor

## Cómo se verifica

`node --test src/lib/analisis-semana.test.ts` con la respuesta del modelo fijada en un
fixture, sin llamar al modelo: cubre el descarte de ids inexistentes, el recálculo de
minutos, el filtro de <2 h, la forma de cada tipo y los modos de error.

Una corrida real: `npm run dev`, elegir una semana con reuniones, apretar el botón desde
dos días distintos y comprobar que dan lo mismo, y que las tres primeras sugerencias son
ejecutables — que los eventos existen y que agrupar esas dos es posible. Lo mira Julián.
