"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from "@/components/ui/alert-dialog";
import { closeRoom } from "@/lib/api";
import { cn } from "@/lib/utils";

export function CloseRoomButton({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClose() {
    if (closing) return;
    setClosing(true);
    setError(null);
    try {
      await closeRoom(roomId);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível encerrar a sala.");
    } finally {
      setClosing(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        Encerrar sala
      </AlertDialogTrigger>
      <AlertDialogPopup>
        <div className="flex flex-col gap-1">
          <AlertDialogTitle>Encerrar a sala?</AlertDialogTitle>
          <AlertDialogDescription>
            Todo mundo conectado vai ser desconectado imediatamente. Essa ação não pode ser desfeita.
          </AlertDialogDescription>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <AlertDialogFooter>
          <AlertDialogClose
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            disabled={closing}
          >
            Cancelar
          </AlertDialogClose>
          <Button type="button" variant="destructive" size="sm" onClick={handleClose} disabled={closing}>
            {closing ? "Encerrando…" : "Confirmar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
