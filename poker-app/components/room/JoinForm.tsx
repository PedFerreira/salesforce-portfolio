"use client";

import { useRef, useState, type FormEvent } from "react";
import { PARTICIPANT_ROLES, type ParticipantRole } from "@/types/domain";
import { generateParticipantId } from "@/lib/ids";
import type { StoredIdentity } from "@/lib/identity";
import { Turnstile, captchaEnabled, type TurnstileHandle } from "@/components/auth/Turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Coleta nome/cargo. Com `withCaptcha`, quem ainda não tem sessão anônima
 * passa pelo Turnstile antes de entrar (o token vai junto em `onJoin`).
 */
export function JoinForm({
  projectName,
  withCaptcha = false,
  onJoin,
}: {
  projectName?: string;
  withCaptcha?: boolean;
  onJoin: (identity: StoredIdentity, captchaToken: string | null) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<ParticipantRole>(PARTICIPANT_ROLES[0]);
  const [roleOther, setRoleOther] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const needsCaptcha = withCaptcha && captchaEnabled;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Informe seu nome.");
      return;
    }
    if (role === "Outro" && !roleOther.trim()) {
      setError("Descreva seu cargo.");
      return;
    }
    if (needsCaptcha && !captchaToken) {
      setError("Aguarde a verificação de segurança terminar.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onJoin(
        {
          participantId: generateParticipantId(),
          name: trimmedName,
          role,
          roleOther: role === "Outro" ? roleOther.trim() : undefined,
        },
        captchaToken
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar na sala.");
      turnstileRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Entrar na sala</CardTitle>
        <p className="text-sm text-muted-foreground">
          {projectName ? (
            <>
              Você foi convidado para <strong className="text-foreground">{projectName}</strong>.
              {" "}
            </>
          ) : null}
          Diga quem você é para entrar na mesa de votação.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="name">Seu nome</Label>
            <Input
              id="name"
              required
              autoFocus
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Ana Souza"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Cargo</Label>
            <Select
              value={role}
              onValueChange={(value) => value && setRole(value as ParticipantRole)}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PARTICIPANT_ROLES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {role === "Outro" && (
            <div className="grid gap-2">
              <Label htmlFor="roleOther">Qual cargo?</Label>
              <Input
                id="roleOther"
                required
                maxLength={60}
                value={roleOther}
                onChange={(e) => setRoleOther(e.target.value)}
                placeholder="Ex.: UX Designer"
              />
            </div>
          )}

          {needsCaptcha && <Turnstile ref={turnstileRef} onToken={setCaptchaToken} />}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
