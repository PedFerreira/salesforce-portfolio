import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Client único do navegador, com a chave pública (anon/publishable).
 * Criado sob demanda para o build estático não exigir as variáveis de
 * ambiente na hora de pré-renderizar as páginas.
 *
 * A sessão é anônima (Supabase Auth) e fica no localStorage: é ela que
 * identifica o navegador nas RPCs (auth.uid()) e autoriza os canais
 * Realtime privados da sala.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltam NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY no build."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "poker-auth" },
  });
  return client;
}
