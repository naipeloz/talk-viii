# talk-viii

Calendario a pantalla completa (Next.js 16 + Tailwind v4) que muestra los eventos de un
calendario de Google, con un panel lateral colapsable para el detalle del día.

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completa las credenciales (ver abajo)
npm run dev
```

## Conectar el calendario de Google

La app lee los eventos con la **Google Calendar API v3** desde un route handler
(`/api/events`), así las credenciales nunca llegan al browser. Hay dos rutas de
autenticación; basta con configurar una.

### A) Calendario privado — service account (recomendado)

1. En [Google Cloud Console](https://console.cloud.google.com/) crea (o elige) un proyecto
   y habilita la **Google Calendar API**.
2. Crea una **service account** y genera una key JSON.
3. En Google Calendar → *Configuración del calendario* → **Compartir con determinadas
   personas** → agrega el `client_email` de la service account con permiso
   **"Ver todos los detalles del evento"**.
4. Configura las variables:

   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email del JSON>
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=<private_key del JSON, con los \n literales>
   ```

No requiere que el calendario sea público ni que el visitante se loguee.

### B) Calendario público — API key

1. Haz el calendario público (*Configuración del calendario* → **Permisos de acceso** →
   "Hacer disponible al público").
2. Crea una **API key** en Google Cloud, restringida a la Calendar API.
3. Configura `GOOGLE_CALENDAR_API_KEY=<tu key>`.

Más simple, pero expone el calendario a cualquiera que tenga el ID.

### Variables

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `GOOGLE_CALENDAR_ID` | No | ID del calendario. Por defecto usa el del proyecto. |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Ruta A | `client_email` del JSON de la service account. |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Ruta A | `private_key` del JSON. |
| `GOOGLE_CALENDAR_API_KEY` | Ruta B | API key restringida a Calendar API. |
| `CLAUDE_CONFIG_DIR` | Camino A | Config dir del login de Claude Code que paga (ver *El modelo*). |
| `ANTHROPIC_API_KEY` | Camino B | Key de la Anthropic API. |

En Vercel, cargalas en *Project Settings → Environment Variables* para
Production, Preview y Development.

## El modelo

Hay **dos caminos** para llamar al modelo, y sólo hace falta uno. Los dos corren en el
servidor: la credencial nunca llega al browser.

| | A · Suscripción | B · API key |
|---|---|---|
| Paquete | `@anthropic-ai/claude-agent-sdk` | `@anthropic-ai/sdk` |
| Módulo | `src/lib/claude-agent.ts` | `src/lib/anthropic.ts` |
| Paga con | tu plan de claude.ai (Pro/Max) | créditos de la API |
| Corre en | **sólo local** | cualquier lado, Vercel incluido |
| Verificar | `npm run check:agent` | `npm run check:anthropic` |

### A · Con la suscripción de claude.ai

El Agent SDK delega en el binario de Claude Code, así que usa el login que ya tienes en
la máquina en vez de créditos. Necesita ese binario presente — por eso no funciona en
Vercel.

Eliges **cuál** login con `CLAUDE_CONFIG_DIR` en `.env.local`. Si tienes varias cuentas
(por ejemplo un `~/.claude` de trabajo y un `~/.claude-personal` con el plan personal),
apunta a la que quieras que pague:

```
CLAUDE_CONFIG_DIR=/Users/tu-usuario/.claude-personal
```

`askForJson()` en `src/lib/claude-agent.ts` es la única puerta: recibe un prompt y un
JSON Schema, y devuelve la respuesta ya parseada. Va sin herramientas y con un solo
turno — es una pregunta, no un agente. Y **borra `ANTHROPIC_API_KEY` del entorno del
subproceso**: si está seteada, Claude Code la prefiere y terminas pagando créditos sin
enterarte.

### B · Con una API key

`src/lib/anthropic.ts` expone el cliente detrás de `server-only` —importarlo desde un
componente cliente **rompe el build**, que es la garantía de que la key no entra al
bundle—, más `ANTHROPIC_MODEL` y `describeAnthropicError`, que traduce los errores del
SDK de más específico a más general.

Para pedirle JSON al modelo, `client.messages.parse()` con `jsonSchemaOutputFormat`, el
helper que ya trae el SDK: no hace falta sumar `zod`. Ten en cuenta que `parsed_output` es `null`
si el parseo falla.

### La box del panel

Debajo del detalle del día hay una box **Claude** con un botón *Probar conexión*. Pega
contra `GET /api/claude`, que le pide al modelo una frase **generada en el momento** —no
un estado hardcodeado— y muestra modelo, vía, cuenta y latencia. Sirve para ver de un
vistazo, en vivo, que la app le habla al modelo con tu suscripción.

La respuesta tarda unos **5–6 segundos**: casi todo es el arranque del subproceso de
Claude Code. El botón queda en *Preguntándole a Claude…* mientras tanto.

Los dos comandos de chequeo hacen una llamada chica y confirman de punta a punta que la
credencial sirve, que el modelo responde y que los structured outputs validan. Ejecútalos
**antes** de necesitarlos, no en el medio de una demo.
## Cómo funciona

- `src/lib/google-calendar.ts` — trae los eventos del rango visible
  (`singleEvents=true`, así Google ya expande las recurrencias), los normaliza a la zona
  horaria del calendario y parte los eventos multi-día en una entrada por día.
- `src/lib/google-auth.ts` — firma el JWT de la service account con `node:crypto` y
  cachea el access token. Sin dependencias de Google.
- `src/app/api/events/route.ts` — `GET /api/events?month=YYYY-MM`. Respuestas cacheadas
  5 minutos.
- `src/components/calendar-workspace.tsx` — estado del mes/día y fetch por mes.

## Deploy

Conectado a Vercel: push a `main` → producción, cualquier otra rama → preview.
