import { getSupabase } from "@/lib/supabase/client";
import {
  CreateRoomInputSchema,
  CreateRoomResultSchema,
  RoomInfoSchema,
  type CreateRoomInput,
  type CreateRoomResult,
  type RoomInfo,
} from "@/types/api";
import { RoundMirrorSchema, type RoundMirror } from "@/types/realtime";

/**
 * Fronteira única entre a UI e o Supabase. Substitui as antigas rotas
 * /api do Next.js: cada função chama uma RPC `security definer` definida em
 * supabase/migrations/0001_schema.sql, que faz a validação e a autorização.
 */

const FRIENDLY_ERRORS: Record<string, string> = {
  rate_limited: "Você criou muitas salas na última hora. Tente novamente mais tarde.",
  capacity_reached:
    "Estamos com muitas salas ativas agora. Tente novamente em alguns minutos.",
  room_full: "Esta sala atingiu o limite de participantes.",
  forbidden: "Só o facilitador da sala pode fazer isso.",
  invalid_input: "Confira os dados informados.",
  not_authenticated: "Sua sessão expirou. Recarregue a página.",
};

export class ApiError extends Error {}

function toApiError(error: { message?: string } | null, fallback: string): ApiError {
  const code = error?.message ?? "";
  return new ApiError(FRIENDLY_ERRORS[code] ?? fallback);
}

// --------------------------------------------------------------------------
// Sessão anônima
// --------------------------------------------------------------------------
export async function hasSession(): Promise<boolean> {
  const { data } = await getSupabase().auth.getSession();
  return Boolean(data.session);
}

/**
 * Garante uma sessão anônima. Na primeira visita o Supabase exige o token
 * do Cloudflare Turnstile (proteção contra bots configurada no projeto).
 */
export async function ensureSession(captchaToken?: string): Promise<void> {
  if (await hasSession()) return;
  const { error } = await getSupabase().auth.signInAnonymously({
    options: captchaToken ? { captchaToken } : undefined,
  });
  if (error) {
    throw new ApiError("Não foi possível validar que você é humano. Tente novamente.");
  }
}

// --------------------------------------------------------------------------
// Salas
// --------------------------------------------------------------------------
export async function createRoom(input: CreateRoomInput): Promise<CreateRoomResult> {
  const parsed = CreateRoomInputSchema.parse(input);
  const { data, error } = await getSupabase().rpc("create_room", {
    p_project_name: parsed.projectName,
    p_facilitator_name: parsed.facilitatorName,
    p_deck_type: parsed.deckType,
    p_ticket_code: parsed.ticketCode,
  });
  if (error) throw toApiError(error, "Não foi possível criar a sala.");
  return CreateRoomResultSchema.parse(data);
}

/** Entra na sala e devolve os dados dela; `null` se ela não existe mais. */
export async function joinRoom(roomId: string): Promise<RoomInfo | null> {
  const { data, error } = await getSupabase().rpc("join_room", { p_room_id: roomId });
  if (error) throw toApiError(error, "Não foi possível entrar na sala.");
  if (data === null) return null;
  return RoomInfoSchema.parse(data);
}

export async function touchRoom(roomId: string): Promise<void> {
  await getSupabase().rpc("touch_room", { p_room_id: roomId });
}

export async function startRound(roomId: string, ticketCode: string): Promise<RoundMirror> {
  const { data, error } = await getSupabase().rpc("start_round", {
    p_room_id: roomId,
    p_ticket_code: ticketCode,
  });
  if (error) throw toApiError(error, "Não foi possível iniciar a rodada.");
  return RoundMirrorSchema.parse(data);
}

export async function revealRound(roomId: string, roundId: string): Promise<void> {
  const { error } = await getSupabase().rpc("reveal_round", {
    p_room_id: roomId,
    p_round_id: roundId,
  });
  if (error) throw toApiError(error, "Não foi possível revelar as cartas.");
}

export async function closeRoom(roomId: string): Promise<void> {
  const { error } = await getSupabase().rpc("close_room", { p_room_id: roomId });
  if (error) throw toApiError(error, "Não foi possível encerrar a sala.");
}
