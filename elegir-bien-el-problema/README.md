# Elegir bien el problema

> El regalo de la charla *"Elige bien el problema y la IA hace el resto"* — IT Builders LIVE.

Cuatro skills. Tres pasos y un formato. Nada más — un repo grande contradice el punto.

## El método en una página

```
   idea suelta                duda escrita               OKR completo              tablero
       │                          │                          │                        │
       ▼                          ▼                          ▼                        ▼
 elegir-problema  ────────►  okr-de-poc  ────────►  poc-a-spec  ────────►  formato-de-ticket
   ¿hay duda?              ¿puede salir mal?         ¿qué NO lleva?         ¿está completo?
```

| Skill | Contesta | Puede decir |
|---|---|---|
| `elegir-problema` | ¿Esto es una duda o una solución disfrazada? | *todavía no* |
| `okr-de-poc` | ¿Qué resultado mata el proyecto? | *no está listo para arrancar* |
| `poc-a-spec` | ¿Qué reglas nadie escribió todavía? | *esto no corre en paralelo* |
| `formato-de-ticket` | ¿Este ticket se puede verificar? | *rechazado, falta X* |

**Las skills no responden por ti. Te interrogan.** Una que devuelve un resultado sin
haber preguntado nada se convirtió en un generador de texto y perdió la función.

**Cada una tiene que poder decir que no.** Una skill que siempre concluye que el
problema vale no es un filtro. Es un cómplice.

**Cuatro es el límite.** Si crecen, el regalo deja de ser un método y pasa a ser un
framework — justo lo que critica el acto 1.

## Instalar

Las tres primeras son **tuyas**: van a tu máquina y las tenés en cualquier repo.

```bash
mkdir -p ~/.claude/skills
cp -R skills/* ~/.claude/skills/
```

La cuarta es **del equipo**: va al repo de trabajo y se commitea.

```bash
cp -R proyecto/formato-de-ticket /ruta/al/repo/.claude/skills/
```

> Dónde vive una instrucción decide quién la hereda. Si el formato de ticket vive en tu
> máquina, es tuyo. Si vive en el repo, es del equipo.

## Usar

```
> tenemos demasiadas reuniones
```

La skill arranca sola. También podés llamarla por nombre: `/elegir-problema`.

Cada paso termina diciendo cuál es el siguiente. No saltees: `okr-de-poc` sin una duda
escrita, o `poc-a-spec` sin umbral y sin nombre propio, producen documentos que se ven
bien y no se pueden evaluar.

## El ejemplo

[`ejemplos/bloques-de-foco/`](ejemplos/bloques-de-foco/) tiene un caso real pasado por
los tres pasos, tal cual salió:

1. [La duda](ejemplos/bloques-de-foco/1-duda.md) — *¿cuántos bloques de dos horas sin
   interrupciones quedan por semana, y qué se los rompe?*
2. [El OKR](ejemplos/bloques-de-foco/2-okr.md) — con el umbral decidido **antes** de
   mirar el resultado.
3. [El spec y los cuatro tickets](ejemplos/bloques-de-foco/3-tickets/) — con las siete
   reglas que ningún agente adivina solo.

Un solo problema atravesando charla, skills, repo y tablero.
