---
name: formato-de-ticket
description: Formato obligatorio de los tickets de este repo — cinco secciones, criterio de éxito arriba, criterios de aceptación verificables y restricciones de alcance explícitas. Y publica el que pasa: lo guarda como `tickets/NN-slug.md`, lo crea como issue de GitHub, o las dos cosas. Usar al escribir, revisar, publicar, guardar o completar un ticket, una issue o una descripción de tarea en este proyecto. Rechaza tickets incompletos en vez de completarlos por su cuenta, y no publica lo que no pasa.
---

# Formato de ticket

Esta skill vive en el repo y se commitea. **La hereda todo el que clone el
proyecto** — a diferencia de las skills personales, que se quedan en tu máquina.
Dónde vive una instrucción decide quién la hereda.

## Las cinco secciones

Todo ticket tiene exactamente estas cinco, en este orden:

```markdown
# <Título en imperativo>

**Dueño:** <nombre propio> · **Bloquea a:** <tickets, o "nada">

## Criterio de éxito
<Una frase. Qué tiene que ser cierto cuando esto está terminado.>

## Contrato
<Qué entra y qué sale. Tipos, schema, formato del archivo. Si el contrato lo
fija otro ticket, se referencia — no se redefine.>

## Criterios de aceptación
- [ ] <verificable: alguien lo corre y sale sí o no>
- [ ] <verificable>

## Restricciones de alcance
- Sin <lo que explícitamente no lleva>

## Cómo se verifica
<El comando, el eval, o el procedimiento manual. Quién lo mira.>
```

## Dos cosas que se malinterpretan

**Bloquea a:** son los tickets que **no pueden empezar** hasta que este cierre — no los
que consumen su salida. Si el contrato ya está fijado, consumir no es bloquear: se
escribe contra el tipo y se integra después. La dependencia de datos se declara en
**Contrato**, no acá.

**Reglas sin decidir (⚠️):** no son criterios de aceptación — un pendiente no se
verifica, así que dos personas nunca coinciden en si se cumplió. Van en **Restricciones
de alcance**, marcadas ⚠️, con la decisión de no resolverlas por defecto escrita: *si
llega el momento sin decisión, el ticket se frena y se pregunta.*

## Qué rechazar

Cuando revises un ticket, rechazalo —y decí exactamente qué falta— si:

1. **No tiene criterio de éxito arriba del todo.** Un ticket que empieza por la
   implementación ya decidió la solución antes de fijar el resultado.
2. **Algún criterio de aceptación no es verificable.** El test: *si dos personas
   miran el mismo resultado y no coinciden en si se cumplió, no era un criterio.*
   Sospechosos: "funciona bien", "es rápido", "mejora la experiencia", "el código
   queda limpio".
3. **No tiene restricciones de alcance.** La sección no puede estar vacía ni decir
   "ninguna". Si de verdad no se te ocurre nada, no pensaste el alcance.
4. **No dice cómo se verifica.** Si no hay forma de comprobarlo, no hay ticket.
5. **El dueño no es un nombre propio.** "El equipo" no es una respuesta.

## Cómo rechazar

Nombrá la sección que falla y por qué, y devolvé el ticket. **No lo completes vos.**
Rellenar un criterio de aceptación que el autor no escribió es inventar el contrato
del trabajo de otra persona.

Excepción única: si el autor te pide explícitamente una propuesta, escribila marcada
como **propuesta** y pedí confirmación antes de darla por buena.

## Dónde va el ticket cuando pasa

Un ticket que pasa las cinco secciones se guarda, se publica, o las dos cosas. **Uno que
no pasa, no.** Publicar un ticket incompleto es exactamente lo que esta skill existe
para frenar: en el tablero ya no lo lee su autor, lo lee alguien que va a implementarlo.
Primero el veredicto, después el destino.

Preguntá cuál de los dos querés, o los dos. Si no te dicen, guardá el archivo y no
publiques.

### A · Archivo en el repo

`tickets/<NN>-<slug>.md` — `NN` es el siguiente número libre, el slug sale del título.

- Creá `tickets/` si no existe.
- **Nunca sobrescribas.** Si el archivo ya existe, decilo y pedí un número nuevo o
  confirmación explícita para reemplazarlo.
- El archivo es el ticket tal cual, sin envoltorio: arranca en el `#` del título.

### B · Tablero — GitHub Issues

```bash
TITULO=$(sed -n '1s/^# //p' tickets/<NN>-<slug>.md)
gh issue create --title "$TITULO" --body "$(sed '1d' tickets/<NN>-<slug>.md)"
```

El `#` del título va al campo título de la issue, no al cuerpo — por eso el `sed '1d'`.
Guardá el archivo primero (opción A) aunque el destino sea el tablero: es lo que hace
reproducible la publicación.

- **Confirmá antes de crear.** Mostrá título, cuerpo y repo destino, y esperá el sí. Una
  issue la ve el equipo entero y cerrarla no des-notifica a nadie.
- **No dupliques.** `gh issue list --search "<título> in:title"` antes de crear.
- **Dueño → `--assignee`** solo si sabés el handle de GitHub de esa persona. Si no lo
  sabés, no lo adivines: queda en el cuerpo y lo decís al devolver.
- **Labels:** solo las que ya existen (`gh label list`). No crees labels nuevas.
- **Proyecto:** `--project "<nombre>"` solo si te nombran uno. No elijas tablero por tu
  cuenta.
- **Bloquea a:** publicá en el orden del spec y reemplazá los nombres por `#N` cuando la
  issue referida ya exista. Si todavía no existe, dejá el nombre — no inventes números.
- Si `gh` no está instalado o no hay sesión, decilo, dejá el archivo guardado y frená
  ahí. No busques otra vía.

Los `- [ ]` de los criterios de aceptación llegan a GitHub como checklist tildable. Es
otra razón por la que esa sección tiene que ser verificable: en el tablero se tildan de
a uno, y "funciona bien" no se tilda.

Al terminar devolvé la ruta del archivo y la URL de la issue. Nada más.

## Ejemplo bueno / ejemplo malo

**Malo:**

> ## Criterios de aceptación
> - [ ] El parser maneja bien los eventos raros

Dos personas no coinciden en "bien" ni en "raros".

**Bueno:**

> ## Criterios de aceptación
> - [ ] Un evento declinado no aparece en la salida
> - [ ] Un evento all-day marca el día completo como excluido
> - [ ] Los 20 días del eval se reproducen 20/20
