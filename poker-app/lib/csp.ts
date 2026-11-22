/**
 * Content-Security-Policy entregue via <meta> (o GitHub Pages não permite
 * cabeçalhos HTTP). `frame-ancestors` não funciona em <meta>, por isso não
 * aparece aqui.
 *
 * - connect-src: REST/RPC + Realtime (WebSocket) do Supabase.
 * - script-src/frame-src: widget do Cloudflare Turnstile.
 * - 'unsafe-inline' em scripts: o export estático do Next.js injeta scripts
 *   inline de hidratação e não há servidor para gerar nonces.
 */
const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

function supabaseOrigins(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  try {
    const { origin } = new URL(url);
    return `${origin} ${origin.replace(/^http/, "ws")}`;
  } catch {
    return "";
  }
}

export function buildCsp(): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${TURNSTILE_ORIGIN}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self' ${supabaseOrigins()}`.trim(),
    `frame-src ${TURNSTILE_ORIGIN}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
