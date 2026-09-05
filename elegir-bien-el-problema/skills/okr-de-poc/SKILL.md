---
name: okr-de-poc
description: Convierte una duda escrita en un OKR de POC — objetivo, línea base, umbral falsificable, fecha de corte y quién decide — más la lista de los 20 casos del eval. Usar cuando ya hay una duda en una línea y hay que definir qué contaría como éxito o fracaso antes de construir nada. Rechaza KR que solo pueden salir bien; puede dictaminar que el POC no está listo para arrancar.
---

# El OKR del POC

Paso 2 de 3 (`elegir-problema` → **`okr-de-poc`** → `poc-a-spec`).

Un OKR de POC existe para una sola cosa: **poder perder**. Si no hay un resultado
posible que te haga cerrar el proyecto, no armaste un experimento, armaste una excusa.

## Entrada

La salida de `elegir-problema`: una duda escrita en una línea, con veredicto
**candidato**. Si te llega otra cosa, mandá al paso 1 antes de seguir.

## Reglas duras

1. **Una pregunta a la vez.** Igual que en el paso 1.
2. **Ningún campo vacío.** No avanzás al siguiente campo hasta cerrar el anterior. No
   inventes valores por el usuario: proponé opciones y pedí que elija.
3. **Podés frenar el POC.** Si no hay línea base y no hay forma de medirla en una
   tarde, decí explícitamente: *este POC no está listo para arrancar*, y qué falta.

## Los cinco campos, en orden

### 1 · Objective — "Saber si… / Saber cuánto…"

Empieza con **Saber**. Rechazá verbos de construcción: *hacer, construir, integrar,
lanzar, automatizar, implementar*. Si te proponen uno, nombralo:

> "«Construir un clasificador» no es un objetivo de POC, es el plan de trabajo. ¿Qué
> querés *saber* que hoy no sabés?"

### 2 · KR1 — la línea base

Preguntá: **¿cuál es el número de hoy?**

- Si existe → ese es el punto de partida y se escribe.
- Si no existe → proponé cómo medirlo **en una tarde**, a mano, sobre una muestra
  chica (típicamente 20 casos), y convertilo en KR1.
- Si no existe y no hay forma de medirlo en una tarde → **frená el POC**.

Sin línea base no hay umbral honesto: cualquier número posterior parece bueno.

### 3 · KR2 — métrica, umbral y fecha

- **Umbral:** ¿a partir de qué número alguien cambia lo que hace? Rechazá ideales
  redondos —95 %, 100 %, "que funcione bien"— cuando no hay línea base que los
  justifique. Si hoy se acierta el 60 %, el umbral se discute contra 60, no contra 100.
- **Fecha de corte:** obligatoria. Sin fecha el POC no termina, se disuelve.

### 4 · KR3 — quién decide

**Nombre propio.** "El equipo", "producto", "nosotros" no son respuestas. Tiene que
haber una persona que mire el número y diga qué pasa. Y el KR escribe la regla de
decisión antes de ver el resultado:

```
KR3  <Nombre> decide con el número en la mano:
     <X → hay problema · ≥Y → no lo hay.
```

### 5 · Los 20 casos

El eval. Definí **con qué forma** tiene que venir cada caso, quién los junta, y cómo
se verifican a mano. Veinte es el número por algo: alcanza para detectar un
instrumento roto y entra en una tarde.

## Los tres tests — aplicalos a cada KR

**Medible.** Si dos personas miran el mismo resultado y no coinciden en si se cumplió,
no era un KR.

**Falsificable.** Rechazá cualquier KR que solo pueda salir bien. Los sospechosos
habituales, nombralos por su nombre y pedí otro:

| KR de mentira | Por qué no sirve |
|---|---|
| "Consumimos N tokens" | Sale bien por definición apenas lo prendés |
| "El equipo lo usa" | Mide entusiasmo, no la duda |
| "Queda desplegado" | Es una tarea, no un resultado |
| "Mejora la experiencia" | Dos personas no coinciden en si se cumplió |

**Alcanzable.** Rechazá KR que dependen de algo fuera del experimento (que un tercero
conteste, que se apruebe un presupuesto) o que exigen construir el producto entero
para poder medirse.

## Un caso especial que vale reconocer

A veces el KR2 **no valida una predicción: valida el instrumento**. No hay modelo que
acierte o falle; lo difícil es que las reglas de extracción sean las correctas. Ahí
KR1 y KR2 son el mismo eval de 20 casos: primero se resuelven a mano, después el
sistema tiene que reproducirlos exactamente (20/20).

Cuando detectes que estás en este caso, decilo: el error más común en análisis no es
concluir mal, es concluir bien sobre datos mal extraídos.

Y cambiá la forma del OKR en vez de forzarla: KR2 pasa a ser el eval —*reproduce los 20
casos exactamente (20/20) al `<fecha>`*— y **el umbral de decisión se muda al KR3**, que
es donde vive el número que mata el proyecto. Si dejás el umbral en KR2 te queda un KR
que mide dos cosas distintas en el mismo renglón: si el instrumento es fiel, y si el
resultado importa.

## Qué devolvés

```markdown
## OKR

O    Saber <qué>.

KR1  Línea base: <número de hoy, o cómo se mide en una tarde>.

KR2  <métrica> alcanza <umbral> al <fecha>.

KR3  <Nombre> decide con el número en la mano:
     <regla de decisión escrita antes de mirar>.

## Umbral, decidido antes de mirar
<La regla del KR2 — o la del KR3, si el KR2 valida el instrumento.>

| Resultado | Lectura |
|---|---|
| … | … |

## Los 20 casos
- Forma de cada caso: <campos>
- Quién los junta: <nombre>
- Cómo se verifican a mano: <procedimiento>

## Tests
- Medible: <por qué pasa>
- Falsificable: <cuál es el resultado que mata el proyecto>
- Alcanzable: <por qué no depende de nada externo>
```

Cerrá indicando que el siguiente paso es `poc-a-spec`.

Y si frenaste: devolvé solo el motivo y qué haría falta. No entregues un OKR a medias
para que alguien lo complete después — así es como se cuelan los KR que no falsifican.
