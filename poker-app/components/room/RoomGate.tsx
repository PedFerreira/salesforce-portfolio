"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ensureSession, hasSession, joinRoom } from "@/lib/api";
import { storeIdentity, type StoredIdentity } from "@/lib/identity";
import { useIdentityStore } from "@/store/useIdentityStore";
import { getDeck } from "@/config/decks";
import { JoinForm } from "@/components/room/JoinForm";
import { RoomClient } from "@/components/room/RoomClient";
import type { RoomInfo } from "@/types/api";

type GateState =
  | { status: "checking" }
  | { status: "needs-session" }
  | { status: "ready"; room: RoomInfo }
  | { status: "not-found" }
  | { status: "error"; message: string };

/**
 * Substitui o SSR da antiga rota /sala/[roomId]: lê o `?id=` da URL,
 * garante a sessão anônima (com Turnstile na primeira visita) e entra na
 * sala via RPC `join_room`, que também diz se este navegador é o facilitador.
 */
export function RoomGate() {
  const roomId = useSearchParams().get("id") ?? "";
  const setIdentity = useIdentityStore((state) => state.setIdentity);
  const [state, setState] = useState<GateState>({ status: "checking" });

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;

    (async () => {
      try {
        if (!(await hasSession())) {
          if (!cancelled) setState({ status: "needs-session" });
          return;
        }
        const room = await joinRoom(roomId);
        if (cancelled) return;
        setState(room ? { status: "ready", room } : { status: "not-found" });
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Não foi possível abrir a sala.",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  /** Primeira visita (sem sessão): valida o captcha, cria a sessão e entra. */
  async function handleFirstJoin(identity: StoredIdentity, captchaToken: string | null) {
    await ensureSession(captchaToken ?? undefined);
    const room = await joinRoom(roomId);
    if (!room) {
      setState({ status: "not-found" });
      return;
    }
    storeIdentity(roomId, identity);
    setIdentity(identity);
    setState({ status: "ready", room });
  }

  if (!roomId || state.status === "not-found") {
    return <RoomNotFound />;
  }

  if (state.status === "checking") {
    return <p className="text-sm text-muted-foreground">Abrindo a sala…</p>;
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-destructive">{state.message}</p>
        <Link href="/" className="text-sm underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  if (state.status === "needs-session") {
    return <JoinForm withCaptcha onJoin={handleFirstJoin} />;
  }

  const { room } = state;
  const deck = getDeck(room.deckType);
  return (
    <RoomClient
      roomId={room.id}
      projectName={room.projectName}
      facilitatorName={room.facilitatorName}
      isFacilitator={room.isFacilitator}
      deckName={deck?.name ?? room.deckType}
      deckType={room.deckType}
    />
  );
}

function RoomNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">Sala não encontrada</h1>
      <p className="text-sm text-muted-foreground">
        O link pode estar incorreto ou a sala já foi encerrada.
      </p>
      <Link href="/" className="text-sm font-medium text-primary underline">
        Criar uma nova sala
      </Link>
    </div>
  );
}
