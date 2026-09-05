# Reporte + eval de los 20 días

**Dueño:** Julián · **Bloquea a:** nada (pero es el que decide si el resto sirve)

## Criterio de éxito

El reporte reproduce **20/20** los días verificados a mano, e imprime bloques por
persona por semana con el desglose de qué los rompió, legible en tres segundos.

## Contrato

Entra: `Dia[]`.
Sale: tabla ASCII en consola + un `20/20` (o el detalle de cuáles fallaron).

```
Lun  ████░░░░████████  2 bloques
Mar  ██░░██░░██░░████  1 bloque
Mié  ████████████████  3 bloques
```

## Criterios de aceptación

- [ ] Los 20 días-persona verificados a mano se reproducen exactamente: 20/20
- [ ] Cuando un día no coincide, el reporte dice **cuál** y **qué evento** explica la
      diferencia — no solo que falló
- [ ] La salida muestra, además del conteo, qué rompió los bloques
- [ ] Un martes destrozado y un miércoles limpio con las mismas horas totales se ven
      distintos a simple vista

## Restricciones de alcance

- Sin gráfico interactivo, sin HTML, sin export a nada
- Sin colores que dependan de la terminal
- Sin comparación entre personas

## Cómo se verifica

`npm run reporte` contra `datos/eval-20-dias.json`. Lo mira Julián, y con ese número en
la mano aplica la regla del KR3: <4 bloques/semana → hay problema · ≥6 → no lo hay.
