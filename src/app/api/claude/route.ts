import { basename } from "node:path";
import { CLAUDE_MODEL, ClaudeAgentError, askForJson } from "@/lib/claude-agent";

type Prueba = { conectado: boolean; mensaje: string };

const SCHEMA = {
  type: "object",
  properties: {
    conectado: { type: "boolean" },
    mensaje: { type: "string" },
  },
  required: ["conectado", "mensaje"],
  additionalProperties: false,
} as const;

/**
 * Prueba de vida del modelo. La frase se genera en el momento —no es un estado
 * hardcodeado— así se ve que la llamada es real.
 */
export async function GET() {
  const configDir = process.env.CLAUDE_CONFIG_DIR;
  const started = Date.now();

  try {
    const respuesta = await askForJson<Prueba>({
      prompt:
        "Confirmá en una sola frase, en español rioplatense y en menos de doce " +
        "palabras, que estás respondiendo desde una app de calendario. Devolvé " +
        "conectado=true.",
      schema: SCHEMA,
    });

    return Response.json({
      mensaje: respuesta.mensaje,
      modelo: CLAUDE_MODEL,
      via: "suscripción de claude.ai",
      cuenta: configDir ? basename(configDir) : "default de Claude Code",
      ms: Date.now() - started,
    });
  } catch (error) {
    if (error instanceof ClaudeAgentError) {
      return Response.json({ error: error.message }, { status: 502 });
    }

    console.error("[claude] prueba fallida", error);
    return Response.json(
      { error: "No se pudo hablar con Claude. ¿Está logueada la cuenta?" },
      { status: 502 },
    );
  }
}
