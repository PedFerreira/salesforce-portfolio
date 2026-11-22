import { customAlphabet } from "nanoid";

// ID de participante na presence (não é credencial — a autorização vem da
// sessão anônima do Supabase). O ID da sala é gerado no banco.
export const generateParticipantId = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  16
);
