const ALPHABET = "7xqz3nBf0Wp4KsLvHGdMeYRJ5TkXgA9mUrNyZ1bQoIcEi2wOPtCF8hDjSaVu6l";
const BASE = ALPHABET.length;

export function encodePropertyId(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return String(n);
  let result = "";
  let num = n;
  while (num > 0) {
    result = ALPHABET[num % BASE] + result;
    num = Math.floor(num / BASE);
  }
  return result;
}

export function decodePropertyId(s: string): number {
  let result = 0;
  for (const char of s) {
    const idx = ALPHABET.indexOf(char);
    if (idx === -1) return NaN;
    result = result * BASE + idx;
  }
  return result;
}
