import { ShareLink } from "@/components/room/ShareLink";

export function RoomHeader({
  projectName,
  facilitatorName,
  deckName,
  ticketCode,
}: {
  projectName: string;
  facilitatorName: string;
  deckName: string;
  ticketCode?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold">{projectName}</h1>
        <p className="text-sm text-muted-foreground">
          Facilitador: {facilitatorName} · Baralho: {deckName}
        </p>
        {ticketCode && (
          <p className="mt-1 text-sm">
            Ticket atual: <span className="font-medium">{ticketCode}</span>
          </p>
        )}
      </div>
      <ShareLink />
    </div>
  );
}
