import "server-only";
import { createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

let cached: { token: string; expiresAt: number } | null = null;

function base64url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Private keys pasted into env vars usually arrive with literal `\n` sequences
 * instead of real newlines, and sometimes wrapped in quotes.
 */
function normalizePrivateKey(key: string) {
  return key.trim().replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");
}

function signedAssertion(clientEmail: string, privateKey: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: issuedAt,
      exp: issuedAt + 3600,
    }),
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = base64url(signer.sign(privateKey));

  return `${header}.${claims}.${signature}`;
}

/**
 * Exchanges a service-account JWT for a read-only Calendar access token,
 * reusing it until shortly before it expires.
 */
export async function getServiceAccountToken(clientEmail: string, privateKey: string) {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedAssertion(clientEmail, normalizePrivateKey(privateKey)),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`No se pudo obtener el token de Google (${response.status}): ${detail}`);
  }

  const payload: { access_token: string; expires_in: number } = await response.json();
  cached = {
    token: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  };

  return cached.token;
}
