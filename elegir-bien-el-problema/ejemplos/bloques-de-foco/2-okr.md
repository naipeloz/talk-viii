# 2 · El OKR

> Salida de la skill `okr-de-poc`. Entrada: [1-duda.md](1-duda.md).

```
O    Saber cuántos bloques de foco quedan por semana,
     y qué se los rompe.

KR1  Línea base: 20 días-persona medidos a mano,
     antes de construir nada.

KR2  El reporte reproduce esos 20 días exactamente (20/20)
     al 2026-09-11.   ⚠️ ajustar a la fecha real de la charla

KR3  Julián decide con el número en la mano:
     <4 bloques/semana → hay problema · ≥6 → no lo hay.
```

## El caso especial: el KR2 valida el instrumento, no una predicción

Acá no hay un modelo que acierte o falle. Lo difícil no es contar bloques: es que las
reglas sean las correctas — que un evento declinado no cuente, que un all-day no borre
el día, que el "Focus time" propio no cuente como interrupción.

Si alguna regla está mal, el número sale limpio y es mentira.

> El error más común en análisis no es concluir mal. Es concluir bien sobre datos mal
> extraídos. Por eso el eval de los 20 días es KR1 y KR2 a la vez.

## El umbral, decidido antes de mirar

| Resultado | Lectura |
|---|---|
| **≥6 bloques/semana** | No hay problema que resolver. El POC dijo que no |
| **4–5** | Zona gris. Se mira qué los rompe antes de decidir |
| **<4** | Hay algo que atacar, y el desglose dice qué |

## Los 20 casos

- **Forma de cada caso:** un día-persona. Fecha + persona anonimizada + la lista de
  eventos de ese día + los bloques libres contados a mano.
- **Quién los junta:** Julián, exportando su propio calendario a `.ics`. Con el
  calendario propio no hay problema de privacidad y el caso igual funciona: *"esta es
  mi semana; el equipo es el siguiente paso"*.
- **Cómo se verifican a mano:** se imprime el día, se tachan los eventos que cortan
  según las reglas del spec, y se anotan los huecos de ≥2 h que quedan.

## Los tests

- **Medible:** 20/20 es un número. Dos personas no pueden discrepar.
- **Falsificable:** el resultado que mata el proyecto existe y está escrito: ≥6
  bloques/semana significa que no hay problema que resolver.
- **Alcanzable:** el `.ics` ya existe, no depende de que nadie conteste nada.

## ⚠️ Correr esto antes de la charla

El resultado define la narrativa del minuto 51 y las dos versiones se cuentan distinto.

Si sale "no hay problema", el remate es: *"gasté una tarde y me ahorré un proyecto de
reagendado que iba a proponerle al equipo"* — que después de veinte minutos hablando de
KR que pueden salir mal, vale más que cualquier resultado positivo.
