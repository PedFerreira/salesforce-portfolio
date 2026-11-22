import { Suspense } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { RoomGate } from "@/components/room/RoomGate";

export const metadata: Metadata = {
  title: "Sala · Planning Poker",
  // Link de sala é privado por natureza — não deve ser indexado.
  robots: { index: false, follow: false },
};

/**
 * Rota estática única (/poker/sala/?id=XXXX). O ID vem da query string
 * porque o export estático não suporta rotas dinâmicas sem IDs conhecidos
 * no build; todo o resto acontece no navegador (RoomGate).
 */
export default function RoomPage() {
  return (
    <div className="bg-table flex min-h-screen flex-1 flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Abrindo a sala…</p>}>
          <RoomGate />
        </Suspense>
      </div>
    </div>
  );
}
