import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";

/**
 * `supabase.channel(topic)` devolve o canal JÁ existente com o mesmo topic,
 * mesmo que ele esteja no meio de um unsubscribe. Se o efeito que abre o canal
 * rodar duas vezes seguidas (ex.: identidade definida e logo re-hidratada),
 * o segundo pegaria o canal que o primeiro está desmontando e ficaria preso
 * sem presence até recarregar a página. Por isso:
 *  - toda remoção passa por `closeRoomChannel` e fica registrada;
 *  - `openRoomChannel` espera essas remoções antes de criar um canal novo;
 *  - quem foi cancelado no meio do caminho nunca chega a criar canal.
 */
const pendingRemovals = new Set<Promise<unknown>>();

export function closeRoomChannel(channel: RealtimeChannel) {
  const removal: Promise<unknown> = getSupabase()
    .removeChannel(channel)
    .catch(() => undefined)
    .finally(() => pendingRemovals.delete(removal));
  pendingRemovals.add(removal);
}

/**
 * Canal privado da sala: o Realtime só aceita a inscrição de quem é membro
 * (policies em realtime.messages — ver supabase/migrations/0001_schema.sql).
 * Antes de inscrever, o token da sessão anônima é repassado ao Realtime.
 * Retorna null se `isCancelled()` virar true durante a preparação.
 */
export async function openRoomChannel(
  roomId: string,
  participantId: string,
  isCancelled: () => boolean
): Promise<RealtimeChannel | null> {
  const supabase = getSupabase();
  await supabase.realtime.setAuth();
  await Promise.all([...pendingRemovals]);
  if (isCancelled()) return null;

  const topic = `realtime:room:${roomId}`;
  const leftover = supabase.getChannels().find((c) => c.topic === topic);
  if (leftover) {
    await supabase.removeChannel(leftover).catch(() => undefined);
    if (isCancelled()) return null;
  }

  return supabase.channel(`room:${roomId}`, {
    config: { private: true, presence: { key: participantId } },
  });
}
