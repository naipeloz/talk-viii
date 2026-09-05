---
name: formato-de-ticket
description: Formato obligatorio de los tickets de este repo — cinco secciones, criterio de éxito arriba, criterios de aceptación verificables y restricciones de alcance explícitas. Usar al escribir, revisar o completar un ticket, una issue o una descripción de tarea en este proyecto. Rechaza tickets incompletos en vez de completarlos por su cuenta.
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
