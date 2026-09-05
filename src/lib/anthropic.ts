import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/** El modelo que usa la app. Un solo lugar para cambiarlo. */
export const ANTHROPIC_MODEL = "claude-opus-5";

export class AnthropicConfigError extends Error {}

let client: Anthropic | null = null;

/**
 * El cliente de Anthropic, instanciado una sola vez. Vive detrás de
 * `server-only`: importarlo desde un componente cliente rompe el build, así la
 * credencial no puede terminar en el bundle del browser.
 */
export function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AnthropicConfigError(
      "Falta ANTHROPIC_API_KEY: cárgala en .env.local (ver .env.example).",
    );
  }
  client ??= new Anthropic();
  return client;
}

/**
 * Traduce un error del SDK a una frase mostrable. De más específico a más
 * general: un `catch` único perdería la diferencia entre lo que se reintenta
 * (429, 5xx, red) y lo que no (400, credencial inválida).
 */
export function describeAnthropicError(error: unknown): string {
  if (error instanceof AnthropicConfigError) return error.message;
  if (error instanceof Anthropic.AuthenticationError) {
    return "La ANTHROPIC_API_KEY no es válida.";
  }
  if (error instanceof Anthropic.RateLimitError) {
    return "Anthropic devolvió rate limit; prueba de nuevo en unos segundos.";
  }
  if (error instanceof Anthropic.BadRequestError) {
    // El saldo agotado llega como 400, no como error de credencial: sin este
    // caso aparte se lee como un bug del pedido cuando es de facturación.
    if (error.message.includes("credit balance")) {
      return "La cuenta de Anthropic no tiene crédito. Carga saldo en Plans & Billing.";
    }
    return `Pedido inválido: ${error.message}`;
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return "No se pudo llegar a la API de Anthropic.";
  }
  if (error instanceof Anthropic.APIError) {
    return `La API respondió ${error.status}: ${error.message}`;
  }
  return "Error inesperado llamando a Anthropic.";
}
