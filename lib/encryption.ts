/**
 * Client-side RSA-OAEP (SHA-256) encryption for sensitive PII (Aadhar, PAN)
 * before transmission. Mirrors the server-side contract defined in
 * server/services/rsa-key.service.ts:
 *
 *   - 2048-bit RSA, OAEP padding, SHA-256 hash
 *   - Public key delivered as PEM (SPKI)
 *   - Ciphertext is base64-encoded on the wire
 */

function stripPemHeaders(pem: string): string {
  return pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function importPublicKey(pem: string): Promise<CryptoKey> {
  const raw = stripPemHeaders(pem);
  const der = base64ToUint8Array(raw);
  return crypto.subtle.importKey(
    "spki",
    // ArrayBuffer view copy — importKey needs BufferSource
    der.buffer.slice(der.byteOffset, der.byteOffset + der.byteLength) as ArrayBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
}

/**
 * Encrypts `plaintext` using the given PEM-formatted RSA public key, returning
 * a base64-encoded ciphertext ready to send to the server.
 */
export async function encryptWithPublicKey(
  pem: string,
  plaintext: string,
): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("SubtleCrypto unavailable — encryption requires a secure context (HTTPS).");
  }
  const key = await importPublicKey(pem);
  const data = new TextEncoder().encode(plaintext);
  const cipher = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, data);
  return uint8ArrayToBase64(new Uint8Array(cipher));
}
