import { z } from "zod";
import { DECK_LIST } from "@/config/decks";
import { RoundMirrorSchema } from "@/types/realtime";

const deckKeys = DECK_LIST.map((deck) => deck.key) as [string, ...string[]];

export const CreateRoomInputSchema = z.object({
  projectName: z.string().trim().min(1).max(120),
  facilitatorName: z.string().trim().min(1).max(60),
  deckType: z.enum(deckKeys),
  ticketCode: z.string().trim().min(1).max(15),
});
export type CreateRoomInput = z.infer<typeof CreateRoomInputSchema>;

/** Resposta de public.create_room() */
export const CreateRoomResultSchema = z.object({
  roomId: z.string(),
  round: RoundMirrorSchema,
});
export type CreateRoomResult = z.infer<typeof CreateRoomResultSchema>;

/** Resposta de public.join_room() — dados públicos da sala + papel de quem entrou. */
export const RoomInfoSchema = z.object({
  id: z.string(),
  projectName: z.string(),
  facilitatorName: z.string(),
  deckType: z.string(),
  createdAt: z.string(),
  isFacilitator: z.boolean(),
});
export type RoomInfo = z.infer<typeof RoomInfoSchema>;
