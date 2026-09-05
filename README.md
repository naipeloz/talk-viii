# talk-viii

Calendario a pantalla completa (Next.js 16 + Tailwind v4) que muestra los eventos de un
calendario de Google, con un panel lateral colapsable para el detalle del día.

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completá las credenciales (ver abajo)
npm run dev
```

## Conectar el calendario de Google

La app lee los eventos con la **Google Calendar API v3** desde un route handler
(`/api/events`), así las credenciales nunca llegan al browser. Hay dos rutas de
autenticación; alcanza con configurar una.

### A) Calendario privado — service account (recomendado)

1. En [Google Cloud Console](https://console.cloud.google.com/) creá (o elegí) un proyecto
   y habilitá la **Google Calendar API**.
2. Creá una **service account** y generá una key JSON.
3. En Google Calendar → *Configuración del calendario* → **Compartir con determinadas
   personas** → agregá el `client_email` de la service account con permiso
   **"Ver todos los detalles del evento"**.
4. Configurá las variables:

   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email del JSON>
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=<private_key del JSON, con los \n literales>
   ```

No requiere que el calendario sea público ni que el visitante se loguee.

### B) Calendario público — API key

1. Hacé el calendario público (*Configuración del calendario* → **Permisos de acceso** →
   "Hacer disponible al público").
2. Creá una **API key** en Google Cloud, restringida a la Calendar API.
3. Configurá `GOOGLE_CALENDAR_API_KEY=<tu key>`.

Más simple, pero expone el calendario a cualquiera que tenga el ID.

### Variables

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `GOOGLE_CALENDAR_ID` | No | ID del calendario. Por defecto usa el del proyecto. |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Ruta A | `client_email` del JSON de la service account. |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Ruta A | `private_key` del JSON. |
| `GOOGLE_CALENDAR_API_KEY` | Ruta B | API key restringida a Calendar API. |

En Vercel, cargalas en *Project Settings → Environment Variables* para
Production, Preview y Development.

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
