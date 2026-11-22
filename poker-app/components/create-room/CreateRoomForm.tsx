"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DECK_LIST } from "@/config/decks";
import { createRoom, ensureSession, hasSession } from "@/lib/api";
import { storeLastKnownRound } from "@/lib/round-cache";
import { Turnstile, captchaEnabled, type TurnstileHandle } from "@/components/auth/Turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateRoomForm() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [facilitatorName, setFacilitatorName] = useState("");
  const [deckType, setDeckType] = useState(DECK_LIST[0].key);
  const [ticketCode, setTicketCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Primeira visita: o Supabase só cria a sessão anônima com um token
      // válido do Turnstile. Visitas seguintes reaproveitam a sessão.
      if (captchaEnabled && !captchaToken && !(await hasSession())) {
        setError("Aguarde a verificação de segurança terminar.");
        return;
      }
      await ensureSession(captchaToken ?? undefined);

      const data = await createRoom({ projectName, facilitatorName, deckType, ticketCode });
      storeLastKnownRound(data.roomId, data.round);
      router.push(`/sala/?id=${encodeURIComponent(data.roomId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha de conexão. Tente novamente.");
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="projectName">Nome do projeto ou time</Label>
        <Input
          id="projectName"
          required
          maxLength={120}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Ex.: Portal do Cliente"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="facilitatorName">Seu nome (facilitador)</Label>
        <Input
          id="facilitatorName"
          required
          maxLength={60}
          value={facilitatorName}
          onChange={(e) => setFacilitatorName(e.target.value)}
          placeholder="Ex.: Ana Souza"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="deckType">Formato de votação</Label>
        <Select
          items={DECK_LIST.map((deck) => ({ value: deck.key, label: deck.name }))}
          value={deckType}
          onValueChange={(value) => value && setDeckType(value)}
        >
          <SelectTrigger id="deckType" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DECK_LIST.map((deck) => (
              <SelectItem key={deck.key} value={deck.key}>
                {deck.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="ticketCode">Primeiro ticket ou história</Label>
        <Input
          id="ticketCode"
          required
          maxLength={15}
          value={ticketCode}
          onChange={(e) => setTicketCode(e.target.value)}
          placeholder="Ex.: PROJ-123"
        />
      </div>

      <Turnstile ref={turnstileRef} onToken={setCaptchaToken} />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Criando sala…" : "Criar sala"}
      </Button>
    </form>
  );
}
