# Cálculo de bloques continuos

**Dueño:** Julián · **Bloquea a:** nada

## Criterio de éxito

Dado un día y sus eventos ya clasificados, devuelve los bloques libres de ≥2 h dentro
del horario laboral, respetando el colchón de recuperación.

## Contrato

Entra: `fecha`, `Evento[]` y el veredicto de cada uno (ticket 2).
Sale: `Dia`, según el tipo fijado en [0-spec.md](0-spec.md).

## Criterios de aceptación

- [ ] Un bloque exige **15 minutos de margen** después del evento anterior: una reunión
      que termina 14:00 abre bloque a las 14:15, no a las 14:00
- [ ] Un hueco de 1 h 59 min no cuenta como bloque
- [ ] Un día marcado `borra_el_dia` devuelve cero bloques y no cuenta como día medido
- [ ] `eventosQueCortaron` cuenta solo los que efectivamente partieron un hueco de ≥2 h
- [ ] Dos días con las mismas horas totales de reunión pueden dar distinta cantidad de
      bloques — hay un test que lo demuestra

## Restricciones de alcance

- Sin agregación semanal (eso es el ticket 4)
- Sin zona horaria configurable: la del calendario
- Sin bloques que crucen el mediodía si la regla del almuerzo termina cortando ⚠️

## Cómo se verifica

Tests unitarios sobre días construidos a mano, incluido el par de días con idénticas
horas totales y distinto conteo de bloques.
