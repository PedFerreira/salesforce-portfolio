import { getSupabase } from "@/lib/supabase/client";

/**
 * Canal privado da sala: o Realtime só aceita a inscrição de quem é membro
 * (policies em realtime.messages — ver supabase/migrations/0001_schema.sql).
 * Antes de inscrever, o token da sessão anônima é repassado ao Realtime.
 */
export async function getRoomChannel(roomId: string, participantId: string) {
  const supabase = getSupabase();
  await supabase.realtime.setAuth();
  return supabase.channel(`room:${roomId}`, {
    config: { private: true, presence: { key: participantId } },
  });
}
