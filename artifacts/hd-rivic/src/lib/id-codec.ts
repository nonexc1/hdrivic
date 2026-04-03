import CryptoJS from "crypto-js";

// AES-256-CBC with deterministic key+IV derived from passphrase.
// Deterministic = same ID always produces the same URL (required for shareable links).
// The random-salt format (U2FsdGVkX1...) cannot be used in URLs because the same
// ID would produce a different string on every render, breaking shared links.

const PASSPHRASE = "HdRivicGlobal#2024!Inmobiliaria";

// Derive a 32-byte key and 16-byte IV from the passphrase using SHA-256 / MD5
const KEY = CryptoJS.SHA256(PASSPHRASE);
const IV  = CryptoJS.MD5(PASSPHRASE);

function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafe(s: string): string {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  return b64;
}

export function encodePropertyId(id: number): string {
  const encrypted = CryptoJS.AES.encrypt(String(id), KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return toUrlSafe(encrypted.toString());
}

export function decodePropertyId(s: string): number {
  try {
    const decrypted = CryptoJS.AES.decrypt(fromUrlSafe(s), KEY, {
      iv: IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const plain = decrypted.toString(CryptoJS.enc.Utf8);
    const n = Number(plain);
    return Number.isFinite(n) && n > 0 ? n : NaN;
  } catch {
    return NaN;
  }
}
