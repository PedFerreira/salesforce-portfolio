import type { NextConfig } from "next";

/**
 * Export 100% estático, servido pelo GitHub Pages em
 * pedroferreira.site/poker junto com o portfólio. Não há servidor Node:
 * a regra de negócio vive em funções do Supabase (supabase/migrations).
 *
 * GitHub Pages não permite cabeçalhos HTTP customizados — a CSP vai como
 * <meta> em app/layout.tsx (ver lib/csp.ts).
 */
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "/poker",
  // /poker/sala/ -> out/sala/index.html, que o GitHub Pages serve direto.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
