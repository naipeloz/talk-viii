import "server-only";
import { query } from "@anthropic-ai/claude-agent-sdk";

/**
 * Camino "suscripción": delega en el binario de Claude Code, así la app usa la
 * credencial de claude.ai (Pro/Max) en vez de créditos de la API.
 *
 * Sólo funciona con el proyecto corriendo local — en Vercel no hay binario de
 * Claude Code. Para deploy, ver `anthropic.ts`, que habla con la API.
 */

export const CLAUDE_MODEL = "claude-opus-5";

export class ClaudeAgentError extends Error {}

/**
 * Le pide al modelo una respuesta que valide contra `schema` y la devuelve
 * parseada. Sin herramientas y con un solo turno: es una pregunta, no un agente.
 */
export async function askForJson<T>({
  prompt,
  schema,
  systemPrompt,
}: {
  prompt: string;
  schema: Record<string, unknown>;
  systemPrompt?: string;
}): Promise<T> {
  // Con ANTHROPIC_API_KEY seteada el subproceso la prefiere y factura créditos.
  // Este camino existe justamente para no hacer eso.
  const entorno = { ...process.env };
  delete entorno.ANTHROPIC_API_KEY;
  const configDir = process.env.CLAUDE_CONFIG_DIR;

  for await (const message of query({
    prompt,
    options: {
      model: CLAUDE_MODEL,
      outputFormat: { type: "json_schema", schema },
      systemPrompt,
      allowedTools: [],
      maxTurns: 1,
      settingSources: [],
      env: configDir ? { ...entorno, CLAUDE_CONFIG_DIR: configDir } : entorno,
    },
  })) {
    if (message.type !== "result") continue;

    if (message.subtype !== "success") {
      throw new ClaudeAgentError(`La consulta falló: ${message.subtype}`);
    }
    if (message.structured_output === undefined) {
      throw new ClaudeAgentError("La respuesta no validó contra el schema.");
    }
    return message.structured_output as T;
  }

  throw new ClaudeAgentError("La consulta terminó sin devolver un resultado.");
}
