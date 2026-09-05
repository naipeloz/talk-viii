# Schema + reglas de qué corta un bloque

**Dueño:** Julián · **Bloquea a:** nada

> **Este es el ticket que se lee en voz alta en la demo.** Las siete reglas viven aquí.

## Criterio de éxito

Dado un `Evento`, la función dice si corta el día, si borra el día entero, o si se
ignora — según las reglas escritas, no según el criterio de quien lo implemente.

## Contrato

Entra: `Evento`. Sale: `"corta" | "borra_el_dia" | "se_ignora"`.

## Criterios de aceptación

- [ ] Declinado → `se_ignora`
- [ ] Tentativo → `corta` (no se puede planificar encima)
- [ ] All-day → `borra_el_dia` (no corta: saca el día entero del cálculo)
- [ ] "Focus time" propio → `se_ignora` (es el resultado que se busca, no la interrupción)
- [ ] Organizador e invitado dan el mismo resultado con el mismo evento
- [ ] Un evento fuera de 9:00–18:00 no afecta el día

## Restricciones de alcance

- ⚠️ **Almuerzo: pendiente de decidir.** No implementar un default en silencio — si
  llega el momento sin decisión, el ticket se frena y se pregunta
- Sin configuración: el horario laboral y el colchón son constantes declaradas
- Sin heurísticas sobre el título — el título no llega hasta aquí
- Sin excepciones por persona

## Cómo se verifica

Un test por fila decidida de la tabla de reglas del spec: seis reglas, seis tests. El
almuerzo queda como `todo` hasta que alguien lo decida — no como un test que pasa.
