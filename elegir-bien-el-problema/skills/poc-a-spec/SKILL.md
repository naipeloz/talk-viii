---
name: poc-a-spec
description: Convierte un OKR de POC en un spec ejecutable — criterio de éxito, reglas explícitas, contratos de datos, restricciones de alcance y tickets paralelizables listos para pegar en el tablero. Usar cuando ya existe un OKR completo y hay que repartir el trabajo. Pregunta explícitamente qué NO lleva; dice cuándo los paquetes no pueden correr en paralelo.
---

# Del POC al spec

Paso 3 de 3 (`elegir-problema` → `okr-de-poc` → **`poc-a-spec`**).

Acá recién aparece la tecnología. Y aparece atada: cada pieza del spec sale de una
pieza del OKR, no de tu criterio.

## Entrada

La salida de `okr-de-poc`: un OKR completo con los cuatro campos y los 20 casos. Si
falta alguno —sobre todo el umbral o el nombre propio del KR3— volvé al paso 2. Un
spec sobre un OKR incompleto es un spec que no se puede evaluar.

## El puente

Traducí mecánicamente. Este mapeo no se improvisa:

| Del OKR | Al spec |
|---|---|
| O | El criterio de éxito, arriba del todo |
| KR1 (línea base, 20 casos) | El eval |
| KR2 (métrica + umbral) | El criterio de aceptación |
| KR2 (fecha) | El alcance |
| KR3 (quién decide) | El dueño del ticket |

## Las reglas — la parte que nadie adivina

Antes de partir el trabajo, sacá a la superficie **las decisiones que un agente
tomaría solo y mal**. Preguntá por los casos borde uno por uno y escribí cada decisión
en una tabla. Los sospechosos según el dominio:

- Estados intermedios: ¿lo tentativo cuenta como sí o como no?
- Negativos: ¿lo declinado, cancelado, devuelto, anulado se ignora o resta?
- Registros que cambian la unidad de análisis (un all-day que borra el día entero).
- Casos donde el sujeto es también el objeto (el "focus time" propio no es una
  interrupción: es el resultado que se busca).
- Roles: ¿organizador e invitado se tratan igual?
- Límites declarados: horario laboral, zona horaria, moneda, redondeo.
- Márgenes: ¿hace falta un colchón entre eventos para que cuenten como continuos?

Cada una va a la tabla con su decisión tomada. Las que queden sin decidir se marcan
**⚠️ pendiente** y se nombran en las **restricciones de alcance** del ticket que la usa
—nunca entre sus criterios de aceptación, porque un pendiente no se verifica— y nunca
se resuelven por defecto en el código.

## Los contratos, antes de partir

Fijá los tipos y el schema **primero**. Es lo único que permite que los tickets corran
en paralelo: si el contrato se define dentro de un ticket, todos los demás lo esperan.

Al fijarlo, preguntá qué datos **no** se guardan. La anonimización, el descarte de
campos sensibles y las columnas que nadie va a mirar son decisiones de alcance, y se
escriben.

## Qué NO lleva — preguntalo explícitamente

Preguntá: *¿qué queda afuera?* Si no contestan, proponé una lista y pedí confirmación.
La lista por defecto para un POC:

- Sin base de datos, sin ORM, sin migraciones
- Sin frontend, sin servidor HTTP, sin autenticación
- Sin integraciones (Slack, mail, notificaciones)
- Sin Docker, sin CI
- Sin `utils/` ni `helpers/`
- Sin IA en el producto, salvo que la duda sea sobre la IA

Y escribí en una línea la forma del POC: *entra un X, sale un Y*.

## Los tickets

Partí en 3 a 5 paquetes. Cada uno con las cinco secciones (ver `formato-de-ticket`, la
skill de repo — que es además la que los guarda en `tickets/` o los publica en el
tablero, una vez que pasan). Marcá:

- **Cuál bloquea.** Si hay uno que los demás esperan, decilo. Normalmente es el
  contrato, y por eso se fija antes.
- **Cuáles corren en paralelo de verdad.** Distinguí dos cosas que se confunden:
  *bloquear el arranque* —nadie puede empezar hasta que esto cierre— y *consumir la
  salida* —se escribe contra el contrato y se integra después—. Con el contrato fijado,
  consumir no bloquea; sin él, sí. Si de verdad no pueden arrancar juntos, **decilo** en
  vez de fingir que sí: un tablero que promete paralelo y no lo es cuesta más que uno
  secuencial.
- **El eval es un ticket.** Los 20 casos del KR1 no son "testing": son el ticket que
  decide si el resto sirve.

## Qué devolvés

Markdown listo para pegar en el tablero, **un archivo por ticket**, más un spec corto
que los precede:

~~~markdown
# Spec — <nombre>

## Criterio de éxito
<del Objective. Una frase. Arriba del todo.>

## Reglas
| Regla | Decisión |
|---|---|
| … | … |

## Contratos
```ts
type … = { … }
```

## El eval
<Los casos del KR1: dónde viven, quién los verificó a mano, y qué significa
reproducirlos. Es un ticket, no "testing".>

## Restricciones de alcance
- **Fecha de corte: <la del KR2>.** Lo que no entra antes, no entra.
- Sin …

Entra un <X>, sale un <Y>.

## Tickets
| # | Ticket | Dueño | Bloquea el arranque de | Consume la salida de |
|---|---|---|---|---|
~~~

## Criterios de aceptación de esta skill

- Ningún spec sale sin la fecha de corte del KR2 ni sin la sección del eval. Las dos
  vienen del OKR: si faltan, el spec no se puede cerrar ni evaluar.
- Ningún ticket sale sin sección de restricciones de alcance.
- Ningún criterio de aceptación queda escrito como opinión: pasa el mismo test de
  medible y falsificable que en `okr-de-poc`.
- Si los paquetes no pueden correr en paralelo, lo decís.
- Si una regla quedó sin decidir, aparece marcada ⚠️ en las restricciones de alcance
  del ticket que la usa, no entre sus criterios de aceptación.
