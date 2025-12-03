"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
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

export const ticketsTableColumns = (sectors: Sector[]): ColumnDef<Ticket>[] => [
  {
    id: "costumer_name",
    accessorKey: "costumer_name",
    header: "Nome do Consumidor",
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const label = getStatusLabel(status);
      const variant =
        statusStyles[status] ?? "bg-gray-100 text-gray-800 border-gray-200";

      return (
        <Badge
          variant="outline"
          className={`${variant} border px-2 py-0 text-xs font-medium whitespace-nowrap`}
        >
          {label}
        </Badge>
      );
    },
  },
  {
    id: "sector",
    header: "Setor",
    cell: ({ row }) => {
      const ticket = row.original;

      // Se for Renegociação, mostrar "Renegociação"
      if (ticket.service_type === "Renegociação") {
        return "Renegociação";
      }

      // Se for Serviço, mostrar o nome do setor
      if (ticket.service_type === "Serviço") {
        const sector = sectors.find((s) => s.id === ticket.sectorId);
        return sector?.name || "-";
      }

      // Fallback caso não tenha tipo definido
      return "-";
    },
  },
  {
    id: "createdAT",
    accessorKey: "createdAT",
    header: "Criado em",
    cell: ({ row }) => formatDate(row.original.createdAT),
  },
  {
    id: "calledAt",
    accessorKey: "calledAt",
    header: "Chamado em",
    cell: ({ row }) => formatDate(row.original.calledAt),
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const ticket = row.original;
      return <TableTicketActions ticket={ticket} sectors={sectors} />;
    },
  },
];
