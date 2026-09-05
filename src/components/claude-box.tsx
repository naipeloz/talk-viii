"use client";

import { useState } from "react";

type Resultado = {
  mensaje: string;
  modelo: string;
  via: string;
  cuenta: string;
  ms: number;
};

type Estado =
  | { fase: "listo" }
  | { fase: "probando" }
  | { fase: "ok"; resultado: Resultado }
  | { fase: "error"; mensaje: string };

export function ClaudeBox() {
  const [estado, setEstado] = useState<Estado>({ fase: "listo" });

  const probar = async () => {
    setEstado({ fase: "probando" });
    try {
      const response = await fetch("/api/claude");
      const payload = await response.json();

      if (!response.ok) {
        setEstado({ fase: "error", mensaje: payload.error ?? "Falló la prueba." });
        return;
      }
      setEstado({ fase: "ok", resultado: payload });
    } catch (error) {
      setEstado({
        fase: "error",
        mensaje: error instanceof Error ? error.message : "Falló la prueba.",
      });
    }
  };

  const puntoColor =
    estado.fase === "ok"
      ? "bg-emerald-500"
      : estado.fase === "error"
        ? "bg-rose-500"
        : estado.fase === "probando"
          ? "bg-amber-400 animate-pulse"
          : "bg-black/25 dark:bg-white/30";

  return (
    <section className="shrink-0 border-t border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${puntoColor}`} />
        <h3 className="text-sm font-semibold">Claude</h3>
        <span className="ml-auto text-xs opacity-60">suscripción, no API</span>
      </div>

      <p className="mt-2 text-sm opacity-60">
        La llamada sale del servidor y usa tu login de Claude Code. No consume créditos
        de la API.
      </p>

      <button
        type="button"
        onClick={probar}
        disabled={estado.fase === "probando"}
        className="mt-3 w-full rounded-lg border border-black/15 px-3 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
      >
        {estado.fase === "probando" ? "Preguntándole a Claude…" : "Probar conexión"}
      </button>

      {estado.fase === "ok" && (
        <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="text-sm font-medium">“{estado.resultado.mensaje}”</p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs opacity-70">
            <dt>modelo</dt>
            <dd className="truncate">{estado.resultado.modelo}</dd>
            <dt>vía</dt>
            <dd className="truncate">{estado.resultado.via}</dd>
            <dt>cuenta</dt>
            <dd className="truncate">{estado.resultado.cuenta}</dd>
            <dt>latencia</dt>
            <dd>{estado.resultado.ms} ms</dd>
          </dl>
        </div>
      )}

      {estado.fase === "error" && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm"
        >
          {estado.mensaje}
        </p>
      )}
    </section>
  );
}
