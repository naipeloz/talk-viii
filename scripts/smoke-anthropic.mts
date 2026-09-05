/**
 * Chequeo previo a la demo: confirma que la credencial, el modelo y los
 * structured outputs andan, antes de que haya público mirando.
 *
 *   npm run check:anthropic
 *
 * Es una llamada chica y cuesta centavos. No importa `src/lib/anthropic.ts`
 * a propósito: ese módulo está detrás de `server-only` y sólo corre dentro de
 * Next. Aquí se arma un cliente propio para probar la credencial en crudo.
 */
import Anthropic from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";

const MODEL = "claude-opus-5";

const SCHEMA = {
  type: "object",
  properties: {
    ok: { type: "boolean" },
    saludo: { type: "string" },
  },
  required: ["ok", "saludo"],
  additionalProperties: false,
} as const;

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("✗ Falta ANTHROPIC_API_KEY.");
    console.error("  Copia .env.example a .env.local y carga la key.");
    process.exit(1);
  }

  const client = new Anthropic();
  const started = Date.now();

  const message = await client.messages.parse({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: "Devuelve ok=true y saludo con una frase corta en español neutro.",
      },
    ],
    output_config: { format: jsonSchemaOutputFormat(SCHEMA) },
  });

  const elapsed = Date.now() - started;

  if (message.stop_reason === "refusal") {
    console.error("✗ El modelo declinó la solicitud.");
    process.exit(1);
  }

  // `parsed_output` es null si el parseo falló: hay que chequearlo, no asumirlo.
  if (!message.parsed_output) {
    console.error("✗ La respuesta no validó contra el schema.");
    process.exit(1);
  }

  console.log("✓ Credencial válida");
  console.log(`✓ Modelo         ${message.model}`);
  console.log(`✓ Structured out ${JSON.stringify(message.parsed_output)}`);
  console.log(
    `✓ Tokens         ${message.usage.input_tokens} in / ${message.usage.output_tokens} out`,
  );
  console.log(`✓ Latencia       ${elapsed} ms`);
  console.log("\nTodo listo para la demo.");
}

main().catch((error: unknown) => {
  if (error instanceof Anthropic.AuthenticationError) {
    console.error("✗ La ANTHROPIC_API_KEY no es válida.");
  } else if (
    error instanceof Anthropic.BadRequestError &&
    error.message.includes("credit balance")
  ) {
    console.error("✗ La key es válida, pero la cuenta no tiene crédito.");
    console.error("  Carga saldo en console.anthropic.com → Plans & Billing.");
  } else if (error instanceof Anthropic.RateLimitError) {
    console.error("✗ Rate limit. Espera unos segundos y repite.");
  } else if (error instanceof Anthropic.APIConnectionError) {
    console.error("✗ No se pudo llegar a la API. ¿Hay red?");
  } else if (error instanceof Anthropic.APIError) {
    console.error(`✗ La API respondió ${error.status}: ${error.message}`);
  } else {
    console.error("✗ Error inesperado:", error);
  }
  process.exit(1);
});
