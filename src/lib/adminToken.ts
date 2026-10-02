const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  return (
    process.env.ADMIN_JWT_SECRET ||
    process.env.ADMIN_PORTAL_PASSWORD ||
    "devam_admin_secure_signing_key_2026_x9k2p"
  );
}

function toBase64Url(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64url");
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(base64url: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64url, "base64url").toString("utf-8");
  }
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const encoder = new TextEncoder();

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a cryptographically signed, tamper-proof session token using Web Crypto HMAC-SHA256.
 * Edge runtime and Node.js compatible.
 */
export async function signAdminToken(email: string): Promise<string> {
  const secret = getSecret();
  const timestamp = Date.now().toString();
  const payloadStr = `${email.toLowerCase().trim()}:${timestamp}`;
  const payloadBase64 = toBase64Url(payloadStr);

  const key = await getHmacKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadBase64)
  );

  const signatureBase64 = bufferToBase64Url(signatureBuffer);
  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verifies token validity, cryptographic signature, and expiration.
 * Immune to timing attacks via crypto.subtle.verify.
 */
export async function verifyAdminToken(
  token: string | undefined | null
): Promise<{ valid: boolean; email?: string }> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false };
  }

  try {
    const [payloadBase64, signatureBase64] = token.split(".");
    if (!payloadBase64 || !signatureBase64) {
      return { valid: false };
    }

    const secret = getSecret();
    const key = await getHmacKey(secret);

    const sigBytes = base64UrlToUint8Array(signatureBase64);
    const dataBytes = encoder.encode(payloadBase64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer as ArrayBuffer,
      dataBytes
    );
    if (!isValid) {
      return { valid: false };
    }

    const decoded = fromBase64Url(payloadBase64);
    const [email, timestampStr] = decoded.split(":");
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp) || Date.now() - timestamp > SESSION_TTL_MS) {
      return { valid: false }; // Expired
    }

    return { valid: true, email };
  } catch (err) {
    return { valid: false };
  }
}
