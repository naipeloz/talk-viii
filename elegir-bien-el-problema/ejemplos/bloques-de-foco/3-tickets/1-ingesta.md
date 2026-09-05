# Ingesta del `.ics` → eventos crudos

**Dueño:** Julián · **Bloquea a:** nada

## Criterio de éxito

Un archivo `.ics` versionado en el repo entra y sale un array de `Evento` normalizado,
sin títulos.

## Contrato

Entra: `datos/calendario.ics` (exportado a mano desde Google Calendar).
Sale: `Evento[]`, según el tipo fijado en [0-spec.md](0-spec.md).

Sin OAuth: el `.ics` se versiona en el repo. La autenticación no es parte de la duda.

## Criterios de aceptación

- [ ] Las recurrencias vienen expandidas a instancias individuales
- [ ] `estadoRespuesta` sale del `PARTSTAT` del asistente propio, no del organizador
- [ ] `esDiaCompleto` es `true` para eventos con `DTSTART;VALUE=DATE`
- [ ] `esFocusTime` se deduce antes de descartar el título, y el título no se guarda
- [ ] Ningún campo de la salida contiene texto libre del evento

## Restricciones de alcance

- Sin OAuth, sin llamadas a la API de Google
- Sin caché, sin persistencia
- Sin soporte multi-calendario: un `.ics`, una persona

## Cómo se verifica

`npm run ingesta -- datos/calendario.ics | head -20` y comparar a ojo contra el
calendario abierto. Lo mira Julián.
