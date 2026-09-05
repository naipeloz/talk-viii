/**
 * Chequeo del camino "suscripción Max": usa el Agent SDK, que delega en el
 * binario de Claude Code y por lo tanto en la credencial de claude.ai —
 * no en créditos de la API.
 *
 *   npm run check:agent
 *
 * Requiere que el proyecto corra local: el binario de Claude Code tiene que
 * estar en la máquina. No funciona en Vercel.
 */
import { query } from "@anthropic-ai/claude-agent-sdk";

// Cuál login de Claude Code usar. Si no está seteada, Claude Code usa su
// default (~/.claude). Se configura en .env.local, no en el código.
const CONFIG_DIR = process.env.CLAUDE_CONFIG_DIR;

// Si ANTHROPIC_API_KEY está seteada, el subproceso la prefiere y factura
// créditos en vez de usar el plan. Para este camino la sacamos del entorno.
const entorno = { ...process.env };
delete entorno.ANTHROPIC_API_KEY;

const SCHEMA = {
  type: "object",
  properties: {
    ok: { type: "boolean" },
    saludo: { type: "string" },
  },
  required: ["ok", "saludo"],
  additionalProperties: false,
} as const;

const started = Date.now();

for await (const message of query({
  prompt: "Devolvé ok=true y saludo con una frase corta en español rioplatense.",
  options: {
    model: "claude-opus-5",
    outputFormat: { type: "json_schema", schema: SCHEMA },
    allowedTools: [],        // sin herramientas: queremos una respuesta, no un agente
    maxTurns: 1,
    settingSources: [],      // ignorar los settings del repo
    env: CONFIG_DIR ? { ...entorno, CLAUDE_CONFIG_DIR: CONFIG_DIR } : entorno,
  },
})) {
  if (message.type !== "result") continue;

  if (message.subtype !== "success") {
    console.error(`✗ La consulta falló: ${message.subtype}`);
    process.exit(1);
  }

  console.log("✓ Credencial     suscripción de claude.ai (no créditos de API)");
  console.log(`✓ Config dir     ${CONFIG_DIR ?? "(default de Claude Code)"}`);
  console.log(`✓ Structured out ${JSON.stringify(message.structured_output)}`);
  console.log(`✓ Turnos         ${message.num_turns}`);
  console.log(`✓ Latencia       ${Date.now() - started} ms`);
  console.log("\nTodo listo para la demo, sin gastar créditos.");
  process.exit(0);
}

console.error("✗ La consulta terminó sin devolver un resultado.");
process.exit(1);
