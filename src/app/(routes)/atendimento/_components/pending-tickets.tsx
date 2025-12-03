"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { sectorsTable } from "@/db/schema";
import { useTicketsWebSocket } from "@/hooks/use-tickets-websocket";

import CallNextTicketButton from "./call-next-ticket-button";
import { ticketsTableColumns, TicketTableRow } from "./tickets-table-columns";

type Sector = typeof sectorsTable.$inferSelect;

interface PendingTicketsProps {
  initialTickets: TicketTableRow[];
  sectors: Sector[];
}

const fetchTickets = async () => {
  const res = await fetch(
    "/api/tickets?status=pending&service_type=Renegociação",
    { credentials: "same-origin" },
  );
  if (!res.ok) {
    if (res.status === 401) throw new Error("unauthorized");
    throw new Error("Erro ao buscar tickets");
  }
  const data = await res.json();
  return data.tickets || [];
};

export default function PendingTickets({
  initialTickets,
  sectors,
}: PendingTicketsProps) {
  const [tableData, setTableData] = useState<TicketTableRow[]>(initialTickets);
  const router = useRouter();

  // Criar map de setores
  const sectorsMap = useMemo(
    () => Object.fromEntries(sectors.map((s) => [s.id, s.name])),
    [sectors],
  );

  const loadData = useCallback(async () => {
    try {
      const tickets = await fetchTickets();

      // Processar tickets recebidos da API
      const mapped: TicketTableRow[] = tickets
        .map(
          (ticket: {
            id: string;
            status: string;
            costumer_name: string;
            sectorId: string | null;
            createdAT: string;
            createdAt?: string;
          }) => ({
            id: ticket.id,
            status: ticket.status,
            priority: 0,
            clientName: ticket.costumer_name,
            clientId: ticket.costumer_name,
            sectorName: ticket.sectorId
              ? sectorsMap[ticket.sectorId] || "Renegociação"
              : "Renegociação",
            sectorId: ticket.sectorId || "",
            createdAt: new Date(
              ticket.createdAT ?? ticket.createdAt ?? new Date(),
            ),
          }),
        )
        .sort(
          (a: TicketTableRow, b: TicketTableRow) =>
            a.createdAt.getTime() - b.createdAt.getTime(),
        );
      setTableData(mapped);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "unauthorized") {
        router.replace("/");
      }
    }
  }, [router, sectorsMap]);

  // Conectar ao WebSocket para atualizações em tempo real
  useTicketsWebSocket(loadData);

  useEffect(() => {
    // Manter polling como fallback, mas com intervalo maior (60s)
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (!tableData.length) {
    return (
      <Card className="text-muted-foreground h-full w-full text-center text-sm">
        Nenhum atendimento pendente.
      </Card>
    );
  }

  return (
    <div className="flex h-full max-h-[80vh] w-full flex-col gap-4">
      <Card className="flex h-full w-full flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Atendimentos Pendentes</CardTitle>
          {tableData.length > 0 && (
            <CallNextTicketButton
              sectorId={
                tableData[0].sectorId ? tableData[0].sectorId : undefined
              }
            />
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <div className="p-6">
            <DataTable data={tableData} columns={ticketsTableColumns} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
