// Aláírt, hamisíthatatlan admin session token (HMAC-SHA256, Web Crypto API)
// Edge-kompatibilis: nincs benne Node-specifikus API, így a middleware.ts is tudja használni.

export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 nap

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET environment variable is not set');
  }
  return secret;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToString(value: string): string | null {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/');
    return atob(padded);
  } catch {
    return null;
  }
}

async function hmacSign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return bufferToBase64Url(signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createAdminSessionToken(email: string): Promise<string> {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${email}:${expiresAt}`;
  const payloadEncoded = bufferToBase64Url(new TextEncoder().encode(payload).buffer);
  const signature = await hmacSign(payload);
  return `${payloadEncoded}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;

  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) return false;

  const payload = base64UrlToString(payloadEncoded);
  if (!payload) return false;

  let expectedSignature: string;
  try {
    expectedSignature = await hmacSign(payload);
  } catch {
    return false;
  }

  if (!timingSafeEqual(expectedSignature, signature)) return false;

  const expiresAtStr = payload.split(':')[1];
  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}
