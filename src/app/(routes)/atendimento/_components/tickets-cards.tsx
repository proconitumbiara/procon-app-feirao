"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sectorsTable, ticketsTable } from "@/db/schema";

import TableTicketActions from "./table-actions";

type Ticket = typeof ticketsTable.$inferSelect;
type Sector = typeof sectorsTable.$inferSelect;

const formatDate = (date: Date | null | undefined): string => {
  if (!date) return "-";
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusMap: Record<string, string> = {
  pending: "Pendente",
  completed: "Concluído",
  canceled: "Cancelado",
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  canceled: "bg-red-100 text-red-800 border-red-200",
};

const getStatusLabel = (status: string): string => statusMap[status] || status;

interface TicketsCardsProps {
  tickets: Ticket[];
  sectors: Sector[];
}

export default function TicketsCards({ tickets, sectors }: TicketsCardsProps) {
  if (tickets.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-center text-muted-foreground">
        Nenhum ticket encontrado.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {tickets.map((ticket) => {
        const sector = sectors.find((s) => s.id === ticket.sectorId);
        const status = ticket.status;
        const label = getStatusLabel(status);
        const variant =
          statusStyles[status] ?? "bg-gray-100 text-gray-800 border-gray-200";

        return (
          <Card key={ticket.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{ticket.costumer_name}</CardTitle>
                <Badge
                  variant="outline"
                  className={`${variant} border px-2 py-0 text-xs font-medium whitespace-nowrap`}
                >
                  {label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Setor:</span>
                  <span className="font-medium">{sector?.name || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span className="font-medium">{formatDate(ticket.createdAT)}</span>
                </div>
                {ticket.calledAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Chamado em:</span>
                    <span className="font-medium">{formatDate(ticket.calledAt)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <TableTicketActions ticket={ticket} sectors={sectors} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

