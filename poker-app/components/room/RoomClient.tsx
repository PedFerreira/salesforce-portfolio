"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredIdentity, storeIdentity, type StoredIdentity } from "@/lib/identity";
import { generateParticipantId } from "@/lib/ids";
import { getOwnVote, storeOwnVote, clearOwnVote } from "@/lib/vote-storage";
import { getLastKnownRound } from "@/lib/round-cache";
import { deriveRevealedVotes, deriveVoteStats } from "@/lib/round-gossip";
import { revealRound, startRound as startRoundRpc, touchRoom } from "@/lib/api";
import { isValidCardValue } from "@/config/decks";
import { useIdentityStore } from "@/store/useIdentityStore";
import { useRoomChannel } from "@/lib/realtime/use-room-channel";
import { JoinForm } from "@/components/room/JoinForm";
import { RoomHeader } from "@/components/room/RoomHeader";
import { VotingTable } from "@/components/room/VotingTable";
import { DeckFooter } from "@/components/room/DeckFooter";
import { ResultsPanel } from "@/components/room/ResultsPanel";
import { NextTicketForm } from "@/components/room/NextTicketForm";
import { ConnectionBanner } from "@/components/room/ConnectionBanner";
import { CloseRoomButton } from "@/components/room/CloseRoomButton";
import { Button } from "@/components/ui/button";
import type { RoundMirror } from "@/types/realtime";

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

export function RoomClient({
  roomId,
  projectName,
  facilitatorName,
  isFacilitator,
  deckName,
  deckType,
}: {
  roomId: string;
  projectName: string;
  facilitatorName: string;
  /** Vem do banco (room_members.is_facilitator) — não é mais um token local. */
  isFacilitator: boolean;
  deckName: string;
  deckType: string;
}) {
  const router = useRouter();
  const identity = useIdentityStore((state) => state.identity);
  const hydrated = useIdentityStore((state) => state.hydrated);
  const hydrate = useIdentityStore((state) => state.hydrate);
  const setIdentity = useIdentityStore((state) => state.setIdentity);

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [syncedRoundId, setSyncedRoundId] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [startingRound, setStartingRound] = useState(false);
  const [showNextTicketForm, setShowNextTicketForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [closedMessage, setClosedMessage] = useState<string | null>(null);
  const revealedRoundIdRef = useRef<string | null>(null);
  const [initialRound] = useState<RoundMirror | null>(() =>
    typeof window === "undefined" ? null : getLastKnownRound(roomId)
  );

  useEffect(() => {
    const stored = getStoredIdentity(roomId);
    if (stored) {
      hydrate(stored);
      return;
    }

    // Quem criou a sala já informou o nome no formulário — entra direto.
    if (isFacilitator) {
      const facilitatorIdentity: StoredIdentity = {
        participantId: generateParticipantId(),
        name: facilitatorName,
        role: "Outro",
        roleOther: "Facilitador",
      };
      storeIdentity(roomId, facilitatorIdentity);
      hydrate(facilitatorIdentity);
      return;
    }

    hydrate(null);
  }, [roomId, hydrate, facilitatorName, isFacilitator]);

  function handleRoomClosed(reason: "inactivity" | "manual") {
    setClosedMessage(
      reason === "manual"
        ? "O facilitador encerrou esta sala."
        : "Esta sala foi encerrada por inatividade."
    );
    setTimeout(() => router.push("/"), 3000);
  }

  const { participants, round, connectionStatus, castVote, retractVote, revealOwnVote } =
    useRoomChannel(roomId, identity, initialRound, handleRoomClosed);

  // Restaura a seleção da própria carta (guardada localmente, nunca no
  // servidor) sempre que a rodada em votação muda — ajuste de estado durante
  // a renderização (não em efeito), padrão do React pra "resetar estado
  // quando uma prop muda".
  if (round && round.status === "voting" && round.id !== syncedRoundId) {
    setSyncedRoundId(round.id);
    const stored = getOwnVote(roomId);
    setSelectedCard(stored && stored.roundId === round.id ? stored.cardValue : null);
  }

  // Ao ver a rodada virar "revealed", revela o valor guardado localmente (se
  // houver) na própria presence — o banco nunca teve esse valor.
  useEffect(() => {
    if (!round || round.status !== "revealed") return;
    if (revealedRoundIdRef.current === round.id) return;
    revealedRoundIdRef.current = round.id;

    const stored = getOwnVote(roomId);
    if (stored && stored.roundId === round.id) {
      void revealOwnVote(stored.cardValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, round?.id, round?.status, revealOwnVote]);

  // Sinal de atividade: mantém a sala viva enquanto alguém está nela
  // (o pg_cron encerra salas sem atividade há mais de 1h).
  useEffect(() => {
    if (!identity) return;
    function ping() {
      void touchRoom(roomId).catch(() => undefined);
    }
    ping();
    const interval = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [roomId, identity]);

  async function handleSelectCard(cardValue: string) {
    if (!identity || !round || round.status !== "voting") return;
    if (!isValidCardValue(deckType, cardValue)) return;
    setActionError(null);

    const isRetracting = selectedCard === cardValue;

    if (isRetracting) {
      clearOwnVote(roomId);
      setSelectedCard(null);
      await retractVote();
    } else {
      storeOwnVote(roomId, { roundId: round.id, cardValue });
      setSelectedCard(cardValue);
      await castVote();
    }
  }

  async function handleReveal() {
    if (!isFacilitator || !round || revealing) return;
    setRevealing(true);
    setActionError(null);
    try {
      await revealRound(roomId, round.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível revelar as cartas.");
    } finally {
      setRevealing(false);
    }
  }

  async function handleRevote() {
    if (!round) return;
    await startRound(round.ticketCode);
  }

  async function handleNextTicket(fields: { ticketCode: string }) {
    await startRound(fields.ticketCode);
  }

  async function startRound(ticketCode: string) {
    if (!isFacilitator || startingRound) return;
    setStartingRound(true);
    setActionError(null);
    try {
      await startRoundRpc(roomId, ticketCode);
      clearOwnVote(roomId);
      setSelectedCard(null);
      setShowNextTicketForm(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível iniciar a rodada.");
    } finally {
      setStartingRound(false);
    }
  }

  function handleJoin(newIdentity: StoredIdentity) {
    storeIdentity(roomId, newIdentity);
    setIdentity(newIdentity);
  }

  if (!hydrated) {
    return null;
  }

  if (closedMessage) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-lg font-semibold">{closedMessage}</p>
        <p className="text-sm text-muted-foreground">Voltando para o início…</p>
      </div>
    );
  }

  if (!identity) {
    return <JoinForm projectName={projectName} onJoin={handleJoin} />;
  }

  if (!round) {
    return <p className="text-sm text-muted-foreground">Sincronizando com a sala…</p>;
  }

  const revealed = round.status === "revealed";
  const revealedVotes = revealed ? deriveRevealedVotes(participants, round.id) : null;
  const stats = revealedVotes ? deriveVoteStats(deckType, revealedVotes) : null;
  const canVote = identity.role !== "Observador";

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 pb-28">
      <ConnectionBanner status={connectionStatus} />

      <RoomHeader
        projectName={projectName}
        facilitatorName={facilitatorName}
        deckName={deckName}
        ticketCode={round.ticketCode}
      />

      {isFacilitator && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {!revealed && (
            <Button type="button" onClick={handleReveal} disabled={revealing}>
              {revealing ? "Revelando…" : "Revelar cartas"}
            </Button>
          )}
          {revealed && !showNextTicketForm && (
            <>
              <Button type="button" variant="outline" onClick={handleRevote} disabled={startingRound}>
                {startingRound ? "Criando…" : "Nova rodada"}
              </Button>
              <Button type="button" onClick={() => setShowNextTicketForm(true)} disabled={startingRound}>
                Próximo ticket
              </Button>
            </>
          )}
          <CloseRoomButton roomId={roomId} />
        </div>
      )}

      {isFacilitator && showNextTicketForm && (
        <NextTicketForm
          submitting={startingRound}
          onSubmit={handleNextTicket}
          onCancel={() => setShowNextTicketForm(false)}
        />
      )}

      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      <VotingTable
        participants={participants}
        selfId={identity.participantId}
        deckType={deckType}
        revealed={revealed}
        revealedVotes={revealedVotes}
      />

      {revealed && stats && <ResultsPanel deckType={deckType} stats={stats} />}

      {!revealed && canVote && (
        <DeckFooter
          deckType={deckType}
          selectedValue={selectedCard}
          disabled={round.status !== "voting"}
          onSelect={handleSelectCard}
        />
      )}

      {!revealed && !canVote && (
        <p className="text-center text-sm text-muted-foreground">
          Observadores acompanham a rodada sem votar.
        </p>
      )}
    </div>
  );
}
